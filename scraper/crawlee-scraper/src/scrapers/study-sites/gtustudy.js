import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveQuestionBankItem } from '../../database.js';
import { GTU_PATTERNS } from '../../config.js';

/**
 * GTUStudy Scraper
 * Scrapes previous year papers and important questions
 */
export async function scrapeGTUStudy(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping GTUStudy for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 20,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                const title = await page.title();

                // 1. Look for PDF links (Question Papers / Notes)
                const pdfLinks = await page.$$eval('a[href$=".pdf"]', links =>
                    links.map(link => ({
                        href: link.href,
                        text: link.textContent.trim()
                    }))
                );

                for (const link of pdfLinks) {
                    // Determine if it's a paper or note based on text
                    let type = 'Study Note';
                    if (link.text.toLowerCase().includes('paper')) type = 'Question Paper';

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: 1, // Default to 1 if unknown
                        title: `${type}: ${link.text}`,
                        description: `${type} from GTUStudy`,
                        file_url: link.href, // We store the direct link for now, or download if needed
                        source_url: request.url,
                        source_name: 'GTUStudy'
                    });
                }

                // 2. Look for Important Questions (often in lists or tables)
                // This is generic; specific selectors depend on the site structure
                const questions = await page.$$eval('.question-content, .imp-ques', elements =>
                    elements.map(el => el.textContent.trim())
                );

                for (const q of questions) {
                    if (q.length > 10) {
                        await saveQuestionBankItem({
                            subject_code: subjectCode,
                            question_text: q,
                            options: null,
                            correct_answer: null,
                            explanation: null,
                            difficulty: 'Medium',
                            topic: 'General',
                            source_name: 'GTUStudy',
                            source_url: request.url
                        });
                    }
                }

                // Enqueue internal links for this subject
                await enqueueLinks({
                    globs: [`**/${subjectCode}/**`, `**/${subjectName.replace(/\s+/g, '-')}/**`],
                    label: 'GTUSTUDY_SUBJECT'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl || `https://gtustudy.in/${subjectCode}`]); // Fallback URL
}
