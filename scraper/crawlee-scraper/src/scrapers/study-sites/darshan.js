import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * Darshan University GTU Materials Scraper
 * Scrapes well-structured lecture notes from darshan.ac.in
 */
export async function scrapeDarshan(subjectName, subjectCode) {
    console.log(`🎓 Scraping Darshan University for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });

                // Darshan has well-organized tables with materials
                const tableRows = await page.$$eval('table tr, .material-list li, .resource-item', rows =>
                    rows.map(row => ({
                        text: row.textContent.trim(),
                        links: Array.from(row.querySelectorAll('a[href$=".pdf"], a[href$=".ppt"], a[href$=".pptx"]'))
                            .map(a => ({ href: a.href, text: a.textContent.trim() }))
                    })).filter(r => r.links.length > 0)
                );

                for (const row of tableRows) {
                    for (const link of row.links) {
                        // Determine type from text
                        let type = 'Lecture Notes';
                        const lowerText = (link.text + ' ' + row.text).toLowerCase();

                        if (lowerText.includes('lab')) type = 'Lab Manual';
                        else if (lowerText.includes('paper')) type = 'Question Paper';
                        else if (lowerText.includes('ppt')) type = 'Lecture Presentation';
                        else if (lowerText.includes('tutorial')) type = 'Tutorial';

                        await saveNotePDF({
                            subject_code: subjectCode,
                            unit: extractUnitNumber(row.text),
                            title: link.text || `Darshan ${type} - ${subjectCode}`,
                            description: `${type} from Darshan University`,
                            file_url: link.href,
                            source_url: request.url,
                            source_name: 'Darshan University'
                        });
                    }
                }

                // Also look for direct PDF links anywhere on page
                const allPdfLinks = await page.$$eval('a[href$=".pdf"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim() || link.title || ''
                    }))
                );

                for (const link of allPdfLinks) {
                    // Skip if already processed in table
                    const alreadyProcessed = tableRows.some(r =>
                        r.links.some(l => l.href === link.href)
                    );

                    if (!alreadyProcessed) {
                        await saveNotePDF({
                            subject_code: subjectCode,
                            unit: extractUnitNumber(link.text),
                            title: link.text || `Darshan Resource - ${subjectCode}`,
                            description: 'Lecture Notes from Darshan University',
                            file_url: link.href,
                            source_url: request.url,
                            source_name: 'Darshan University'
                        });
                    }
                }

                // Extract page content
                const content = await page.$eval('.content, main, article, .material-content',
                    el => el.innerText).catch(() => null);

                if (content && content.length > 300) {
                    const title = await page.title();
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(title),
                        unit_title: title,
                        topic: title.substring(0, 100),
                        content: content.substring(0, 5000),
                        source_url: request.url
                    });
                }

                // Enqueue subject/semester pages
                await enqueueLinks({
                    globs: [
                        '**/gtu-study-material/**',
                        '**/subject/**',
                        '**/semester/**',
                        '**/branch/**'
                    ],
                    label: 'DARSHAN'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    // Start with the GTU study material page
    const startUrls = [
        GTU_STUDY_SITES.darshan,
        `${GTU_STUDY_SITES.darshan}/${subjectCode}`,
        `https://www.darshan.ac.in/DIET/CE/GTU-Computer-Engineering-Study-Material`
    ];

    await crawler.run(startUrls);
    console.log(`✅ Darshan University scraping completed for ${subjectName}`);
}

function extractUnitNumber(text) {
    if (!text) return 1;
    const match = text.match(/unit\s*(\d+)/i);
    return match ? parseInt(match[1]) : 1;
}
