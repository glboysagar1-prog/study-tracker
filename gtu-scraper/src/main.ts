import { CheerioCrawler, Dataset } from 'crawlee';
import { router, getYouTubeVideos } from './routes.js';

const subjects = [
    { code: '3140702', name: 'Operating System' },
    { code: '3140705', name: 'Object Oriented Programming - I (Java)' },
    { code: '3140707', name: 'Computer Organization & Architecture' },
    { code: '3140708', name: 'Discrete Mathematics' },
    { code: '3140709', name: 'Principles of Economics and Management' }
];

const startUrls = [
    // GTU Material Index for Semester 4
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-4/study%20material', label: 'INDEX' },
    // Past Papers Index
    { url: 'https://gtumaterial.com/gtu/materials/computer-engineering/semester-4/papers', label: 'INDEX' },
    // Ayan Memon Index
    { url: 'https://ayanmemon296.github.io/GTU-Study-Mates/Sem4/index.html', label: 'INDEX' },
];

// Add Darshan University URLs for each subject specifically as they are deep linked
subjects.forEach(s => {
    startUrls.push({
        url: `https://darshan.ac.in/gtu-study-material/${s.code}-${s.name.replace(/ /g, '-')}`,
        label: 'DARSHAN_MATERIAL'
    });
});

const crawler = new CheerioCrawler({
    requestHandler: router,
    // Optimization: prevent rate-limiting as requested
    maxRequestsPerCrawl: 50,
    minConcurrency: 1,
    maxConcurrency: 10, // Corresponds to requestBatchSize: 10 in spirit
});

console.log('--- Starting Discovery & Metadata Phase ---');
await crawler.run(startUrls);

console.log('--- Starting Enrichment Phase (YouTube) ---');
for (const subject of subjects) {
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
await Dataset.exportToJSON('gtu_semester_4_materials');
console.log('--- Pipeline Complete ---');
console.log('Data exported to storage/key_value_stores/default/gtu_semester_4_materials.json');
