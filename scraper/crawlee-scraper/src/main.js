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
// Existing study sites
import { scrapeGTUStudy } from './scrapers/study-sites/gtustudy.js';
import { scrapeGTURanker } from './scrapers/study-sites/gturanker.js';
import { scrapeGTUMaterial } from './scrapers/study-sites/gtumaterial.js';
import { scrapeGTUInfo } from './scrapers/study-sites/gtuinfo.js';
// NEW: Additional GTU study sites (6 new scrapers)
import { scrapeGTUStudyCom } from './scrapers/study-sites/gtustudy-com.js';
import { scrapeGTUPaper } from './scrapers/study-sites/gtupaper.js';
import { scrapeKhudkiBook } from './scrapers/study-sites/khudkibook.js';
import { scrapeGTUStudyMates } from './scrapers/study-sites/gtustudymates.js';
import { scrapeGTUStudyMaterialBlog } from './scrapers/study-sites/gtustudymaterial-blog.js';
import { scrapeDarshan } from './scrapers/study-sites/darshan.js';

import { getAllSubjects } from './database.js';
import { SUBJECT_URL_MAP } from './config.js';

/**
 * Main entry point for the Crawlee scraper
 * Scrapes 11 GTU-related websites for study materials
 */
async function main() {
    console.log('🚀 Starting Comprehensive GTU Scraper (11 Sites)...');
    console.log('📋 Target Sites:');
    console.log('   1. GTU Official (gtu.ac.in)');
    console.log('   2. GTUStudy.com');
    console.log('   3. GTUStudy.in');
    console.log('   4. GTURanker');
    console.log('   5. GTUMaterial');
    console.log('   6. GTUPaper');
    console.log('   7. GTUInfo');
    console.log('   8. KhudkiBook');
    console.log('   9. GTU Study Mates');
    console.log('   10. GTU Study Material Blog');
    console.log('   11. Darshan University\n');

    try {
        // Step 1: Scrape GTU Official Website (Syllabus, Circulars, Exam Schedules)
        console.log('='.repeat(60));
        console.log('STEP 1: GTU Official Website & Results');
        console.log('='.repeat(60));

        await scrapeGTUOfficial();
        await scrapeGTUResults();

        // Step 2: Get subjects from database
        console.log('\n' + '='.repeat(60));
        console.log('STEP 2: GTU Study Sites (All 11 Sites)');
        console.log('='.repeat(60));

        const subjects = await getAllSubjects();
        console.log(`Found ${subjects.length} subjects in database\n`);

        // Step 3: Scrape all GTU study sites for each subject
        for (const subject of subjects) {
            console.log(`\n📖 Processing: ${subject.subject_name} (${subject.subject_code})`);
            console.log('-'.repeat(50));

            // ===== GTU Study Sites (11 sites) =====
            console.log('  🌐 Scraping GTU Study Sites...');

            // Existing scrapers (4)
            await scrapeGTUStudy(subject.subject_name, subject.subject_code);
            await scrapeGTURanker(subject.subject_name, subject.subject_code);
            await scrapeGTUMaterial(subject.subject_name, subject.subject_code);
            await scrapeGTUInfo(subject.subject_name, subject.subject_code);

            // NEW scrapers (6)
            await scrapeGTUStudyCom(subject.subject_name, subject.subject_code);
            await scrapeGTUPaper(subject.subject_name, subject.subject_code);
            await scrapeKhudkiBook(subject.subject_name, subject.subject_code);
            await scrapeGTUStudyMates(subject.subject_name, subject.subject_code);
            await scrapeGTUStudyMaterialBlog(subject.subject_name, subject.subject_code);
            await scrapeDarshan(subject.subject_name, subject.subject_code);

            // ===== Educational Platforms =====
            console.log('  📚 Scraping Educational Platforms...');
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
                console.log(`  ⚠ No URL mapping found for ${subject.subject_name}, using generic scrapers...`);
                await scrapeYouTube(subject.subject_name, subject.subject_code);
                await scrapeReddit(subject.subject_name, subject.subject_code);
                await scrapeStackOverflow(subject.subject_name, subject.subject_code);
            }

            // Add delay between subjects to be polite
            console.log(`  ⏳ Waiting before next subject...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All 11 GTU sites scraping completed successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error in main scraper:', error);
        process.exit(1);
    }
}

// Run the scraper
main();

