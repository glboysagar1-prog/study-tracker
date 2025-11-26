import { PlaywrightCrawler } from 'crawlee';
import { supabase } from '../../database.js';

/**
 * Coursera Scraper
 * Scrapes course details from Coursera
 */
export async function scrapeCoursera(subjectName, subjectCode, startUrl) {
    console.log(`🎓 Scraping Coursera for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // Extract course details
                const courseTitle = await page.$eval('h1', el => el.innerText).catch(() => title);
                const description = await page.$eval('.description, .about-section', el => el.innerText).catch(() => 'No description');

                if (courseTitle) {
                    await saveAdvancedResource({
                        subject_code: subjectCode,
                        title: courseTitle,
                        description: description.substring(0, 500),
                        resource_type: 'Course',
                        platform: 'Coursera',
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
                channel_name: 'Coursera',
                created_at: data.created_at
            });

        if (error) throw error;
        console.log(`✓ Saved Coursera resource: ${data.title.substring(0, 30)}...`);
    } catch (error) {
        console.error('Error saving Coursera resource:', error.message);
    }
}
