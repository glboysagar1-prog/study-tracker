import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * StackOverflow Scraper
 * Scrapes discussions from StackOverflow
 */
export async function scrapeStackOverflow(subjectName, subjectCode) {
    console.log(`💬 Scraping StackOverflow for ${subjectName} (${subjectCode})...`);

    const searchQuery = `${subjectName} programming`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const startUrl = `https://stackoverflow.com/search?q=${encodedQuery}`;

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 5,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Wait for results
                await page.waitForSelector('.s-post-summary', { timeout: 10000 }).catch(() => null);

                // Extract posts
                const posts = await page.$$eval('.s-post-summary', elements => {
                    return elements.slice(0, 10).map(el => {
                        const titleEl = el.querySelector('.s-post-summary--content-title a');
                        const link = titleEl?.href;
                        const title = titleEl?.innerText;
                        const votes = el.querySelector('.s-post-summary--stats-item-number')?.innerText;

                        return {
                            title,
                            url: link,
                            votes
                        };
                    });
                });

                log.info(`Found ${posts.length} posts`);

                for (const post of posts) {
                    if (post.title && post.url) {
                        await saveCommunityDiscussion({
                            subject_code: subjectCode,
                            title: post.title,
                            url: post.url,
                            platform: 'StackOverflow',
                            community_name: 'StackOverflow',
                            created_at: new Date().toISOString()
                        });
                    }
                }

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}

async function saveCommunityDiscussion(data) {
    try {
        const { data: result, error } = await supabase
            .from('circulars')
            .insert({
                title: data.title,
                content: `Discussion on ${data.platform}`,
                circular_date: new Date().toISOString().split('T')[0],
                pdf_url: data.url,
                category: 'Community Discussion',
                created_at: data.created_at
            });

        if (error) throw error;
        console.log(`✓ Saved StackOverflow post: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving StackOverflow post:', error.message);
    }
}
