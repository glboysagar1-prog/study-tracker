import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF } from '../../database.js';

/**
 * GTUMaterial Scraper
 * Scrapes books, PPTs, and lab manuals
 */
export async function scrapeGTUMaterial(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping GTUMaterial for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Look for download links (PDF, PPT)
                const downloads = await page.$$eval('a[href$=".pdf"], a[href$=".ppt"], a[href$=".pptx"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim(),
                        type: link.href.endsWith('.pdf') ? 'PDF' : 'PPT'
                    }))
                );

                for (const item of downloads) {
                    let description = 'Material from GTUMaterial';
                    if (item.type === 'PPT') description = 'Lecture Presentation (PPT)';
                    else if (item.text.toLowerCase().includes('lab')) description = 'Lab Manual';
                    else if (item.text.toLowerCase().includes('book')) description = 'Reference Book';

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: 1,
                        title: item.text || `${subjectCode} Material`,
                        description: description,
                        file_url: item.href,
                        source_url: request.url,
                        source_name: 'GTUMaterial'
                    });
                }

                // Enqueue internal links
                await enqueueLinks({
                    globs: [`**/${subjectCode}/**`],
                    label: 'GTUMATERIAL_SUBJECT'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl || `https://gtumaterial.com/${subjectCode}`]);
}
