import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * SWAYAM Scraper
 * Scrapes course details from SWAYAM
 */
export async function scrapeSWAYAM(subjectName, subjectCode, startUrl) {
    console.log(`🎓 Scraping SWAYAM for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // Extract course details
                // SWAYAM course page structure
                const courseTitle = await page.$eval('.course-title, h1', el => el.innerText).catch(() => title);
                const description = await page.$eval('.course-description, .about-course', el => el.innerText).catch(() => 'No description');

                if (courseTitle) {
                    await saveAdvancedResource({
                        subject_code: subjectCode,
                        title: courseTitle,
                        description: description.substring(0, 500),
                        resource_type: 'Course',
                        platform: 'SWAYAM',
                        url: request.url,
                        created_at: new Date().toISOString()
                    });
                }

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}

/**
 * Save advanced resource to database
 * (Assuming we use a generic 'resources' table or similar, or just 'video_resources' if video based)
 * For now, let's use 'video_resources' with platform='SWAYAM' or create a new table 'academic_resources'
 * The schema.sql didn't specify 'academic_resources', but 'video_resources' exists.
 * Let's use 'video_resources' for now or 'notes' if it's text.
 * Actually, let's use 'video_resources' as these are mostly video courses.
 */
async function saveAdvancedResource(data) {
    try {
        const { data: result, error } = await supabase
            .from('video_resources')
            .insert({
                subject_code: data.subject_code,
                title: data.title,
                description: data.description,
                video_url: data.url,
                platform: data.platform,
                channel_name: 'SWAYAM',
                created_at: data.created_at
            });

        if (error) throw error;
        console.log(`✓ Saved SWAYAM resource: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving SWAYAM resource:', error.message);
    }
}
