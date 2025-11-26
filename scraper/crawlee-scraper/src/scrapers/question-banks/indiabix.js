import { PlaywrightCrawler } from 'crawlee';
import { saveQuestionBankItem } from '../../database.js';

/**
 * IndiaBIX Scraper
 * Scrapes MCQs from IndiaBIX
 */
export async function scrapeIndiaBIX(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping IndiaBIX for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Extract MCQs
                // IndiaBIX structure: .bix-div-container
                const questions = await page.$$eval('.bix-div-container', divs => {
                    return divs.map(div => {
                        const qText = div.querySelector('.bix-td-qtxt')?.textContent?.trim();
                        const options = {};
                        div.querySelectorAll('.bix-td-option-val').forEach((opt, idx) => {
                            const key = String.fromCharCode(97 + idx); // a, b, c, d
                            options[key] = opt.textContent?.trim();
                        });
                        const answer = div.querySelector('.jq-hdnakq')?.value; // Hidden input often holds answer
                        // Or extract from "View Answer" section if visible

                        return {
                            question_text: qText,
                            options: options,
                            correct_answer: answer, // Might need better extraction
                            explanation: null
                        };
                    });
                });

                for (const q of questions) {
                    if (q.question_text) {
                        await saveQuestionBankItem({
                            subject_code: subjectCode,
                            question_text: q.question_text,
                            options: q.options,
                            correct_answer: q.correct_answer || 'View Source',
                            explanation: null,
                            difficulty: 'Medium',
                            topic: (await page.title()).replace(' - IndiaBIX', '').trim(),
                            source_name: 'IndiaBIX',
                            source_url: request.url
                        });
                    }
                }

                // Enqueue internal links
                await enqueueLinks({
                    selector: '.div-topics-index a, .mx-pager a',
                    label: 'INDIABIX_TOPIC'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}
