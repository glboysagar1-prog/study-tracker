import { PlaywrightCrawler } from 'crawlee';
import { saveResultStatistics } from '../database.js';

/**
 * GTU Results Scraper
 * Scrapes result statistics from gturesults.in
 */
export async function scrapeGTUResults() {
    console.log('📊 Starting GTU Results Scraper...');

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Wait for the main table or content
                await page.waitForSelector('#ContentPlaceHolder1_grdResult', { timeout: 10000 }).catch(() => null);

                // Extract result rows
                const results = await page.$$eval('#ContentPlaceHolder1_grdResult tr', rows => {
                    return rows.slice(1).map(row => {
                        const cols = row.querySelectorAll('td');
                        if (cols.length < 4) return null;

                        return {
                            exam_name: cols[1]?.textContent?.trim(),
                            exam_date: cols[2]?.textContent?.trim(), // Needs parsing
                            link: cols[3]?.querySelector('a')?.href
                        };
                    }).filter(r => r && r.exam_name);
                });

                log.info(`Found ${results.length} result declarations`);

                for (const result of results) {
                    // Parse date if possible
                    let examDate = new Date().toISOString();
                    if (result.exam_date) {
                        // Attempt to parse DD-MM-YYYY or similar
                        // For now, use current date or parsed if simple
                    }

                    // Save basic stats (detailed stats might require following the link)
                    await saveResultStatistics({
                        exam_name: result.exam_name,
                        exam_date: examDate,
                        branch_code: null, // Would need extraction
                        semester: null,
                        total_students: 0, // Placeholder
                        passed_students: 0,
                        pass_percentage: 0.0,
                        source_url: result.link || request.url
                    });
                }

            } catch (error) {
                log.error(`Error processing results page: ${error.message}`);
            }
        }
    });

    await crawler.run(['https://www.gturesults.in/']);
    console.log('✅ GTU Results scraping completed');
}
