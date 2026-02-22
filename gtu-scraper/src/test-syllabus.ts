import * as cheerio from 'cheerio';
import axios from 'axios';

async function test() {
    const url = 'https://ayanmemon296.github.io/GTU-Study-Mates/Sem4/OS.html';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Look for Syllabus header
    const syllabusStart = $('h3:contains("Syllabus")').first();
    const syllabusData = [];

    if (syllabusStart.length > 0) {
        // Find the following table or list
        const table = syllabusStart.nextAll('table').first();
        if (table.length > 0) {
            table.find('tbody tr').each((i, tr) => {
                const tds = $(tr).find('td');
                if (tds.length >= 2) {
                    const numberStr = tds.eq(0).text().trim();
                    const unitNumber = parseInt(numberStr.replace(/[^0-9]/g, '')) || (i + 1);
                    const rawContent = tds.eq(1).text().trim();
                    const titleMatch = rawContent.match(/^([^:\n]+)/); // often title is the first phrase
                    const unitTitle = titleMatch ? titleMatch[1].trim() : `Unit ${unitNumber}`;
                    const content = rawContent.replace(unitTitle, '').replace(/^[:\s-]+/, '').trim();

                    syllabusData.push({
                        unitNumber,
                        unitTitle,
                        content,
                    });
                }
            });
        }
    }

    console.log(JSON.stringify(syllabusData, null, 2));
}

test().catch(console.error);
