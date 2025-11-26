import { PlaywrightCrawler } from 'crawlee';
import { saveQuestionBankItem } from '../../database.js';

/**
 * Sanfoundry Scraper
 * Scrapes MCQs from Sanfoundry
 */
export async function scrapeSanfoundry(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping Sanfoundry for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 50,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Extract MCQs
                // Sanfoundry structure: <p>1. Question...</p> <p>a) ...</p> ... <div class="collapseomatic_content">Answer: ...</div>

                // This is a simplified extraction logic; actual site structure varies
                const content = await page.content();

                // Use a more robust extraction method if possible, e.g., regex on text content
                // For now, let's try to find question blocks
                const entryContent = await page.$('.entry-content');
                if (entryContent) {
                    const text = await entryContent.innerText();
                    const questions = text.split(/\n\s*\d+\.\s+/).slice(1); // Split by "1. ", "2. " etc.

                    for (const qBlock of questions) {
                        const lines = qBlock.split('\n').map(l => l.trim()).filter(l => l);
                        if (lines.length < 5) continue; // Need question + 4 options + answer

                        const questionText = lines[0];
                        const options = {};
                        let answer = '';
                        let explanation = '';

                        // Parse options and answer (heuristic)
                        for (const line of lines) {
                            if (line.startsWith('a)')) options.a = line.substring(2).trim();
                            else if (line.startsWith('b)')) options.b = line.substring(2).trim();
                            else if (line.startsWith('c)')) options.c = line.substring(2).trim();
                            else if (line.startsWith('d)')) options.d = line.substring(2).trim();
                            else if (line.startsWith('Answer:')) answer = line.replace('Answer:', '').trim();
                            else if (line.startsWith('Explanation:')) explanation = line.replace('Explanation:', '').trim();
                        }

                        if (questionText && answer) {
                            await saveQuestionBankItem({
                                subject_code: subjectCode,
                                question_text: questionText,
                                options: options,
                                correct_answer: answer,
                                explanation: explanation,
                                difficulty: 'Medium',
                                topic: (await page.title()).replace(' - Sanfoundry', '').trim(),
                                source_name: 'Sanfoundry',
                                source_url: request.url
                            });
                        }
                    }
                }

                // Enqueue internal links
                await enqueueLinks({
                    selector: '.entry-content a',
                    label: 'SANFOUNDRY_TOPIC'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([startUrl]);
}
