#!/usr/bin/env python3
"""
Import Crawlee Scraped Data to Supabase

This script imports data scraped by Crawlee from JSON files into your Supabase database.
Supports: notes, syllabus_content, important_questions, reference_materials, video_playlists

Usage:
    python import_crawlee_data.py --data-file scraped_data.json --type notes
    python import_crawlee_data.py --data-file scraped_data.json --type syllabus
"""

import json
import os
import argparse
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_notes(data):
    """Import notes/PDFs data"""
    print(f"📄 Importing {len(data)} notes...")
    
    for item in data:
        try:
            note = {
                'subject_code': item.get('subject_code'),
                'subject_name': item.get('subject_name'),
                'unit': item.get('unit'),
                'title': item.get('title'),
                'description': item.get('description', ''),
                'file_url': item.get('file_url') or item.get('url'),
                'source_url': item.get('source_url'),
                'source_name': item.get('source_name', 'Crawlee Scraper'),
                'downloads': 0,
                'views': 0,
                'is_verified': False
            }
            
            result = supabase.table('notes').insert(note).execute()
            print(f"  ✅ Added: {note['title']}")
            
        except Exception as e:
            print(f"  ❌ Error importing note '{item.get('title')}': {str(e)}")

def import_syllabus_content(data):
    """Import syllabus topics and content"""
    print(f"📚 Importing {len(data)} syllabus items...")
    
    for item in data:
        try:
            content = {
                'subject_code': item.get('subject_code'),
                'subject_name': item.get('subject_name'),
                'unit': item.get('unit'),
                'unit_title': item.get('unit_title', f"Unit {item.get('unit')}"),
                'topic': item.get('topic'),
                'content': item.get('content', ''),
                'source_url': item.get('source_url')
            }
            
            result = supabase.table('syllabus_content').insert(content).execute()
            print(f"  ✅ Added: {content['topic']}")
            
        except Exception as e:
            print(f"  ❌ Error importing syllabus '{item.get('topic')}': {str(e)}")

def import_important_questions(data):
    """Import important questions"""
    print(f"❓ Importing {len(data)} questions...")
    
    for item in data:
        try:
            question = {
                'subject_code': item.get('subject_code'),
                'subject_name': item.get('subject_name'),
                'unit': item.get('unit'),
                'question_text': item.get('question_text') or item.get('question'),
                'answer_text': item.get('answer_text', ''),
                'marks': item.get('marks', 7),
                'difficulty': item.get('difficulty', 'medium'),
                'frequency': item.get('frequency', 1),
                'source_url': item.get('source_url'),
                'source_name': item.get('source_name', 'Crawlee Scraper')
            }
            
            result = supabase.table('important_questions').insert(question).execute()
            print(f"  ✅ Added question: {question['question_text'][:50]}...")
            
        except Exception as e:
            print(f"  ❌ Error importing question: {str(e)}")

def import_reference_materials(data):
    """Import reference materials (books, videos, links)"""
    print(f"📖 Importing {len(data)} reference materials...")
    
    for item in data:
        try:
            material = {
                'subject_code': item.get('subject_code'),
                'subject_name': item.get('subject_name'),
                'material_type': item.get('material_type', 'link'),
                'title': item.get('title'),
                'author': item.get('author'),
                'description': item.get('description', ''),
                'url': item.get('url'),
                'source_url': item.get('source_url'),
                'source_name': item.get('source_name', 'Crawlee Scraper'),
                'isbn': item.get('isbn'),
                'publisher': item.get('publisher'),
                'year': item.get('year'),
                'rating': item.get('rating')
            }
            
            result = supabase.table('reference_materials').insert(material).execute()
            print(f"  ✅ Added: {material['title']}")
            
        except Exception as e:
            print(f"  ❌ Error importing material '{item.get('title')}': {str(e)}")

def import_video_playlists(data):
    """Import video playlists"""
    print(f"🎥 Importing {len(data)} video playlists...")
    
    for item in data:
        try:
            playlist = {
                'subject_code': item.get('subject_code'),
                'subject_name': item.get('subject_name'),
                'playlist_title': item.get('playlist_title') or item.get('title'),
                'platform': item.get('platform', 'YouTube'),
                'playlist_url': item.get('playlist_url') or item.get('url'),
                'description': item.get('description', ''),
                'video_count': item.get('video_count', 0),
                'total_duration': item.get('total_duration'),
                'channel_name': item.get('channel_name'),
                'source_name': item.get('source_name', 'Crawlee Scraper')
            }
            
            result = supabase.table('video_playlists').insert(playlist).execute()
            print(f"  ✅ Added playlist: {playlist['playlist_title']}")
            
        except Exception as e:
            print(f"  ❌ Error importing playlist '{item.get('title')}': {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Import Crawlee scraped data to Supabase')
    parser.add_argument('--data-file', required=True, help='Path to JSON file with scraped data')
    parser.add_argument('--type', required=True, 
                       choices=['notes', 'syllabus', 'questions', 'references', 'videos'],
                       help='Type of data to import')
    
    args = parser.parse_args()
    
    # Load data
    print(f"📂 Loading data from: {args.data_file}")
    
    if not os.path.exists(args.data_file):
        print(f"❌ File not found: {args.data_file}")
        return
    
    with open(args.data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle different data formats
    if isinstance(data, dict):
        # If data is wrapped in an object, try to get the array
        data = data.get('data') or data.get('items') or [data]
    
    if not isinstance(data, list):
        data = [data]
    
    print(f"✅ Loaded {len(data)} items\n")
    
    # Import based on type
    if args.type == 'notes':
        import_notes(data)
    elif args.type == 'syllabus':
        import_syllabus_content(data)
    elif args.type == 'questions':
        import_important_questions(data)
    elif args.type == 'references':
        import_reference_materials(data)
    elif args.type == 'videos':
        import_video_playlists(data)
    
    print(f"\n🎉 Import complete!")

if __name__ == '__main__':
    main()
