import { PlaywrightCrawler, Dataset } from 'crawlee';
import { saveNotePDF, saveSyllabusContent, saveCircular, saveExamSchedule } from '../database.js';
import { GTU_PATTERNS } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GTU Official Website Scraper
 * Scrapes syllabus PDFs, circulars, and exam schedules
 */
export async function scrapeGTUOfficial(startUrls = []) {
    console.log('🎓 Starting GTU Official Website Scraper...');

    // Ensure PDF storage directory exists
    const pdfDir = path.join(__dirname, '../../../..', 'tmp', 'gtu_pdfs');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 100,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, enqueueLinks, log }) {
            log.info(`Processing: ${request.url} `);

            try {
                // Wait for page to load
                await page.waitForLoadState('networkidle', { timeout: 30000 });

                // Extract page title
                const title = await page.title();
                log.info(`Page title: ${title} `);

                // Handle Circulars Page
                if (request.url.includes('Circular.aspx')) {
                    await scrapeCirculars(page, log);
                }

                // Handle Exam Schedule Page
                else if (request.url.includes('ExamSchedule') || request.url.includes('TimeTable')) {
                    await scrapeExamSchedules(page, log);
                }

                // Handle Syllabus/Downloads (Existing logic)
                else {
                    // Find all PDF links
                    const pdfLinks = await page.$$eval('a[href$=".pdf"], a[href*=".pdf"]', links =>
                        links.map(link => ({
                            href: link.href,
                            text: link.textContent.trim()
                        }))
                    );

                    if (pdfLinks.length > 0) {
                        log.info(`Found ${pdfLinks.length} PDF links`);

                        for (const pdfLink of pdfLinks) {
                            await processPDFLink(pdfLink, request.url, page, log, pdfDir);
                        }
                    }

                    // Extract syllabus content from the page
                    const syllabusContent = await extractSyllabusContent(page, request.url);
                    if (syllabusContent) {
                        await saveSyllabusContent(syllabusContent);
                    }
                }

                // Enqueue related links (same domain, syllabus-related)
                await enqueueLinks({
                    globs: [
                        '**/syllabus/**',
                        '**/curriculum/**',
                        '**/academics/**',
                        '**/Circular.aspx**',
                        '**/ExamSchedule**',
                        '**/TimeTable**'
                    ],
                    label: 'GTU_PAGE'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: `, error.message);
            }
        },

        failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed multiple times`);
        }
    });

    // Add start URLs
    if (startUrls.length === 0) {
        // Default GTU syllabus URLs
        startUrls = [
            'https://www.gtu.ac.in/syllabus.aspx',
            'https://www.gtu.ac.in/Circular.aspx',
            'https://timetable.gtu.ac.in/' // Corrected URL
        ];
    }

    await crawler.run(startUrls);
    console.log('✅ GTU scraping completed');
}

/**
 * Scrape Circulars
 */
async function scrapeCirculars(page, log) {
    log.info('📢 Scraping Circulars...');

    // Select circular rows (adjust selector based on actual site structure)
    const circulars = await page.$$eval('table#ContentPlaceHolder1_gvCircular tr', rows => {
        return rows.slice(1).map(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 2) return null;

            const dateText = cols[0]?.textContent?.trim();
            const link = cols[1]?.querySelector('a');

            return {
                title: link?.textContent?.trim() || cols[1]?.textContent?.trim(),
                circular_date: dateText, // Needs parsing
                pdf_url: link?.href,
                category: 'General'
            };
        }).filter(c => c && c.title);
    });

    for (const circular of circulars) {
        if (circular.title) {
            // Parse date (DD-MM-YYYY to YYYY-MM-DD)
            const dateParts = circular.circular_date?.split('-');
            let formattedDate = null;
            if (dateParts && dateParts.length === 3) {
                formattedDate = `${dateParts[2]} -${dateParts[1]} -${dateParts[0]} `;
            }

            await saveCircular({
                title: circular.title,
                content: circular.title, // Use title as content for now
                circular_date: formattedDate || new Date().toISOString(),
                pdf_url: circular.pdf_url,
                category: circular.category
            });
        }
    }
    log.info(`✓ Processed ${circulars.length} circulars`);
}

/**
 * Scrape Exam Schedules
 */
async function scrapeExamSchedules(page, log) {
    log.info('🗓 Scraping Exam Schedules...');

    // Adjust selector based on actual site
    const schedules = await page.$$eval('table tr', rows => {
        return rows.slice(1).map(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 3) return null;

            const link = row.querySelector('a');

            return {
                exam_name: cols[1]?.textContent?.trim(),
                exam_date: null, // Often in title
                announcement_url: link?.href
            };
        }).filter(s => s && s.exam_name);
    });

    for (const schedule of schedules) {
        await saveExamSchedule({
            exam_name: schedule.exam_name,
            exam_date: new Date().toISOString(), // Placeholder
            subject_code: null,
            time_slot: null,
            announcement_url: schedule.announcement_url
        });
    }
    log.info(`✓ Processed ${schedules.length} exam schedules`);
}

/**
 * Process a PDF link - download and save metadata
 */
async function processPDFLink(pdfLink, pageUrl, page, log, pdfDir) {
    try {
        const pdfUrl = pdfLink.href;
        const pdfText = pdfLink.text;

        log.info(`📄 Processing PDF: ${pdfText || pdfUrl} `);

        // Try to extract subject code from link text or URL
        const subjectCodeMatch = pdfUrl.match(GTU_PATTERNS.subjectCodePattern) ||
            pdfText.match(GTU_PATTERNS.subjectCodePattern);

        if (!subjectCodeMatch) {
            // log.warning(`Could not extract subject code from: ${ pdfText } `);
            // Still save circulars even if no subject code
            if (pageUrl.includes('Circular')) {
                // Already handled by scrapeCirculars
            }
            return;
        }

        const subjectCode = subjectCodeMatch[0];

        // Determine unit number (if present)
        const unitMatch = pdfText.match(/unit[\s-]*(\d+)/i) || pdfUrl.match(/unit[\s-]*(\d+)/i);
        const unitNumber = unitMatch ? parseInt(unitMatch[1]) : 1;

        // Download PDF
        const pdfFilename = `${subjectCode}_Unit${unitNumber} _GTU_Official.pdf`;
        const pdfPath = path.join(pdfDir, pdfFilename);

        // Use Playwright to download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

        // Trigger download
        try {
            await page.goto(pdfUrl);
        } catch (e) {
            // Ignore navigation errors for downloads
        }

        const download = await downloadPromise;
        if (download) {
            await download.saveAs(pdfPath);
            log.info(`✓ Downloaded: ${pdfFilename} `);

            // Save to database
            await saveNotePDF({
                subject_code: subjectCode,
                unit: unitNumber,
                title: pdfText || `${subjectCode} - Unit ${unitNumber} (GTU Official)`,
                description: `Official GTU syllabus PDF from ${pageUrl} `,
                file_url: `/ api / pdf / ${pdfFilename} `,
                source_url: pdfUrl,
                source_name: 'GTU Official'
            });
        }

    } catch (error) {
        log.error(`Error downloading PDF ${pdfLink.href}: `, error.message);
    }
}

/**
 * Extract syllabus content from the page
 */
async function extractSyllabusContent(page, url) {
    try {
        // Look for common syllabus content patterns
        const content = await page.$$eval('div.content, div.syllabus, article, main', elements => {
            return elements.map(el => el.textContent.trim()).join('\n\n');
        });

        if (!content || content.length < 100) {
            return null;
        }

        // Try to extract subject code
        const subjectCodeMatch = content.match(/\b\d{7}\b/);
        if (!subjectCodeMatch) {
            return null;
        }

        return {
            subject_code: subjectCodeMatch[0],
            unit: 1, // Default to unit 1
            unit_title: 'General Information',
            topic: 'Syllabus Overview',
            content: content.substring(0, 3000), // Limit content length
            source_url: url
        };

    } catch (error) {
        return null;
    }
}
