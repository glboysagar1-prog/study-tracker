import { PlaywrightCrawler } from 'crawlee';
import { saveSyllabusContent } from '../../database.js';

/**
 * JavaTpoint Scraper
 * Scrapes tutorials from JavaTpoint
 */
export async function scrapeJavaTpoint(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping JavaTpoint for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // Extract content
                const content = await page.$eval('#city, .onlycontent', el => el.innerText).catch(() => null);

                if (content && content.length > 200) {
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: 1,
                        unit_title: 'JavaTpoint Tutorial',
                        topic: title.replace(' - javatpoint', '').trim(),
                        content: content,
                        source_url: request.url
                    });
                }

                // Enqueue internal links
                await enqueueLinks({
                    selector: '#leftmenu a, .next',
                    label: 'JAVATPOINT_TOPIC'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}
