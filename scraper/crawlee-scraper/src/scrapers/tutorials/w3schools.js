import { PlaywrightCrawler } from 'crawlee';
import { saveSyllabusContent } from '../../database.js';

/**
 * W3Schools Scraper
 * Scrapes tutorials from W3Schools
 */
export async function scrapeW3Schools(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping W3Schools for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // Extract content
                const content = await page.$eval('#main', el => el.innerText).catch(() => null);

                if (content && content.length > 200) {
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: 1,
                        unit_title: 'W3Schools Tutorial',
                        topic: title.replace(' - W3Schools', '').trim(),
                        content: content,
                        source_url: request.url
                    });
                }

                // Enqueue internal links
                await enqueueLinks({
                    selector: '#leftmenuinner a, .w3-right.w3-btn',
                    label: 'W3SCHOOLS_TOPIC'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}
