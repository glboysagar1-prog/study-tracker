import bytezPkg from 'bytez';
const { Bytez } = bytezPkg;
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

/**
 * Generate AI summary using Bytez
 */
export async function generateAISummary(content, subjectName, unitNumber) {
    if (!BYTEZ_API_KEY || BYTEZ_API_KEY === 'your_bytez_key_here') {
        console.log('⚠️ Bytez API key not configured, skipping AI generation');
        return null;
    }

    try {
        const client = new Bytez(BYTEZ_API_KEY);
        const model = client.model('openai/gpt-4o');

        const prompt = `You are an expert educator creating study materials for GTU students.

Subject: ${subjectName} - Unit ${unitNumber}

Based on the following content, create a comprehensive study guide with:
1. Key Concepts (bullet points)
2. Important Definitions
3. Examples and Applications
4. Practice Questions (3-5 questions)

Content:
${content.substring(0, 3000)}

Format your response in clear sections with headers.`;

        const messages = [
            { role: 'system', content: 'You are an expert educator creating study materials.' },
            { role: 'user', content: prompt }
        ];

        const result = await model.run(messages);

        // Handle different response formats
        let output = result;
        if (Array.isArray(result) && result.length >= 2) {
            output = result[0];
            const error = result[1];
            if (error) {
                console.error('Bytez API error:', error);
                return null;
            }
        }

        // Extract content
        if (typeof output === 'object' && output !== null) {
            if (output.content) return output.content;
            if (output.choices && output.choices[0]) {
                return output.choices[0].message?.content || output.choices[0].text;
            }
            if (output.text) return output.text;
        }

        if (typeof output === 'string') return output;

        return String(output);

    } catch (error) {
        console.error('Error generating AI summary:', error.message);
        return null;
    }
}

/**
 * Generate PDF from content using pdf-lib
 */
export async function generatePDF(subjectName, subjectCode, unitNumber, content, outputPath) {
    try {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        let page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();
        const margin = 50;
        let yPosition = height - margin;

        // Helper to add new page if needed
        const checkNewPage = (requiredSpace = 30) => {
            if (yPosition < margin + requiredSpace) {
                page = pdfDoc.addPage([595, 842]);
                yPosition = height - margin;
            }
        };

        // Title
        page.drawText(`${subjectName}`, {
            x: margin,
            y: yPosition,
            size: 20,
            font: timesRomanBoldFont,
            color: rgb(0.1, 0.2, 0.6)
        });
        yPosition -= 30;

        page.drawText(`Unit ${unitNumber} Study Guide`, {
            x: margin,
            y: yPosition,
            size: 16,
            font: timesRomanBoldFont,
            color: rgb(0.1, 0.2, 0.6)
        });
        yPosition -= 25;

        // Subject Code
        page.drawText(`Subject Code: ${subjectCode}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        yPosition -= 30;

        // Content
        const lines = content.split('\n');
        const maxWidth = width - 2 * margin;

        for (const line of lines) {
            if (!line.trim()) {
                yPosition -= 10;
                continue;
            }

            checkNewPage();

            // Check if it's a heading (starts with # or ** or all caps)
            const isHeading = line.startsWith('#') || line.startsWith('**') ||
                (line === line.toUpperCase() && line.length < 50);

            const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
            const fontSize = isHeading ? 14 : 11;
            const font = isHeading ? timesRomanBoldFont : timesRomanFont;

            // Word wrap
            const words = cleanLine.split(' ');
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const textWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (textWidth > maxWidth) {
                    if (currentLine) {
                        checkNewPage();
                        page.drawText(currentLine, {
                            x: margin,
                            y: yPosition,
                            size: fontSize,
                            font: font,
                            color: rgb(0, 0, 0)
                        });
                        yPosition -= fontSize + 5;
                    }
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }

            if (currentLine) {
                checkNewPage();
                page.drawText(currentLine, {
                    x: margin,
                    y: yPosition,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0)
                });
                yPosition -= fontSize + 5;
            }

            if (isHeading) {
                yPosition -= 5;
            }
        }

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        console.log(`✓ PDF generated: ${outputPath}`);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error.message);
        return false;
    }
}
