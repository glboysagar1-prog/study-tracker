"""
Flashcard Generator for GTU Subjects
Creates curated flashcards for each unit
"""
import os
import logging
from dotenv import load_dotenv
from supabase import create_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Curated flashcard templates for different subjects
FLASHCARD_TEMPLATES = {
    "2140701": {  # Data Structures
        "1": [  # Unit 1
            {"question": "What is a data structure?", "answer": "A data structure is a specialized format for organizing, processing, retrieving and storing data.", "difficulty": "easy"},
            {"question": "What is the time complexity of accessing an element in an array?", "answer": "O(1) - constant time, as arrays provide direct access using index.", "difficulty": "medium"},
            {"question": "Define a pointer in C.", "answer": "A pointer is a variable that stores the memory address of another variable.", "difficulty": "easy"},
            {"question": "What is dynamic memory allocation?", "answer": "Dynamic memory allocation is the process of assigning memory space during program execution using functions like malloc() and calloc().", "difficulty": "medium"},
            {"question": "What is a structure in C?", "answer": "A structure is a user-defined data type that groups variables of different data types under a single name.", "difficulty": "easy"},
            {"question": "How do you access structure members via pointer?", "answer": "Using the arrow operator (->). For example: ptr->member", "difficulty": "medium"},
            {"question": "What is the difference between malloc() and calloc()?", "answer": "malloc() allocates uninitialized memory, while calloc() initializes allocated memory to zero.", "difficulty": "hard"},
            {"question": "What is a null pointer?", "answer": "A null pointer is a pointer that points to nothing (address 0). It's used to indicate that the pointer is not assigned to any valid memory location.", "difficulty": "easy"},
        ],
        "2": [  # Unit 2
            {"question": "What is a Stack?", "answer": "A Stack is a linear data structure that follows Last-In-First-Out (LIFO) principle.", "difficulty": "easy"},
            {"question": "Name two operations performed on a stack.", "answer": "Push (insert) and Pop (remove).", "difficulty": "easy"},
            {"question": "What is stack overflow?", "answer": "Stack overflow occurs when we try to push an element onto a full stack.", "difficulty": "medium"},
            {"question": "What is a Queue?", "answer": "A Queue is a linear data structure that follows First-In-First-Out (FIFO) principle.", "difficulty": "easy"},
            {"question": "What is a circular queue?", "answer": "A circular queue is a queue where the last position is connected back to the first position to make a circle.", "difficulty": "medium"},
            {"question": "What is a priority queue?", "answer": "A priority queue is a queue where each element has a priority, and elements are served based on their priority rather than their order in the queue.", "difficulty": "medium"},
            {"question": "What are the applications of stacks?", "answer": "Function call management, expression evaluation, backtracking algorithms, undo operations in editors.", "difficulty": "hard"},
            {"question": "What is deque?", "answer": "Deque (Double Ended Queue) is a queue where insertion and deletion can be performed from both ends.", "difficulty": "medium"},
        ],
        "3": [  # Unit 3
            {"question": "What is a Linked List?", "answer": "A Linked List is a linear data structure where elements (nodes) are not stored in contiguous memory locations. Each node contains data and a pointer to the next node.", "difficulty": "easy"},
            {"question": "What is a singly linked list?", "answer": "A singly linked list is a linked list where each node points only to the next node in the sequence.", "difficulty": "easy"},
            {"question": "What is a doubly linked list?", "answer": "A doubly linked list is a linked list where each node has two pointers: one pointing to the next node and one to the previous node.", "difficulty": "medium"},
            {"question": "What is a circular linked list?", "answer": "A circular linked list is a linked list where the last node points back to the first node instead of NULL.", "difficulty": "medium"},
            {"question": "What are advantages of linked lists over arrays?", "answer": "Dynamic size, ease of insertion/deletion, no memory wastage.", "difficulty": "medium"},
            {"question": "What are disadvantages of linked lists?", "answer": "Extra memory for pointers, no random access, sequential access only.", "difficulty": "medium"},
            {"question": "How do you detect a cycle in a linked list?", "answer": "Using Floyd's cycle-finding algorithm (tortoise and hare approach) with fast and slow pointers.", "difficulty": "hard"},
            {"question": "What is the time complexity of searching in a linked list?", "answer": "O(n) - linear time, as we may need to traverse the entire list.", "difficulty": "medium"},
        ],
        "4": [  # Unit 4
            {"question": "What is a Binary Tree?", "answer": "A binary tree is a tree data structure where each node has at most two children, referred to as left child and right child.", "difficulty": "easy"},
            {"question": "What is a Binary Search Tree (BST)?", "answer": "A BST is a binary tree where for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater.", "difficulty": "medium"},
            {"question": "Name three types of tree traversals.", "answer": "Inorder, Preorder, and Postorder.", "difficulty": "easy"},
            {"question": "What is Inorder traversal sequence?", "answer": "Left subtree → Root → Right subtree", "difficulty": "medium"},
            {"question": "What is an AVL Tree?", "answer": "An AVL tree is a self-balancing BST where the height difference between left and right subtrees cannot be more than 1.", "difficulty": "hard"},
            {"question": "What is tree height?", "answer": "Tree height is the number of edges on the longest path from the root to a leaf node.", "difficulty": "easy"},
            {"question": "What is a complete binary tree?", "answer": "A binary tree where all levels are fully filled except possibly the last level, which is filled from left to right.", "difficulty": "medium"},
            {"question": "What is the time complexity of search in a balanced BST?", "answer": "O(log n)", "difficulty": "medium"},
        ],
        "5": [  # Unit 5
            {"question": "What is a Graph?", "answer": "A graph is a non-linear data structure consisting of vertices (nodes) connected by edges.", "difficulty": "easy"},
            {"question": "What are two ways to represent a graph?", "answer": "Adjacency Matrix and Adjacency List.", "difficulty": "medium"},
            {"question": "What is graph traversal?", "answer": "Graph traversal is the process of visiting all vertices in a graph in a systematic manner.", "difficulty": "easy"},
            {"question": "Name two graph traversal algorithms.", "answer": "Depth-First Search (DFS) and Breadth-First Search (BFS).", "difficulty": "easy"},
            {"question": "What is a hash table?", "answer": "A hash table is a data structure that implements an associative array, mapping keys to values using a hash function.", "difficulty": "medium"},
            {"question": "What is a hash function?", "answer": "A hash function is a function that converts a key into an index in the hash table.", "difficulty": "easy"},
            {"question": "What is collision in hashing?", "answer": "Collision occurs when two different keys produce the same hash value.", "difficulty": "medium"},
            {"question": "Name two collision resolution techniques.", "answer": "Chaining (using linked lists) and Open Addressing (linear probing, quadratic probing).", "difficulty": "hard"},
        ]   
    }
}

def generate_generic_flashcards(unit_number, topics):
    """Generate generic flashcards for any unit"""
    flashcards = []
    
    for i, topic in enumerate(topics[:8], 1):
        flashcards.append({
            "question": f"What is {topic}?",
            "answer": f"Study material and detailed explanation for {topic}.",
            "difficulty": "medium"
        })
    
    return flashcards

def populate_flashcards(subject_code=None):
    """Generate and populate flashcards for subjects"""
    
    logger.info("\n" + "="*60)
    logger.info("FLASHCARD GENERATOR")
    logger.info("="*60 + "\n")
    
    # Get subjects to process
    if subject_code:
        subjects_response = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
    else:
        subjects_response = supabase.table("subjects").select("*").execute()
    
    subjects = subjects_response.data
    
    if not subjects:
        logger.error("No subjects found!")
        return
    
    logger.info(f"Processing {len(subjects)} subject(s)\n")
    
    total_flashcards = 0
    
    for subject in subjects:
        subj_code = subject['subject_code']
        subj_name = subject['subject_name']
        
        logger.info(f"Processing: {subj_name} ({subj_code})")
        
        # Get syllabus topics for this subject, grouped by unit
        syllabus_response = supabase.table("syllabus_content").select("unit, topic").eq("subject_code", subj_code).execute()
        
        # Group topics by unit
        units_topics = {}
        for item in syllabus_response.data:
            unit = item['unit']
            if unit not in units_topics:
                units_topics[unit] = []
            units_topics[unit].append(item['topic'])
        
        # Generate flashcards for each unit
        for unit in sorted(units_topics.keys()):
            topics = units_topics[unit]
            
            # Use template if available, otherwise generate generic
            if subj_code in FLASHCARD_TEMPLATES and str(unit) in FLASHCARD_TEMPLATES[subj_code]:
                flashcards = FLASHCARD_TEMPLATES[subj_code][str(unit)]
            else:
                flashcards = generate_generic_flashcards(unit, topics)
            
            # Insert flashcards into database
            inserted = 0
            for card in flashcards:
                try:
                    flashcard_data = {
                        "subject_code": subj_code,
                        "unit": unit,
                        "question": card['question'],
                        "answer": card['answer'],
                        "difficulty": card.get('difficulty', 'medium')
                    }
                    
                    supabase.table("flashcards").insert(flashcard_data).execute()
                    inserted += 1
                    
                except Exception as e:
                    logger.error(f"Failed to insert flashcard: {e}")
            
            logger.info(f"  ✓ Unit {unit}: {inserted} flashcards")
            total_flashcards += inserted
        
        logger.info("")
    
    logger.info("="*60)
    logger.info(f"✅ COMPLETE! Generated {total_flashcards} flashcards")
    logger.info("="*60)

if __name__ == "__main__":
    import sys
    
    subject_code = sys.argv[1] if len(sys.argv) > 1 else None
    
    if subject_code:
        logger.info(f"Generating flashcards for subject: {subject_code}")
    else:
        logger.info("Generating flashcards for all subjects")
    
    populate_flashcards(subject_code)
