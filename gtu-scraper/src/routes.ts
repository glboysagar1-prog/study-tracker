import { createCheerioRouter } from 'crawlee';
import axios from 'axios';

export const router = createCheerioRouter();

// The Discovery Phase: Extract PDF and PPT download URLs.
router.addDefaultHandler(async ({ enqueueLinks, log, request }) => {
    log.info(`Enqueuing new URLs from ${request.url}`);

    const url = new URL(request.url);

    if (url.hostname === 'gtumaterial.com') {
        // Enqueue subject specific pages if we are on the semester index
        await enqueueLinks({
            globs: ['https://gtumaterial.com/gtu/materials/*/*/*/*'],
            label: 'GTU_MATERIAL_SUBJECT',
        });
    } else if (url.hostname === 'ayanmemon296.github.io') {
        // Enqueue subject pages from Ayan Memon index
        await enqueueLinks({
            selector: 'a[href$=".html"]',
            label: 'AYAN_MEMON_SUBJECT',
        });
    }
});

// The Metadata Phase: Extract Subject_Name, Subject_Code, and Unit_Number.
router.addHandler('GTU_MATERIAL_SUBJECT', async ({ $, request, log, pushData }) => {
    const title = $('title').text();
    log.info(`Scraping GTU Material Subject: ${title}`);

    // Extract subject code from URL or content
    const urlParts = request.url.split('/');
    const subjectCode = urlParts.find(p => /^\d{7}$/.test(p)) || 'Unknown';

    // Discovery Phase: Extract direct PDF URLs
    const pdfLinks: { title: string, url: string }[] = [];
    $('a[href*="drive.google.com"], a[href$=".pdf"]').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href) {
            pdfLinks.push({ title: text || 'Study Material', url: href });
        }
    });

    for (const link of pdfLinks) {
        await pushData({
            type: 'pdf',
            subjectCode,
            title: link.title.replace(/\s+/g, ' '),
            fileUrl: link.url,
            source: 'gtumaterial.com',
        });
    }
});

router.addHandler('AYAN_MEMON_SUBJECT', async ({ $, request, log, pushData }) => {
    const subjectMap: Record<string, string> = {
        'OS.html': '3140702',
        'OOP.html': '3140705',
        'COA.html': '3140707',
        'DM.html': '3140708',
        'PEM.html': '3140709'
    };

    const fileName = request.url.split('/').pop() || '';
    const subjectCode = subjectMap[fileName] || 'Unknown';
    const title = $('h2').first().text().trim() || $('title').text();

    log.info(`Scraping Ayan Memon Subject: ${title} (${subjectCode})`);

    // Extract IMP and Lab Files
    $('a[href*="drive.google.com"], a[href$=".pdf"]').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).closest('tr').find('td').first().text().trim() || $(el).text().trim();
        if (href) {
            pushData({
                type: 'pdf',
                subjectCode,
                title: text || 'Lab/IMP Material',
                fileUrl: href,
                source: 'ayanmemon296.github.io',
            });
        }
    });
});

// Selector for Darshan University
router.addHandler('DARSHAN_MATERIAL', async ({ $, request, log, pushData }) => {
    log.info(`Scraping Darshan Subject: ${request.url}`);

    const subjectCodeMatch = request.url.match(/(\d{7})/);
    const subjectCode = subjectCodeMatch ? subjectCodeMatch[1] : 'Unknown';

    // Look for PPTs and Units
    $('.table tr').each((_, el) => {
        const unitText = $(el).find('td').first().text().trim();
        const unitMatch = unitText.match(/Unit\s*(\d+)/i);
        const unitNumber = unitMatch ? parseInt(unitMatch[1]) : undefined;

        const downloadElement = $(el).find('a[href*="download"], a[href$=".ppt"], a[href$=".pptx"], a[href$=".pdf"]');
        const downloadLink = downloadElement.attr('href');

        if (downloadLink) {
            const fullUrl = downloadLink.startsWith('http') ? downloadLink : `https://darshan.ac.in${downloadLink}`;
            pushData({
                type: fullUrl.includes('.ppt') ? 'ppt' : 'pdf',
                subjectCode,
                title: $(el).find('td').eq(1).text().trim() || `Unit ${unitNumber || ''} Material`,
                fileUrl: fullUrl,
                source: 'darshan.ac.in',
                unit: unitNumber,
            });
        }
    });
});

// The Enrichment Phase: YouTube search helper
export async function getYouTubeVideos(subjectName: string, subjectCode: string) {
    const query = encodeURIComponent(`${subjectName} ${subjectCode} GTU lectures`);
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const html = response.data;
        const videoIds = [...html.matchAll(/"videoId":"([^"]+)"/g)].map(m => m[1]).slice(0, 3);
        return videoIds.map(id => ({
            id,
            title: `${subjectName} Lecture Video`,
            url: `https://www.youtube.com/watch?v=${id}`
        }));
    } catch (e: any) {
        console.error(`Error fetching YT videos for ${subjectCode}:`, e.message);
        return [];
    }
}
