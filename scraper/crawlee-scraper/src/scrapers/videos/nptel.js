import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * NPTEL Scraper
 * Scrapes NPTEL course videos
 */
export async function scrapeNPTEL(subjectName, subjectCode, startUrl) {
    console.log(`🎥 Scraping NPTEL for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // NPTEL structure varies, but often has a list of lectures
                // Look for table rows or list items with video links
                const lectures = await page.$$eval('tr, li', elements => {
                    return elements.map(el => {
                        const link = el.querySelector('a');
                        if (!link || !link.href.includes('youtube') && !link.href.includes('nptel')) return null;

                        return {
                            title: link.textContent?.trim() || el.textContent?.trim(),
                            video_url: link.href
                        };
                    }).filter(l => l && l.title && l.title.length > 5);
                });

                for (const lecture of lectures) {
                    await saveVideoResource({
                        subject_code: subjectCode,
                        title: lecture.title,
                        description: `NPTEL Lecture for ${subjectName}`,
                        video_url: lecture.video_url,
                        duration: 3600, // Approx 1 hour
                        platform: 'NPTEL',
                        channel_name: 'NPTEL',
                        transcript: null,
                        views: 0,
                        created_at: new Date().toISOString()
                    });
                }

                // Enqueue course pages
                await enqueueLinks({
                    globs: ['**/courses/**'],
                    label: 'NPTEL_COURSE'
                });

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
        console.log(`✓ Saved NPTEL video: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving video resource:', error.message);
    }
}
