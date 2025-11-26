import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';

/**
 * GTURanker Scraper
 * Scrapes syllabus breakdown and revision notes
 */
export async function scrapeGTURanker(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping GTURanker for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Extract syllabus content
                const content = await page.$eval('.post-content, .entry-content', el => el.innerText).catch(() => null);
                const title = await page.title();

                if (content && content.length > 100) {
                    // Try to identify unit/topic
                    let unit = 1;
                    const unitMatch = title.match(/Unit\s*(\d+)/i);
                    if (unitMatch) unit = parseInt(unitMatch[1]);

                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: unit,
                        unit_title: title,
                        topic: title,
                        content: content,
                        source_url: request.url
                    });
                }

                // Look for PDF links
                const pdfLinks = await page.$$eval('a[href$=".pdf"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim()
                    }))
                );

                for (const link of pdfLinks) {
                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: 1,
                        title: link.text || `GTURanker Resource - ${subjectCode}`,
                        description: `Resource from GTURanker`,
                        file_url: link.href,
                        source_url: request.url,
                        source_name: 'GTURanker'
                    });
                }

                // Enqueue internal links
                await enqueueLinks({
                    globs: [`**/${subjectCode}/**`, `**/syllabus/**`],
                    label: 'GTURANKER_SUBJECT'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl || `https://gturanker.org/${subjectCode}`]);
}
