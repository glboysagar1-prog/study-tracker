import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function verifyData() {
    console.log('🔍 Verifying Scraped Data in Database...\n');

    const tables = [
        'syllabus_content',
        'notes',
        'video_resources',
        'question_banks',
        'circulars',
        'exam_schedules',
        'result_statistics'
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ Error checking ${table}:`, error.message);
        } else {
            console.log(`📊 ${table}: ${count} records`);
        }
    }

    // Check for a specific recent scraped item to confirm live data
    const { data: recentNotes } = await supabase
        .from('notes')
        .select('title, source_name')
        .order('created_at', { ascending: false })
        .limit(3);

    if (recentNotes && recentNotes.length > 0) {
        console.log('\n📝 Most recent notes:');
        recentNotes.forEach(note => console.log(`   - ${note.title} (${note.source_name})`));
    }
}

verifyData();
