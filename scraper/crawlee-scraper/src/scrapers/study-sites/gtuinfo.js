import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveCircular } from '../../database.js';

/**
 * GTUInfo Scraper
 * Scrapes news, updates, and exam papers
 */
export async function scrapeGTUInfo(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping GTUInfo for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Check for news/updates
                if (request.url.includes('news') || request.url.includes('circular')) {
                    const title = await page.title();
                    const content = await page.$eval('.post-content', el => el.innerText).catch(() => title);

                    await saveCircular({
                        title: title,
                        content: content,
                        circular_date: new Date().toISOString(), // Placeholder
                        pdf_url: request.url,
                        category: 'News'
                    });
                }

                // Look for Exam Papers
                const paperLinks = await page.$$eval('a[href$=".pdf"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim()
                    }))
                );

                for (const link of paperLinks) {
                    if (link.text.toLowerCase().includes('paper') || request.url.includes('paper')) {
                        await saveNotePDF({
                            subject_code: subjectCode,
                            unit: 1,
                            title: link.text || `Exam Paper - ${subjectCode}`,
                            description: 'Previous Year Question Paper',
                            file_url: link.href,
                            source_url: request.url,
                            source_name: 'GTUInfo'
                        });
                    }
                }

                // Enqueue internal links
                await enqueueLinks({
                    globs: [`**/${subjectCode}/**`, '**/news/**'],
                    label: 'GTUINFO_SUBJECT'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl || `https://gtuinfo.in/${subjectCode}`]);
}
