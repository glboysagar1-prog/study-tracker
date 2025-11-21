import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("🚀 Starting comprehensive data seeding...")

# ===== SUBJECTS =====
subjects = [
    {
        "subject_code": "3110005",
        "subject_name": "Basic Electronics",
        "branch": "Computer Engineering",
        "semester": 1,
        "credits": 4,
        "course": "BE"
    },
    {
        "subject_code": "3110003",
        "subject_name": "Programming for Problem Solving",
        "branch": "Computer Engineering",
        "semester": 1,
        "credits": 6,
        "course": "BE"
    },
    {
        "subject_code": "3130702",
        "subject_name": "Data Structures",
        "branch": "Computer Engineering",
        "semester": 3,
        "credits": 5,
        "course": "BE"
    },
    {
        "subject_code": "3140705",
        "subject_name": "Database Management Systems",
        "branch": "Computer Engineering",
        "semester": 4,
        "credits": 5,
        "course": "BE"
    },
    {
        "subject_code": "3150710",
        "subject_name": "Operating Systems",
        "branch": "Computer Engineering",
        "semester": 5,
        "credits": 5,
        "course": "BE"
    }
]

print("\n📚 Inserting subjects...")
for subject in subjects:
    try:
        existing = supabase.table("subjects").select("*").eq("subject_code", subject["subject_code"]).execute()
        if not existing.data:
            supabase.table("subjects").insert(subject).execute()
            print(f"  ✅ {subject['subject_name']}")
        else:
            print(f"  ⏭️  {subject['subject_name']} (already exists)")
    except Exception as e:
        print(f"  ❌ Error with {subject['subject_name']}: {e}")

# ===== STUDY MATERIALS =====
study_materials = [
    # Basic Electronics
    {"subject_code": "3110005", "title": "Unit 1: Semiconductor Diodes", "material_type": "notes", "description": "PN Junction, Diode characteristics", "unit": 1, "file_url": "https://example.com/be_unit1.pdf"},
    {"subject_code": "3110005", "title": "Unit 2: Transistors", "material_type": "notes", "description": "BJT, FET, MOSFET", "unit": 2, "file_url": "https://example.com/be_unit2.pdf"},
    {"subject_code": "3110005", "title": "Complete Lab Manual", "material_type": "lab", "description": "All practicals with circuits", "unit": 0, "file_url": "https://example.com/be_lab.pdf"},
    {"subject_code": "3110005", "title": "Reference Book: Electronics Fundamentals", "material_type": "book", "description": "Floyd - Electronics Fundamentals", "unit": 0, "file_url": "https://example.com/be_book.pdf"},
    
    # Programming
    {"subject_code": "3110003", "title": "Unit 1: Introduction to C", "material_type": "notes", "description": "Basics of C programming", "unit": 1, "file_url": "https://example.com/c_unit1.pdf"},
    {"subject_code": "3110003", "title": "Unit 2: Control Structures", "material_type": "notes", "description": "If-else, loops, switch", "unit": 2, "file_url": "https://example.com/c_unit2.pdf"},
    {"subject_code": "3110003", "title": "Unit 3: Arrays and Strings", "material_type": "notes", "description": "Array operations, string functions", "unit": 3, "file_url": "https://example.com/c_unit3.pdf"},
    {"subject_code": "3110003", "title": "Lab Programs Collection", "material_type": "lab", "description": "50+ solved programs", "unit": 0, "file_url": "https://example.com/c_lab.pdf"},
    
    # Data Structures
    {"subject_code": "3130702", "title": "Unit 1: Introduction to DS", "material_type": "notes", "description": "Arrays, Linked Lists", "unit": 1, "file_url": "https://example.com/ds_unit1.pdf"},
    {"subject_code": "3130702", "title": "Unit 2: Stacks and Queues", "material_type": "notes", "description": "Stack operations, Queue types", "unit": 2, "file_url": "https://example.com/ds_unit2.pdf"},
    {"subject_code": "3130702", "title": "Unit 3: Trees", "material_type": "notes", "description": "Binary trees, BST, AVL", "unit": 3, "file_url": "https://example.com/ds_unit3.pdf"},
    {"subject_code": "3130702", "title": "Unit 4: Graphs", "material_type": "notes", "description": "Graph traversal, shortest path", "unit": 4, "file_url": "https://example.com/ds_unit4.pdf"},
    {"subject_code": "3130702", "title": "Complete PPT Set", "material_type": "ppt", "description": "All units presentation", "unit": 0, "file_url": "https://example.com/ds_ppt.pdf"},
    
    # DBMS
    {"subject_code": "3140705", "title": "Unit 1: Database Concepts", "material_type": "notes", "description": "ER Model, Relational Model", "unit": 1, "file_url": "https://example.com/dbms_unit1.pdf"},
    {"subject_code": "3140705", "title": "Unit 2: SQL", "material_type": "notes", "description": "DDL, DML, DCL commands", "unit": 2, "file_url": "https://example.com/dbms_unit2.pdf"},
    {"subject_code": "3140705", "title": "Unit 3: Normalization", "material_type": "notes", "description": "1NF to BCNF", "unit": 3, "file_url": "https://example.com/dbms_unit3.pdf"},
    {"subject_code": "3140705", "title": "SQL Practice Book", "material_type": "book", "description": "500+ SQL queries", "unit": 0, "file_url": "https://example.com/dbms_book.pdf"},
    
    # Operating Systems
    {"subject_code": "3150710", "title": "Unit 1: OS Introduction", "material_type": "notes", "description": "OS concepts, types", "unit": 1, "file_url": "https://example.com/os_unit1.pdf"},
    {"subject_code": "3150710", "title": "Unit 2: Process Management", "material_type": "notes", "description": "Process states, scheduling", "unit": 2, "file_url": "https://example.com/os_unit2.pdf"},
    {"subject_code": "3150710", "title": "Unit 3: Memory Management", "material_type": "notes", "description": "Paging, Segmentation", "unit": 3, "file_url": "https://example.com/os_unit3.pdf"},
    {"subject_code": "3150710", "title": "Unit 4: Deadlocks", "material_type": "notes", "description": "Deadlock prevention and recovery", "unit": 4, "file_url": "https://example.com/os_unit4.pdf"},
]

print("\n📖 Inserting study materials...")
for material in study_materials:
    try:
        supabase.table("study_materials").insert(material).execute()
        print(f"  ✅ {material['title']}")
    except Exception as e:
        print(f"  ⚠️  {material['title']}: {str(e)[:50]}")

# ===== VIDEO PLAYLISTS =====
video_playlists = [
    {"subject_code": "3110005", "playlist_name": "Basic Electronics Complete Course", "youtube_playlist_url": "https://youtube.com/playlist?list=PLBlnK6fEyqRiw-GZRqfNQh7_hw8wWB7y0", "channel_name": "Neso Academy", "total_videos": 50},
    {"subject_code": "3110003", "playlist_name": "C Programming Full Course", "youtube_playlist_url": "https://youtube.com/playlist?list=PLBlnK6fEyqRhX6r2uhhlubuF5QextdCSM", "channel_name": "Neso Academy", "total_videos": 100},
    {"subject_code": "3130702", "playlist_name": "Data Structures", "youtube_playlist_url": "https://youtube.com/playlist?list=PLBlnK6fEyqRj9lld8sWIUNwlKfdUoPd1Y", "channel_name": "Neso Academy", "total_videos": 80},
    {"subject_code": "3140705", "playlist_name": "DBMS Complete Course", "youtube_playlist_url": "https://youtube.com/playlist?list=PLBlnK6fEyqRiyryTrbKHX1Sh9luYI0dhX", "channel_name": "Neso Academy", "total_videos": 60},
    {"subject_code": "3150710", "playlist_name": "Operating Systems", "youtube_playlist_url": "https://youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O", "channel_name": "Neso Academy", "total_videos": 70},
]

print("\n🎥 Inserting video playlists...")
for playlist in video_playlists:
    try:
        supabase.table("video_playlists").insert(playlist).execute()
        print(f"  ✅ {playlist['playlist_name']}")
    except Exception as e:
        print(f"  ⚠️  {playlist['playlist_name']}: {str(e)[:50]}")

# ===== IMPORTANT QUESTIONS =====
important_questions = [
    # Data Structures
    {"subject_code": "3130702", "unit": 1, "question_text": "Explain different types of linked lists with diagrams.", "marks": 7, "difficulty": "medium", "frequency": 5, "last_asked_year": "2024"},
    {"subject_code": "3130702", "unit": 2, "question_text": "What is a stack? Write algorithms for push and pop operations.", "marks": 7, "difficulty": "easy", "frequency": 8, "last_asked_year": "2024"},
    {"subject_code": "3130702", "unit": 3, "question_text": "Explain Binary Search Tree with insertion and deletion.", "marks": 7, "difficulty": "medium", "frequency": 7, "last_asked_year": "2024"},
    {"subject_code": "3130702", "unit": 4, "question_text": "Write Dijkstra's algorithm for shortest path.", "marks": 7, "difficulty": "hard", "frequency": 6, "last_asked_year": "2023"},
    
    # DBMS
    {"subject_code": "3140705", "unit": 1, "question_text": "Explain ER model with example.", "marks": 7, "difficulty": "easy", "frequency": 9, "last_asked_year": "2024"},
    {"subject_code": "3140705", "unit": 2, "question_text": "Write SQL queries for JOIN operations.", "marks": 7, "difficulty": "medium", "frequency": 8, "last_asked_year": "2024"},
    {"subject_code": "3140705", "unit": 3, "question_text": "Explain normalization up to BCNF with example.", "marks": 7, "difficulty": "hard", "frequency": 7, "last_asked_year": "2024"},
    
    # OS
    {"subject_code": "3150710", "unit": 2, "question_text": "Explain CPU scheduling algorithms.", "marks": 7, "difficulty": "medium", "frequency": 9, "last_asked_year": "2024"},
    {"subject_code": "3150710", "unit": 3, "question_text": "Explain paging with example.", "marks": 7, "difficulty": "medium", "frequency": 8, "last_asked_year": "2024"},
    {"subject_code": "3150710", "unit": 4, "question_text": "Explain Banker's algorithm for deadlock avoidance.", "marks": 7, "difficulty": "hard", "frequency": 7, "last_asked_year": "2023"},
]

print("\n❓ Inserting important questions...")
for question in important_questions:
    try:
        supabase.table("important_questions").insert(question).execute()
        print(f"  ✅ {question['question_text'][:50]}...")
    except Exception as e:
        print(f"  ⚠️  Question: {str(e)[:50]}")

# ===== LAB PROGRAMS =====
lab_programs = [
    {
        "subject_code": "3130702",
        "practical_number": 1,
        "program_title": "Stack Implementation",
        "aim": "Implement stack using array",
        "code": """#include <stdio.h>
#define MAX 100
int stack[MAX], top = -1;

void push(int val) {
    if(top == MAX-1) printf("Stack Overflow\\n");
    else stack[++top] = val;
}

int pop() {
    if(top == -1) {
        printf("Stack Underflow\\n");
        return -1;
    }
    return stack[top--];
}

int main() {
    push(10);
    push(20);
    printf("%d\\n", pop());
    return 0;
}""",
        "output": "20",
        "viva_questions": ["What is stack overflow?", "What is LIFO?", "Applications of stack?"],
        "language": "C"
    },
    {
        "subject_code": "3130702",
        "practical_number": 2,
        "program_title": "Binary Search Tree",
        "aim": "Implement BST insertion and traversal",
        "code": """struct Node {
    int data;
    struct Node *left, *right;
};

struct Node* insert(struct Node* root, int val) {
    if(!root) {
        root = malloc(sizeof(struct Node));
        root->data = val;
        root->left = root->right = NULL;
    }
    else if(val < root->data)
        root->left = insert(root->left, val);
    else
        root->right = insert(root->right, val);
    return root;
}""",
        "output": "Inorder: 10 20 30 40 50",
        "viva_questions": ["What is BST property?", "Time complexity of search?"],
        "language": "C"
    }
]

print("\n💻 Inserting lab programs...")
for lab in lab_programs:
    try:
        supabase.table("lab_programs").insert(lab).execute()
        print(f"  ✅ {lab['program_title']}")
    except Exception as e:
        print(f"  ⚠️  {lab['program_title']}: {str(e)[:50]}")

print("\n✨ Data seeding complete!")
print("\n📊 Summary:")
print(f"  - {len(subjects)} subjects")
print(f"  - {len(study_materials)} study materials")
print(f"  - {len(video_playlists)} video playlists")
print(f"  - {len(important_questions)} important questions")
print(f"  - {len(lab_programs)} lab programs")
