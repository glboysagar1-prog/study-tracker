import { PlaywrightCrawler } from 'crawlee';
import { saveSyllabusContent, saveNotePDF } from '../../database.js';
import { generateAISummary, generatePDF } from '../../ai-pdf-generator.js';

/**
 * Tutorialspoint Scraper
 * Scrapes tutorials and generates PDFs if needed
 */
export async function scrapeTutorialspoint(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping Tutorialspoint for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // Extract main content
                const content = await page.$eval('.tutorial-content, #mainContent', el => el.innerText).catch(() => null);

                if (content && content.length > 200) {
                    // Save as syllabus content
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: 1, // Default
                        unit_title: 'Tutorialspoint Tutorial',
                        topic: title.replace(' - Tutorialspoint', '').trim(),
                        content: content,
                        source_url: request.url
                    });

                    // Generate PDF using AI (optional, if we want offline copy)
                    // For now, let's just save the content.
                    // If we want to generate PDF:
                    /*
                    const summary = await generateAISummary(content);
                    const pdfPath = await generatePDF(summary, `${subjectCode}_${title}.pdf`);
                    // Save PDF metadata...
                    */
                }

                // Enqueue internal links (next/prev chapters)
                await enqueueLinks({
                    selector: '.toc a, .chapters a',
                    label: 'TUTORIALSPOINT_TOPIC'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}
