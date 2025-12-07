import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * GTU Study Material Blog Scraper
 * Scrapes mixed materials from Blogspot
 */
export async function scrapeGTUStudyMaterialBlog(subjectName, subjectCode) {
    console.log(`📰 Scraping GTU Study Material Blog for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 40,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });

                // Blogspot-specific selectors for post content
                const postTitle = await page.$eval('.post-title, .entry-title, h1',
                    el => el.textContent.trim()).catch(() => '');

                const postContent = await page.$eval('.post-body, .entry-content, .post-content',
                    el => el.innerText).catch(() => '');

                // Look for download links in post
                const downloadLinks = await page.$$eval('.post-body a[href$=".pdf"], .post-body a[href*="drive.google"], .post-body a[href*="mediafire"], .post-body a[href*="mega.nz"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim() || link.title || ''
                    }))
                );

                for (const link of downloadLinks) {
                    let type = 'Study Material';
                    const lowerText = link.text.toLowerCase();

                    if (lowerText.includes('paper')) type = 'Question Paper';
                    else if (lowerText.includes('book')) type = 'Reference Book';
                    else if (lowerText.includes('note')) type = 'Study Notes';
                    else if (lowerText.includes('lab')) type = 'Lab Manual';

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(link.text + ' ' + postTitle),
                        title: link.text || `${type} - ${subjectCode}`,
                        description: `${type} from GTU Study Material Blog`,
                        file_url: link.href,
                        source_url: request.url,
                        source_name: 'GTU Study Material Blog'
                    });
                }

                // Save post content as syllabus content
                if (postContent && postContent.length > 300) {
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(postTitle),
                        unit_title: postTitle || 'Blog Post',
                        topic: postTitle.substring(0, 100) || 'Study Material',
                        content: postContent.substring(0, 5000),
                        source_url: request.url
                    });
                }

                // Enqueue more blog posts and labels
                await enqueueLinks({
                    globs: [
                        `${GTU_STUDY_SITES.gtuStudyMaterialBlog}/**`,
                        '**/search/label/**', // Blogspot labels
                        '**/*/post/**'
                    ],
                    label: 'GTU_BLOG'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    // Search for subject on blog
    const startUrls = [
        GTU_STUDY_SITES.gtuStudyMaterialBlog,
        `${GTU_STUDY_SITES.gtuStudyMaterialBlog}/search?q=${encodeURIComponent(subjectCode)}`,
        `${GTU_STUDY_SITES.gtuStudyMaterialBlog}/search?q=${encodeURIComponent(subjectName)}`
    ];

    await crawler.run(startUrls);
    console.log(`✅ GTU Study Material Blog scraping completed for ${subjectName}`);
}

function extractUnitNumber(text) {
    if (!text) return 1;
    const match = text.match(/unit\s*(\d+)/i);
    return match ? parseInt(match[1]) : 1;
}
