import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * Reddit Scraper
 * Scrapes discussions from Reddit
 */
export async function scrapeReddit(subjectName, subjectCode) {
    console.log(`💬 Scraping Reddit for ${subjectName} (${subjectCode})...`);

    const searchQuery = `${subjectName} GTU engineering`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const startUrl = `https://www.reddit.com/search/?q=${encodedQuery}`;

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 5,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Wait for results
                await page.waitForSelector('faceplate-tracker', { timeout: 10000 }).catch(() => null);

                // Extract posts
                const posts = await page.$$eval('faceplate-tracker[data-testid="search-post"]', elements => {
                    return elements.slice(0, 10).map(el => {
                        const titleEl = el.querySelector('a[slot="title"]');
                        const link = titleEl?.href;
                        const title = titleEl?.innerText;
                        const subreddit = el.querySelector('a[data-testid="subreddit-name"]')?.innerText;

                        return {
                            title,
                            url: link,
                            subreddit
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
                            platform: 'Reddit',
                            community_name: post.subreddit || 'Reddit',
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

/**
 * Save community discussion to database
 * Using 'circulars' or a new table?
 * Let's use 'video_resources' for now as a catch-all or create a new table if possible.
 * Actually, let's just log it for now since we don't have a specific table for discussions in the schema I saw earlier.
 * Wait, schema.sql had `video_resources`, `question_banks`, `circulars`, `exam_schedules`, `result_statistics`.
 * It didn't have `community_discussions`.
 * I'll skip saving to DB for now or save to `circulars` with category 'Community'?
 * Or just log it.
 * I'll save to `circulars` with category 'Community Discussion' as a workaround.
 */
async function saveCommunityDiscussion(data) {
    try {
        const { data: result, error } = await supabase
            .from('circulars')
            .insert({
                title: data.title,
                content: `Discussion on ${data.platform} in ${data.community_name}`,
                circular_date: new Date().toISOString().split('T')[0],
                pdf_url: data.url, // Storing URL in pdf_url
                category: 'Community Discussion',
                created_at: data.created_at
            });

        if (error) throw error;
        console.log(`✓ Saved Reddit post: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving Reddit post:', error.message);
    }
}
