import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Save syllabus content to database
 */
export async function saveSyllabusContent(data) {
    const { subject_code, unit, unit_title, topic, content, source_url } = data;

    try {
        // Check if content already exists
        const { data: existing } = await supabase
            .from('syllabus_content')
            .select('id')
            .eq('subject_code', subject_code)
            .eq('unit', unit)
            .eq('topic', topic)
            .maybeSingle();

        let result, error;

        if (existing) {
            // Update existing record
            ({ data: result, error } = await supabase
                .from('syllabus_content')
                .update({
                    unit_title,
                    content,
                    source_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id));
        } else {
            // Insert new record
            ({ data: result, error } = await supabase
                .from('syllabus_content')
                .insert({
                    subject_code,
                    unit,
                    unit_title,
                    topic,
                    content,
                    source_url,
                    created_at: new Date().toISOString()
                }));
        }

        if (error) throw error;
        console.log(`✓ Saved syllabus content: ${subject_code} - Unit ${unit} - ${topic}`);
        return result;
    } catch (error) {
        console.error('Error saving syllabus content:', error.message);
        // Don't throw, just log to allow scraping to continue
        return null;
    }
}

/**
 * Save PDF metadata to database
 */
export async function saveNotePDF(data) {
    const { subject_code, unit, title, description, file_url, source_url, source_name } = data;

    try {
        const { data: result, error } = await supabase
            .from('notes')
            .insert({
                subject_code,
                unit,
                title,
                description,
                file_url,
                source_url,
                source_name: source_name || 'GTU Official',
                created_at: new Date().toISOString()
            });

        if (error) {
            // Check if it's a duplicate
            if (error.code === '23505') {
                console.log(`⚠ PDF already exists: ${title}`);
                return null;
            }
            throw error;
        }

        console.log(`✓ Saved PDF metadata: ${title}`);
        return result;
    } catch (error) {
        console.error('Error saving PDF metadata:', error.message);
        throw error;
    }
}

/**
 * Save exam schedule
 */
export async function saveExamSchedule(data) {
    const { exam_name, exam_date, subject_code, time_slot, announcement_url } = data;

    try {
        const { data: result, error } = await supabase
            .from('exam_schedules')
            .insert({
                exam_name,
                exam_date,
                subject_code,
                time_slot,
                announcement_url,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log(`✓ Saved exam schedule: ${exam_name}`);
        return result;
    } catch (error) {
        console.error('Error saving exam schedule:', error.message);
        throw error;
    }
}

/**
 * Save circular/notification
 */
export async function saveCircular(data) {
    const { title, content, circular_date, pdf_url, category } = data;

    try {
        const { data: result, error } = await supabase
            .from('circulars')
            .insert({
                title,
                content,
                circular_date,
                pdf_url,
                category,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log(`✓ Saved circular: ${title}`);
        return result;
    } catch (error) {
        console.error('Error saving circular:', error.message);
        throw error;
    }
}

/**
 * Save result statistics
 */
export async function saveResultStatistics(data) {
    const { exam_name, exam_date, branch_code, semester, total_students, passed_students, pass_percentage, source_url } = data;

    try {
        const { data: result, error } = await supabase
            .from('result_statistics')
            .insert({
                exam_name,
                exam_date,
                branch_code,
                semester,
                total_students,
                passed_students,
                pass_percentage,
                source_url,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log(`✓ Saved result stats: ${exam_name}`);
        return result;
    } catch (error) {
        console.error('Error saving result stats:', error.message);
        throw error;
    }
}

/**
 * Save question bank item
 */
export async function saveQuestionBankItem(data) {
    const { subject_code, question_text, options, correct_answer, explanation, difficulty, topic, source_name, source_url } = data;

    try {
        const { data: result, error } = await supabase
            .from('question_banks')
            .insert({
                subject_code,
                question_text,
                options,
                correct_answer,
                explanation,
                difficulty,
                topic,
                source_name,
                source_url,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log(`✓ Saved question: ${question_text.substring(0, 30)}...`);
        return result;
    } catch (error) {
        console.error('Error saving question bank item:', error.message);
        throw error;
    }
}

/**
 * Get all subjects from database
 */
export async function getAllSubjects() {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('subject_code, subject_name, semester, branch');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching subjects:', error.message);
        return [];
    }
}
