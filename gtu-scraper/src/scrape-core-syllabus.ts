import { CheerioCrawler, Dataset } from 'crawlee';
import { router, getYouTubeVideos } from './routes.js';

const targetSubjects = [
    { code: '3140702', name: 'Operating System' },
    { code: '3140705', name: 'Object Oriented Programming - I (Java)' },
    { code: '3140707', name: 'Computer Organization & Architecture' },
    { code: '3140708', name: 'Discrete Mathematics' },
    { code: '3150703', name: 'Analysis and Design of Algorithms' } // ADA
];

const startUrls = [
    // GTU Material Index for Semester 4 & 5
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-4/study%20material', label: 'INDEX' },
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-5/study%20material', label: 'INDEX' },

    // Past Papers Index
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-4/papers', label: 'INDEX' },
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-5/papers', label: 'INDEX' },

    // Ayan Memon Index
    { url: 'https://ayanmemon296.github.io/GTU-Study-Mates/Sem4/index.html', label: 'INDEX' },
];

// Add Darshan University URLs for each subject specifically as they are deep linked
targetSubjects.forEach(s => {
    startUrls.push({
        url: `https://darshan.ac.in/gtu-study-material/${s.code}-${s.name.replace(/ /g, '-')}`,
        label: 'DARSHAN_MATERIAL'
    });
});

const crawler = new CheerioCrawler({
    requestHandler: router,
    maxRequestsPerCrawl: 70, // Slightly higher to account for sem 5
    minConcurrency: 1,
    maxConcurrency: 10,
});

console.log('--- Starting Discovery & Metadata Phase ---');
await crawler.run(startUrls);

console.log('--- Starting Enrichment Phase (YouTube) ---');
for (const subject of targetSubjects) {
    console.log(`Enriching ${subject.name} (${subject.code})...`);
    const videos = await getYouTubeVideos(subject.name, subject.code);
    const dataset = await Dataset.open();
    for (const video of videos) {
        await dataset.pushData({
            type: 'video',
            subjectCode: subject.code,
            title: video.title,
            fileUrl: video.url,
            source: 'youtube.com',
        });
    }
}

// Storage: Export to JSON ready for Convex ingestion
await Dataset.exportToJSON('core_subjects_syllabus');
console.log('--- Pipeline Complete ---');
console.log('Data exported to storage/key_value_stores/default/core_subjects_syllabus.json');
