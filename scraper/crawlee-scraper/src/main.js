import { scrapeGTUOfficial } from './scrapers/gtu-official.js';
import { scrapeGTUResults } from './scrapers/gtu-results.js';
import { scrapeGeeksForGeeks } from './scrapers/tutorials/geeksforgeeks.js';
import { scrapeTutorialspoint } from './scrapers/tutorials/tutorialspoint.js';
import { scrapeJavaTpoint } from './scrapers/tutorials/javatpoint.js';
import { scrapeW3Schools } from './scrapers/tutorials/w3schools.js';
import { scrapeSanfoundry } from './scrapers/question-banks/sanfoundry.js';
import { scrapeIndiaBIX } from './scrapers/question-banks/indiabix.js';
import { scrapeYouTube } from './scrapers/videos/youtube-scraper.js';
import { scrapeNPTEL } from './scrapers/videos/nptel.js';
import { scrapeSWAYAM } from './scrapers/advanced/swayam.js';
import { scrapeCoursera } from './scrapers/advanced/coursera.js';
import { scrapeEdX } from './scrapers/advanced/edx.js';
import { scrapeReddit } from './scrapers/community/reddit.js';
import { scrapeStackOverflow } from './scrapers/community/stackoverflow.js';
import { scrapeGTUStudy } from './scrapers/study-sites/gtustudy.js';
import { scrapeGTURanker } from './scrapers/study-sites/gturanker.js';
import { scrapeGTUMaterial } from './scrapers/study-sites/gtumaterial.js';
import { scrapeGTUInfo } from './scrapers/study-sites/gtuinfo.js';
import { getAllSubjects } from './database.js';
import { SUBJECT_URL_MAP } from './config.js';

/**
 * Main entry point for the Crawlee scraper
 */
async function main() {
    console.log('🚀 Starting Comprehensive GTU Scraper...');

    try {
        // Step 1: Scrape GTU Official Website (Syllabus, Circulars, Exam Schedules)
        console.log('='.repeat(60));
        console.log('STEP 1: GTU Official Website');
        console.log('='.repeat(60));

        await scrapeGTUOfficial();

        // Step 2: Scrape GTU Results
        await scrapeGTUResults();

        // Step 3: Get subjects from database
        console.log('\n' + '='.repeat(60));
        console.log('STEP 2: Educational Platforms & Study Sites');
        console.log('='.repeat(60));

        const subjects = await getAllSubjects();
        console.log(`Found ${subjects.length} subjects in database\n`);

        // Step 4: Scrape educational platforms for each subject
        for (const subject of subjects) { // Process ALL subjects
            console.log(`\n📖 Processing: ${subject.subject_name} (${subject.subject_code})`);

            // 1. Scrape Study Sites (Phase 2)
            await scrapeGTUStudy(subject.subject_name, subject.subject_code);
            await scrapeGTURanker(subject.subject_name, subject.subject_code);
            await scrapeGTUMaterial(subject.subject_name, subject.subject_code);
            await scrapeGTUInfo(subject.subject_name, subject.subject_code);

            // 2. Scrape Tutorials (Phase 3) & Question Banks (Phase 4) & Videos (Phase 5) & Advanced (Phase 6) & Community (Phase 7)
            const urls = SUBJECT_URL_MAP[subject.subject_name];

            if (urls) {
                // Tutorials
                if (urls.geeksforgeeks) await scrapeGeeksForGeeks(subject.subject_name, subject.subject_code, urls.geeksforgeeks);
                if (urls.tutorialspoint) await scrapeTutorialspoint(subject.subject_name, subject.subject_code, urls.tutorialspoint);
                if (urls.javatpoint) await scrapeJavaTpoint(subject.subject_name, subject.subject_code, urls.javatpoint);
                if (urls.w3schools) await scrapeW3Schools(subject.subject_name, subject.subject_code, urls.w3schools);

                // Question Banks
                if (urls.sanfoundry) await scrapeSanfoundry(subject.subject_name, subject.subject_code, urls.sanfoundry);
                if (urls.indiabix) await scrapeIndiaBIX(subject.subject_name, subject.subject_code, urls.indiabix);

                // Videos
                await scrapeYouTube(subject.subject_name, subject.subject_code);
                if (urls.nptel) await scrapeNPTEL(subject.subject_name, subject.subject_code, urls.nptel);

                // Advanced Resources
                if (urls.swayam) await scrapeSWAYAM(subject.subject_name, subject.subject_code, urls.swayam);
                if (urls.coursera) await scrapeCoursera(subject.subject_name, subject.subject_code, urls.coursera);
                if (urls.edx) await scrapeEdX(subject.subject_name, subject.subject_code, urls.edx);

                // Community Forums
                await scrapeReddit(subject.subject_name, subject.subject_code);
                await scrapeStackOverflow(subject.subject_name, subject.subject_code);
            } else {
                console.log(`⚠ No URL mapping found for ${subject.subject_name}, skipping tutorials/questions...`);
                // Still try generic scrapers
                await scrapeYouTube(subject.subject_name, subject.subject_code);
                await scrapeReddit(subject.subject_name, subject.subject_code);
                await scrapeStackOverflow(subject.subject_name, subject.subject_code);
            }

            // Add delay between subjects to be polite
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All scraping completed successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error in main scraper:', error);
        process.exit(1);
    }
}

// Run the scraper
main();
