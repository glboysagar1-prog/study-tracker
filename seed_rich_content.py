import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("🚀 Seeding rich content for AI PDF generation...")

# Detailed content for DBMS Unit 1
dbms_unit1_content = [
    {
        "subject_code": "3140705",
        "subject_name": "Database Management Systems",
        "unit": 1,
        "title": "Introduction to Database Systems (GTUStudy)",
        "description": """
        Database System Applications:
        Database systems are widely used in banking, airlines, universities, sales, and manufacturing.
        
        Purpose of Database Systems:
        To overcome the drawbacks of file processing systems like data redundancy, data inconsistency, difficulty in accessing data, data isolation, and integrity problems.
        
        View of Data:
        - Data Abstraction: Hiding complex details. Levels: Physical, Logical, View.
        - Instances and Schemas: Schema is the logical structure, Instance is the actual content at a point in time.
        
        Data Models:
        - Relational Model: Uses tables to represent data and relationships.
        - Entity-Relationship Model: Uses entities and relationships.
        - Object-Based Data Model: Extends E-R with encapsulation, methods, and object identity.
        """,
        "source_name": "GTUStudy",
        "file_url": "https://example.com/dbms_intro_gtustudy.pdf"
    },
    {
        "subject_code": "3140705",
        "subject_name": "Database Management Systems",
        "unit": 1,
        "title": "Database Architecture & Users (GeeksForGeeks)",
        "description": """
        Database Languages:
        - DDL (Data Definition Language): Used to define the database structure (CREATE, ALTER, DROP).
        - DML (Data Manipulation Language): Used for accessing and manipulating data (SELECT, INSERT, UPDATE, DELETE).
        - DCL (Data Control Language): Used for granting and revoking permissions (GRANT, REVOKE).
        
        Database Users:
        - Naive Users: Unsophisticated users who interact via application programs.
        - Application Programmers: Write application programs.
        - Sophisticated Users: Interact with the system without writing programs (analysts).
        - Database Administrators (DBA): Coordinate all activities of the database system.
        
        Database Architecture:
        - Centralized: Runs on a single computer system.
        - Client-Server: Split into front-end (client) and back-end (server).
        """,
        "source_name": "GeeksForGeeks",
        "file_url": "https://example.com/dbms_arch_gfg.pdf"
    },
    {
        "subject_code": "3140705",
        "subject_name": "Database Management Systems",
        "unit": 1,
        "title": "ER Modeling Concepts (TutorialsPoint)",
        "description": """
        Entity-Relationship (ER) Model:
        - Entity: A "thing" or "object" in the real world that is distinguishable from other objects.
        - Entity Set: A set of entities of the same type.
        - Attributes: Descriptive properties possessed by each member of an entity set. Types: Simple, Composite, Single-valued, Multi-valued, Derived.
        
        Relationships:
        - Relationship: An association among several entities.
        - Relationship Set: A set of relationships of the same type.
        
        Mapping Cardinalities:
        - One-to-One
        - One-to-Many
        - Many-to-One
        - Many-to-Many
        
        Keys:
        - Super Key: A set of one or more attributes that uniquely identify an entity.
        - Candidate Key: A minimal super key.
        - Primary Key: A candidate key chosen by the database designer.
        """,
        "source_name": "TutorialsPoint",
        "file_url": "https://example.com/dbms_er_tutorial.pdf"
    }
]

# Detailed content for Data Structures Unit 2
ds_unit2_content = [
    {
        "subject_code": "3130702",
        "subject_name": "Data Structures",
        "unit": 2,
        "title": "Linear Data Structures: Stack (JavaTpoint)",
        "description": """
        Stack:
        A linear data structure which follows a particular order in which the operations are performed. The order may be LIFO (Last In First Out) or FILO (First In Last Out).
        
        Main Operations:
        - Push: Adds an item in the stack. If the stack is full, then it is said to be an Overflow condition.
        - Pop: Removes an item from the stack. The items are popped in the reversed order in which they are pushed. If the stack is empty, then it is said to be an Underflow condition.
        - Peek or Top: Returns top element of stack.
        - isEmpty: Returns true if stack is empty, else false.
        
        Applications of Stack:
        - Balancing of symbols
        - Infix to Postfix /Prefix conversion
        - Redo-undo features at many places like editors, photoshop.
        - Forward and backward feature in web browsers
        """,
        "source_name": "JavaTpoint",
        "file_url": "https://example.com/ds_stack_javatpoint.pdf"
    },
    {
        "subject_code": "3130702",
        "subject_name": "Data Structures",
        "unit": 2,
        "title": "Linear Data Structures: Queue (Programiz)",
        "description": """
        Queue:
        A linear structure which follows a particular order in which the operations are performed. The order is First In First Out (FIFO).
        
        Basic Operations:
        - Enqueue: Add an element to the end of the queue
        - Dequeue: Remove an element from the front of the queue
        - IsEmpty: Check if the queue is empty
        - IsFull: Check if the queue is full
        - Peek: Get the value of the front of the queue without removing it
        
        Types of Queues:
        1. Simple Queue
        2. Circular Queue
        3. Priority Queue
        4. Double Ended Queue (Deque)
        """,
        "source_name": "Programiz",
        "file_url": "https://example.com/ds_queue_programiz.pdf"
    }
]

all_content = dbms_unit1_content + ds_unit2_content

print(f"📦 Preparing to insert {len(all_content)} rich content items...")

for item in all_content:
    try:
        # Check if exists
        existing = supabase.table("notes").select("id").eq("title", item["title"]).execute()
        
        note_data = {
            "subject_code": item["subject_code"],
            "subject_name": item["subject_name"],
            "unit": item["unit"],
            "title": item["title"],
            "description": item["description"],
            "file_url": item["file_url"],
            "source_url": item["file_url"],
            "source_name": item["source_name"],
            "is_verified": True,
            "downloads": 0,
            "views": 0
        }
        
        if not existing.data:
            supabase.table("notes").insert(note_data).execute()
            print(f"  ✅ Added: {item['title']}")
        else:
            # Update existing to ensure description is rich
            supabase.table("notes").update(note_data).eq("id", existing.data[0]['id']).execute()
            print(f"  🔄 Updated: {item['title']}")
            
    except Exception as e:
        print(f"  ❌ Error with {item['title']}: {e}")

print("\n✨ Rich content seeding complete!")
