from backend.supabase_client import supabase

def init_sample_data():
    # Create sample subjects
    subjects_data = [
        {
            'course': 'B.E.',
            'branch': 'Computer Engineering',
            'semester': '3',
            'subject_code': '2140701',
            'subject_name': 'Data Structures',
            'credits': 5
        },
        {
            'course': 'B.E.',
            'branch': 'Computer Engineering',
            'semester': '3',
            'subject_code': '2140702',
            'subject_name': 'Database Management Systems',
            'credits': 5
        }
    ]
    
    subject_ids = []
    for subj_data in subjects_data:
        try:
            result = supabase.table("subjects").insert(subj_data).execute()
            if result.data and len(result.data) > 0:
                subject_ids.append(result.data[0]["id"])
                print(f"Created subject: {result.data[0]['subject_name']}")
        except Exception as e:
            print(f"Error creating subject: {str(e)}")
    
    if len(subject_ids) >= 2:
        ds_subject_id = subject_ids[0]
        dbms_subject_id = subject_ids[1]
        
        # Create sample syllabus entries
        syllabus_data = [
            {
                'subject_id': ds_subject_id,
                'unit_number': 1,
                'unit_title': 'Introduction to Data Structures',
                'content': 'Basic concepts, Arrays, Linked Lists'
            },
            {
                'subject_id': ds_subject_id,
                'unit_number': 2,
                'unit_title': 'Stacks and Queues',
                'content': 'Stack operations, Queue operations, Applications'
            },
            {
                'subject_id': dbms_subject_id,
                'unit_number': 1,
                'unit_title': 'Introduction to DBMS',
                'content': 'Database concepts, ER Model, Relational Model'
            }
        ]
        
        for syll_data in syllabus_data:
            try:
                result = supabase.table("syllabus").insert(syll_data).execute()
                if result.data and len(result.data) > 0:
                    print(f"Created syllabus: {result.data[0]['unit_title']}")
            except Exception as e:
                print(f"Error creating syllabus: {str(e)}")
        
        # Create sample questions
        questions_data = [
            {
                'subject_id': ds_subject_id,
                'unit_number': 1,
                'question_text': 'What is a data structure?',
                'marks': 3,
                'question_type': 'Short',
                'ai_explanation': 'A data structure is a way of organizing and storing data...'
            },
            {
                'subject_id': ds_subject_id,
                'unit_number': 1,
                'question_text': 'Differentiate between arrays and linked lists.',
                'marks': 7,
                'question_type': 'Long',
                'ai_explanation': 'Arrays have fixed size, contiguous memory allocation...'
            },
            {
                'subject_id': ds_subject_id,
                'unit_number': 2,
                'question_text': 'What are the applications of stack?',
                'marks': 4,
                'question_type': 'Short',
                'ai_explanation': 'Stacks are used in function calls, expression evaluation...'
            }
        ]
        
        for q_data in questions_data:
            try:
                result = supabase.table("questions").insert(q_data).execute()
                if result.data and len(result.data) > 0:
                    print(f"Created question: {result.data[0]['question_text'][:50]}...")
            except Exception as e:
                print(f"Error creating question: {str(e)}")
    
    print("Sample data creation completed!")

if __name__ == '__main__':
    init_sample_data()