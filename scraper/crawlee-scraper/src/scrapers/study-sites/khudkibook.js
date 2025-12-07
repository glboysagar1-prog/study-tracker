import { PlaywrightCrawler } from 'crawlee';
import { saveNotePDF, saveSyllabusContent } from '../../database.js';
import { GTU_STUDY_SITES } from '../../config.js';

/**
 * KhudkiBook Scraper
 * Scrapes diploma materials from khudkibook.web.app (Firebase-hosted SPA)
 */
export async function scrapeKhudkiBook(subjectName, subjectCode) {
    console.log(`📖 Scraping KhudkiBook for ${subjectName} (${subjectCode})...`);

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 40,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 90, // Longer timeout for SPA

        async requestHandler({ request, page, log, enqueueLinks }) {
            log.info(`Processing: ${request.url}`);

            try {
                // Wait for SPA to load content
                await page.waitForLoadState('networkidle', { timeout: 45000 });
                await page.waitForTimeout(2000); // Extra wait for dynamic content

                // Look for PDF/material download links
                const materialLinks = await page.$$eval('a[href$=".pdf"], a[href*="drive.google"], a[onclick*="download"]', links =>
                    links.map(link => ({
                        href: link.href || link.getAttribute('onclick')?.match(/https?:\/\/[^'"]+/)?.[0] || '',
                        text: link.textContent.trim() || link.title || ''
                    })).filter(l => l.href)
                );

                for (const link of materialLinks) {
                    let description = 'Diploma Material from KhudkiBook';
                    const lowerText = link.text.toLowerCase();

                    if (lowerText.includes('lab')) description = 'Lab Manual';
                    else if (lowerText.includes('paper')) description = 'Previous Year Paper';
                    else if (lowerText.includes('book')) description = 'Reference Book';
                    else if (lowerText.includes('note')) description = 'Study Notes';

                    await saveNotePDF({
                        subject_code: subjectCode,
                        unit: extractUnitNumber(link.text),
                        title: link.text || `KhudkiBook Material - ${subjectCode}`,
                        description: description,
                        file_url: link.href,
                        source_url: request.url,
                        source_name: 'KhudkiBook'
                    });
                }

                // Extract content from cards/sections (common in Firebase apps)
                const contentSections = await page.$$eval('.card, .material-section, [class*="content"]', els =>
                    els.map(el => ({
                        title: el.querySelector('h1, h2, h3, .title')?.textContent?.trim() || '',
                        content: el.textContent?.trim() || ''
                    })).filter(s => s.content.length > 100)
                );

                for (const section of contentSections) {
                    if (section.content.length > 200) {
                        await saveSyllabusContent({
                            subject_code: subjectCode,
                            unit: extractUnitNumber(section.title),
                            unit_title: section.title || 'KhudkiBook Content',
                            topic: section.title.substring(0, 100) || 'Study Material',
                            content: section.content.substring(0, 5000),
                            source_url: request.url
                        });
                    }
                }

                // Click on expandable items to reveal more content
                const expandButtons = await page.$$('[class*="expand"], [class*="more"], button:has-text("View")');
                for (const btn of expandButtons.slice(0, 5)) {
                    try {
                        await btn.click();
                        await page.waitForTimeout(500);
                    } catch (e) {
                        // Ignore click errors
                    }
                }

                // Enqueue internal links
                await enqueueLinks({
                    globs: [
                        `${GTU_STUDY_SITES.khudkiBook}/**`,
                        '**/diploma/**',
                        '**/gtu/**'
                    ],
                    label: 'KHUDKIBOOK'
                });

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        }
    });

    await crawler.run([GTU_STUDY_SITES.khudkiBook]);
    console.log(`✅ KhudkiBook scraping completed for ${subjectName}`);
}

function extractUnitNumber(text) {
    if (!text) return 1;
    const match = text.match(/unit\\s*(\\d+)/i);
    return match ? parseInt(match[1]) : 1;
}
