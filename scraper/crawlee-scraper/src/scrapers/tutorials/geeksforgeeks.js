import { PlaywrightCrawler } from 'crawlee';
import { saveSyllabusContent, saveNotePDF } from '../../database.js';
import { generateAISummary, generatePDF } from '../../ai-pdf-generator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GeeksforGeeks Scraper
 * Extracts tutorial content and topics, generates PDFs with AI
 */
export async function scrapeGeeksForGeeks(subjectName, subjectCode, startUrl) {
    console.log(`📚 Scraping GeeksforGeeks for: ${subjectName}`);

    // Ensure PDF storage directory exists
    const pdfDir = path.join(__dirname, '../../../..', 'tmp', 'gtu_pdfs');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    let allContent = '';
    let unitNumber = 1;

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 5, // Limit to 5 pages per subject
        maxConcurrency: 2,

        async requestHandler({ request, page, enqueueLinks, log }) {
            log.info(`Processing: ${request.url}`);

            try {
                await page.waitForLoadState('domcontentloaded');

                // Extract article content
                const article = await page.$('article, .article-container, .content');

                if (!article) {
                    log.warning('No article content found');
                    return;
                }

                // Get title
                const title = await page.$eval('h1, .title', el => el.textContent.trim())
                    .catch(() => 'No title');

                // Get content
                const content = await article.textContent();
                allContent += '\n\n' + content;

                // Extract topics from headings
                const topics = await page.$$eval('h2, h3', headings =>
                    headings.map(h => h.textContent.trim()).filter(t => t.length > 0)
                );

                log.info(`Found ${topics.length} topics`);

                // Save each topic as separate syllabus content
                for (let i = 0; i < topics.length; i++) {
                    const topic = topics[i];

                    // Try to get content for this specific topic
                    // (content between this heading and the next)
                    const topicContent = await extractTopicContent(page, topic);

                    // Save to database
                    await saveSyllabusContent({
                        subject_code: subjectCode,
                        unit: Math.floor(i / 5) + 1, // Group topics into units
                        unit_title: `Unit ${Math.floor(i / 5) + 1}`,
                        topic: topic,
                        content: topicContent || content.substring(0, 2000),
                        source_url: request.url
                    });
                }

            } catch (error) {
                log.error(`Error in GeeksforGeeks scraper:`, error.message);
            }
        }
    });

    await crawler.run([startUrl]);

    // After scraping, generate PDF with AI
    if (allContent.length > 100) {
        console.log(`  🤖 Generating AI-powered PDF for ${subjectName}...`);

        // Generate AI summary
        const aiSummary = await generateAISummary(allContent, subjectName, unitNumber);
        const finalContent = aiSummary || allContent.substring(0, 5000);

        // Generate PDF
        const pdfFilename = `${subjectCode}_Unit${unitNumber}_GFG.pdf`;
        const pdfPath = path.join(pdfDir, pdfFilename);

        const success = await generatePDF(subjectName, subjectCode, unitNumber, finalContent, pdfPath);

        if (success) {
            // Save to database
            await saveNotePDF({
                subject_code: subjectCode,
                unit: unitNumber,
                title: `${subjectName} - Unit ${unitNumber} (GeeksforGeeks + AI)`,
                description: `AI-enhanced study guide from GeeksforGeeks`,
                file_url: `/api/pdf/${pdfFilename}`,
                source_url: startUrl,
                source_name: 'GeeksforGeeks + AI Generated (Bytez)'
            });
        }
    }

    console.log('✅ GeeksforGeeks scraping completed');
}

/**
 * Extract content for a specific topic
 */
async function extractTopicContent(page, topicTitle) {
    try {
        // Find the heading with this topic
        const heading = await page.$(`h2:has-text("${topicTitle}"), h3:has-text("${topicTitle}")`);
        if (!heading) return null;

        // Get next siblings until the next heading
        const content = await heading.evaluate(h => {
            let text = '';
            let sibling = h.nextElementSibling;

            while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
                text += sibling.textContent + '\n';
                sibling = sibling.nextElementSibling;
            }

            return text.trim();
        });

        return content.substring(0, 2000);
    } catch (error) {
        return null;
    }
}
