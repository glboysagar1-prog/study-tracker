import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add sample syllabus content for Data Structures (2140701)
syllabus_topics = [
    {
        "subject_code": "2140701",
        "unit": 1,
        "unit_title": "Introduction to Data Structures",
        "topic": "Arrays and Pointers",
        "content": "One-dimensional arrays, Multi-dimensional arrays, Pointers, Pointer arithmetic, Arrays and pointers",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "2140701",
        "unit": 1,
        "unit_title": "Introduction to Data Structures",
        "topic": "Strings",
        "content": "String operations, String library functions",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "2140701",
        "unit": 2,
        "unit_title": "Stacks and Queues",
        "topic": "Stack Operations",
        "content": "Definition, Implementation using arrays, Push, Pop, Peek operations, Applications of stacks",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "2140701",
        "unit": 2,
        "unit_title": "Stacks and Queues",
        "topic": "Queue Operations",
        "content": "Definition, Implementation, Circular queues, Dequeue, Priority queues",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "2140701",
        "unit": 3,
        "unit_title": "Linked Lists",
        "topic": "Singly Linked Lists",
        "content": "Definition, Representation, Insertion, Deletion, Traversal operations",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "2140701",
        "unit": 3,
        "unit_title": "Linked Lists",
        "topic": "Advanced Linked Lists",
        "content": "Doubly linked lists, Circular linked lists, Applications",
        "source_url": "https://www.gtu.ac.in"
    },
]

# Add sample syllabus content for DBMS (3140703)
syllabus_topics.extend([
    {
        "subject_code": "3140703",
        "unit": 1,
        "unit_title": "Introduction to DBMS",
        "topic": "Database Concepts",
        "content": "Database, DBMS, Database System, Advantages of DBMS, Database Architecture",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "3140703",
        "unit": 1,
        "unit_title": "Introduction to DBMS",
        "topic": "Data Models",
        "content": "Hierarchical, Network, Relational, Object-oriented data models",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "3140703",
        "unit": 2,
        "unit_title": "Relational Model",
        "topic": "Relational Algebra",
        "content": "Selection, Projection, Union, Set difference, Cartesian product, Join operations",
        "source_url": "https://www.gtu.ac.in"
    },
    {
        "subject_code": "3140703",
        "unit": 2,
        "unit_title": "Relational Model",
        "topic": "Normalization",
        "content": "Functional dependencies, 1NF, 2NF, 3NF, BCNF",
        "source_url": "https://www.gtu.ac.in"
    },
])

print("Inserting syllabus topics...")
for topic in syllabus_topics:
    try:
        supabase.table("syllabus_content").insert(topic).execute()
        print(f"✓ Inserted: {topic['subject_code']} - Unit {topic['unit']} - {topic['topic']}")
    except Exception as e:
        print(f"✗ Skipped (likely duplicate): {topic['topic']}")

print("\n✅ Sample syllabus topics added successfully!")
