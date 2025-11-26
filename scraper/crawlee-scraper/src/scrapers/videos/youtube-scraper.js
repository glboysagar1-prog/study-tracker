import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * YouTube Scraper
 * Scrapes video resources from YouTube search results
 */
export async function scrapeYouTube(subjectName, subjectCode) {
    console.log(`🎥 Scraping YouTube for ${subjectName} (${subjectCode})...`);

    const searchQuery = `${subjectName} GTU tutorial`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const startUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 5, // Just the search page
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Wait for video results
                await page.waitForSelector('ytd-video-renderer', { timeout: 10000 }).catch(() => null);

                // Extract videos
                const videos = await page.$$eval('ytd-video-renderer', elements => {
                    return elements.slice(0, 10).map(el => {
                        const titleEl = el.querySelector('#video-title');
                        const link = titleEl?.href;
                        const title = titleEl?.title;
                        const channel = el.querySelector('#channel-info #text')?.textContent?.trim();
                        const views = el.querySelector('#metadata-line span:first-child')?.textContent?.trim();
                        const description = el.querySelector('#description-text')?.textContent?.trim();

                        return {
                            title,
                            video_url: link,
                            channel_name: channel,
                            views,
                            description
                        };
                    });
                });

                log.info(`Found ${videos.length} videos`);

                for (const video of videos) {
                    if (video.title && video.video_url) {
                        await saveVideoResource({
                            subject_code: subjectCode,
                            title: video.title,
                            description: video.description || 'YouTube Video',
                            video_url: video.video_url,
                            duration: 0, // Hard to get without clicking
                            platform: 'YouTube',
                            channel_name: video.channel_name,
                            transcript: null,
                            views: parseInt(video.views?.replace(/[^0-9]/g, '') || '0'),
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
 * Save video resource to database
 */
async function saveVideoResource(data) {
    try {
        const { data: result, error } = await supabase
            .from('video_resources')
            .insert(data);

        if (error) throw error;
        console.log(`✓ Saved video: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving video resource:', error.message);
    }
}
