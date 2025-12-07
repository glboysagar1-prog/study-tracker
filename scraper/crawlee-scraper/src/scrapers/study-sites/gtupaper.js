import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * GTUPaper Scraper
 * Scrapes previous year question papers from gtupaper.in
 */
export async function scrapeGTUPaper(subjectName, subjectCode) {
    console.log(`📝 Scraping GTUPaper for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 30,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });

                // Look for paper download links
                const paperLinks = await page.$$eval('a[href$=".pdf"], a[href*="paper"], a[href*="download"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim() || link.title || '',
                        parent: link.closest('tr, li, article')?.textContent?.trim()?.substring(0, 200) || ''
                    }))
                );

                for (const link of paperLinks) {
                    // Extract exam info from text
                    const examInfo = extractExamInfo(link.text + ' ' + link.parent);

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: 0, // Papers don't have units
                        title: examInfo.title || `Question Paper - ${subjectCode}`,
                        description: `Previous Year Paper ${examInfo.year || ''} ${examInfo.semester || ''}`.trim(),
                        file_url: link.href,
                        source_url: request.url,
                        source_name: 'GTUPaper'
                    });
                }

                // Also look for embedded PDFs or iframe
                const embedLinks = await page.$$eval('iframe[src*=".pdf"], embed[src*=".pdf"]', els =>
                    els.map(el => el.src)
                );

                for (const src of embedLinks) {
                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: 0,
                        title: `Question Paper - ${subjectCode}`,
                        description: 'Previous Year Question Paper from GTUPaper',
                        file_url: src,
                        source_url: request.url,
                        source_name: 'GTUPaper'
                    });
                }

                // Enqueue internal paper links
                await enqueueLinks({
                    globs: [
                        `**/*${subjectCode}*/**`,
                        '**/paper/**',
                        '**/papers/**',
                        '**/question-paper/**',
                        '**/previous-year/**'
                    ],
                    label: 'GTUPAPER'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    const startUrls = [
        `${GTU_STUDY_SITES.gtuPaper}/${subjectCode}`,
        `${GTU_STUDY_SITES.gtuPaper}/search/${subjectCode}`,
        GTU_STUDY_SITES.gtuPaper
    ];

    await crawler.run(startUrls);
    console.log(`✅ GTUPaper scraping completed for ${subjectName}`);
}

function extractExamInfo(text) {
    const yearMatch = text.match(/(20\\d{2})/);
    const semMatch = text.match(/sem(?:ester)?\\s*(\\d)/i);
    const winterMatch = text.match(/(winter|summer)/i);

    return {
        year: yearMatch ? yearMatch[1] : null,
        semester: semMatch ? `Sem ${semMatch[1]}` : null,
        session: winterMatch ? winterMatch[1] : null,
        title: text.substring(0, 100).trim()
    };
}
