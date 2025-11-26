import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    saveSyllabusContent,
    saveNotePDF,
    saveExamSchedule,
    saveCircular,
    saveResultStatistics,
    saveQuestionBankItem,
    getAllSubjects
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to save video resource (since it wasn't exported from database.js)
async function saveVideoResource(data) {
    try {
        const { data: result, error } = await supabase
            .from('video_resources')
            .insert(data);

        if (error) throw error;
        console.log(`✓ Saved video: ${data.title}`);
        return result;
    } catch (error) {
        console.error('Error saving video resource:', error.message);
    }
}

async function seedData() {
    console.log('🌱 Starting Database Seeding...');

    try {
        // 1. Ensure we have subjects
        const subjects = await getAllSubjects();
        let subjectCode = '2140701'; // Default: Data Structures

        if (subjects.length > 0) {
            subjectCode = subjects[0].subject_code;
            console.log(`Using subject: ${subjects[0].subject_name} (${subjectCode})`);
        } else {
            console.log('⚠ No subjects found. Creating dummy subject...');
            // Add dummy subject logic if needed, but assuming subjects exist from previous steps
        }

        // 2. Seed Syllabus Content
        console.log('\n📚 Seeding Syllabus Content...');
        await saveSyllabusContent({
            subject_code: subjectCode,
            unit: 1,
            unit_title: 'Introduction to Data Structures',
            topic: 'Arrays and Linked Lists',
            content: 'Arrays are linear data structures... Linked Lists consist of nodes...',
            source_url: 'https://www.geeksforgeeks.org/data-structures/'
        });

        // 3. Seed Notes (PDFs)
        console.log('\n📝 Seeding Notes...');
        await saveNotePDF({
            subject_code: subjectCode,
            unit: 1,
            title: 'Data Structures Unit 1 - Full Notes',
            description: 'Comprehensive notes covering Arrays, Stacks, and Queues.',
            file_url: 'https://www.gtu.ac.in/syllabus/NEW%20BE/Sem4/2140702.pdf', // Dummy PDF link
            source_url: 'https://www.gtustudy.com',
            source_name: 'GTUStudy'
        });

        // 4. Seed Video Resources
        console.log('\n🎥 Seeding Video Resources...');
        await saveVideoResource({
            subject_code: subjectCode,
            title: 'Data Structures Complete Course - Lecture 1',
            description: 'Introduction to Data Structures by NPTEL.',
            video_url: 'https://www.youtube.com/watch?v=zWg7U0OEAoE',
            duration: 3600,
            platform: 'NPTEL',
            channel_name: 'NPTEL-NOC IITM',
            views: 15000,
            created_at: new Date().toISOString()
        });

        await saveVideoResource({
            subject_code: subjectCode,
            title: 'Learn Data Structures in 20 Minutes',
            description: 'Quick overview of DS concepts.',
            video_url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
            duration: 1200,
            platform: 'YouTube',
            channel_name: 'Programming with Mosh',
            views: 500000,
            created_at: new Date().toISOString()
        });

        await saveVideoResource({
            subject_code: subjectCode,
            title: 'Advanced Data Structures',
            description: 'Coursera course on Graphs and Trees.',
            video_url: 'https://www.coursera.org/learn/advanced-data-structures',
            platform: 'Coursera',
            channel_name: 'Coursera',
            created_at: new Date().toISOString()
        });

        // 5. Seed Question Banks
        console.log('\n❓ Seeding Question Banks...');
        await saveQuestionBankItem({
            subject_code: subjectCode,
            question_text: 'Which data structure is used for recursion?',
            options: { a: 'Queue', b: 'Stack', c: 'Array', d: 'Linked List' },
            correct_answer: 'Stack',
            explanation: 'Stack is used to maintain the function call stack during recursion.',
            difficulty: 'Easy',
            topic: 'Stack',
            source_name: 'Sanfoundry',
            source_url: 'https://www.sanfoundry.com'
        });

        await saveQuestionBankItem({
            subject_code: subjectCode,
            question_text: 'What is the time complexity of binary search?',
            options: { a: 'O(n)', b: 'O(log n)', c: 'O(n^2)', d: 'O(1)' },
            correct_answer: 'O(log n)',
            explanation: 'Binary search divides the search space in half at each step.',
            difficulty: 'Medium',
            topic: 'Algorithms',
            source_name: 'IndiaBIX',
            source_url: 'https://www.indiabix.com'
        });

        // 6. Seed Circulars
        console.log('\n📢 Seeding Circulars...');
        await saveCircular({
            title: 'Winter 2024 Exam Form Filling Extended',
            content: 'The last date for filling exam forms has been extended to 30th Nov.',
            circular_date: new Date().toISOString().split('T')[0],
            pdf_url: 'https://www.gtu.ac.in/Circular.aspx',
            category: 'Examination'
        });

        await saveCircular({
            title: 'Reddit Discussion: Best resources for DS?',
            content: 'Discussion on r/GTU about the best books and videos for Data Structures.',
            circular_date: new Date().toISOString().split('T')[0],
            pdf_url: 'https://www.reddit.com/r/GTU/comments/xyz/ds_resources',
            category: 'Community Discussion'
        });

        // 7. Seed Exam Schedules
        console.log('\n📅 Seeding Exam Schedules...');
        await saveExamSchedule({
            exam_name: 'Winter 2024 Regular Exam',
            exam_date: '2024-12-15',
            subject_code: subjectCode,
            time_slot: '10:30 AM - 01:00 PM',
            announcement_url: 'https://timetable.gtu.ac.in'
        });

        // 8. Seed Result Statistics
        console.log('\n📊 Seeding Result Statistics...');
        await saveResultStatistics({
            exam_name: 'Summer 2024',
            exam_date: '2024-05-20',
            branch_code: '07', // Computer Engineering
            semester: 4,
            total_students: 15000,
            passed_students: 12500,
            pass_percentage: 83.33,
            source_url: 'https://www.gturesults.in'
        });

        console.log('\n✅ Database Seeding Completed Successfully!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    }
}

seedData();
