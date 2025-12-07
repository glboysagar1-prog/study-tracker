import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * GTU Study Mates Scraper
 * Scrapes CS/IT notes from GitHub Pages site
 */
export async function scrapeGTUStudyMates(subjectName, subjectCode) {
    console.log(`👥 Scraping GTU Study Mates for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        maxConcurrency: 3,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });
                const title = await page.title();

                // Look for PDF/document links (GitHub pages often have direct links)
                const docLinks = await page.$$eval('a[href$=".pdf"], a[href$=".md"], a[href*="github.com"][href*="blob"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim() || link.title || ''
                    }))
                );

                for (const link of docLinks) {
                    // Convert GitHub blob URLs to raw for direct download
                    let fileUrl = link.href;
                    if (fileUrl.includes('github.com') && fileUrl.includes('/blob/')) {
                        fileUrl = fileUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                    }

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(link.text),
                        title: link.text || `GTU Study Mates - ${subjectCode}`,
                        description: 'CS/IT Notes from GTU Study Mates',
                        file_url: fileUrl,
                        source_url: request.url,
                        source_name: 'GTU Study Mates'
                    });
                }

                // Extract markdown content (rendered as HTML on GitHub Pages)
                const content = await page.$eval('article, .markdown-body, main, .content',
                    el => el.innerText).catch(() => null);

                if (content && content.length > 200) {
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(title),
                        unit_title: title,
                        topic: title.substring(0, 100),
                        content: content.substring(0, 5000),
                        source_url: request.url
                    });
                }

                // Look for subject/semester links on the site
                await enqueueLinks({
                    globs: [
                        `${GTU_STUDY_SITES.gtuStudyMates}/**`,
                        '**/sem*/**',
                        '**/notes/**',
                        '**/subjects/**'
                    ],
                    label: 'GTU_STUDY_MATES'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([GTU_STUDY_SITES.gtuStudyMates]);
    console.log(`✅ GTU Study Mates scraping completed for ${subjectName}`);
}

function extractUnitNumber(text) {
    if (!text) return 1;
    const match = text.match(/unit\s*(\d+)/i);
    return match ? parseInt(match[1]) : 1;
}
