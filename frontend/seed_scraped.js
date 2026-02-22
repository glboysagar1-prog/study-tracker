import { ConvexClient } from "convex/browser";
import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(".env.local", "utf-8");
const convexUrlMatch = envContent.match(/VITE_CONVEX_URL=(.+)/);
const convexUrl = convexUrlMatch ? convexUrlMatch[1].trim() : null;

if (!convexUrl) {
    console.error("VITE_CONVEX_URL not found in .env.local");
    process.exit(1);
}

const client = new ConvexClient(convexUrl);

async function seed() {
    const dataPath = path.resolve("../gtu-scraper/storage/key_value_stores/default/gtu_semester_4_materials.json");
    if (!fs.existsSync(dataPath)) {
        console.error("Scraped data not found at", dataPath);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    console.log(`Read ${data.length} materials. Seeding to Convex...`);

    // Ingest in chunks to avoid payload limits if any
    const chunkSize = 50;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        console.log(`Seeding chunk ${i / chunkSize + 1}/${Math.ceil(data.length / chunkSize)}...`);
        // Calling the mutation. We need the API name. 
        // In Convex 1.x, we use the function path.
        await client.mutation("scrapedMaterials:addBatch", { materials: chunk });
    }

    console.log("Seeding complete!");
    process.exit(0);
}

seed().catch(console.error);
