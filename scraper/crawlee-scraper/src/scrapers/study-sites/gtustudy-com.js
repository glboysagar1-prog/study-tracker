import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * GTUStudy.com Scraper
 * Scrapes notes, papers, and books from gtustudy.com
 */
export async function scrapeGTUStudyCom(subjectName, subjectCode) {
    console.log(`📚 Scraping GTUStudy.com for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 30,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });
                const title = await page.title();

                // 1. Look for PDF links (Notes, Papers, Books)
                const pdfLinks = await page.$$eval('a[href$=".pdf"], a[href*="drive.google.com"], a[href*="dropbox"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim() || link.title || ''
                    }))
                );

                for (const link of pdfLinks) {
                    let type = 'Study Note';
                    const lowerText = link.text.toLowerCase();
                    if (lowerText.includes('paper') || lowerText.includes('exam')) type = 'Question Paper';
                    else if (lowerText.includes('book')) type = 'Reference Book';

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(link.text),
                        title: `${type}: ${link.text || subjectCode}`,
                        description: `${type} from GTUStudy.com`,
                        file_url: link.href,
                        source_url: request.url,
                        source_name: 'GTUStudy.com'
                    });
                }

                // 2. Extract page content for syllabus
                const content = await page.$eval('.entry-content, .post-content, main, article',
                    el => el.innerText).catch(() => null);

                if (content && content.length > 200) {
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(title),
                        unit_title: title,
                        topic: title.substring(0, 100),
                        content: content.substring(0, 5000),
                        source_url: request.url
                    });
                }

                // Enqueue internal links
                await enqueueLinks({
                    globs: [
                        `**/*${subjectCode}*/**`,
                        `**/*${subjectName.replace(/\\s+/g, '-').toLowerCase()}*/**`,
                        '**/notes/**',
                        '**/syllabus/**',
                        '**/papers/**'
                    ],
                    label: 'GTUSTUDY_COM'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    // Try multiple URL patterns
    const startUrls = [
        `${GTU_STUDY_SITES.gtuStudyCom}/${subjectCode}`,
        `${GTU_STUDY_SITES.gtuStudyCom}/search?q=${encodeURIComponent(subjectName)}`,
        GTU_STUDY_SITES.gtuStudyCom
    ];

    await crawler.run(startUrls);
    console.log(`✅ GTUStudy.com scraping completed for ${subjectName}`);
}

function extractUnitNumber(text) {
    if (!text) return 1;
    const match = text.match(/unit\\s*(\\d+)/i);
    return match ? parseInt(match[1]) : 1;
}
