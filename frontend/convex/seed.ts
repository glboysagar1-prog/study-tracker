import { mutation } from "./_generated/server";

/**
 * Comprehensive seed mutation — populates Convex with all GTU data:
 * subjects, syllabus, questions, study materials, and previous papers.
 */
export const seedSubjects = mutation({
    handler: async (ctx) => {
        const existing = await ctx.db.query("subjects").first();
        if (existing) return "Already seeded — run seed:clearAll first to re-seed.";

        // ========== SUBJECTS ==========
        const subjectDefs = [
            { course: "BE", branch: "Computer Engineering", semester: "1", subjectCode: "3110005", subjectName: "Basic Electronics", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "1", subjectCode: "3110003", subjectName: "Programming for Problem Solving", credits: 6 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130702", subjectName: "Data Structures", credits: 5 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130703", subjectName: "Database Management Systems", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130704", subjectName: "Digital Fundamentals", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130706", subjectName: "Object Oriented Programming with C++", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130701", subjectName: "Discrete Mathematics", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130005", subjectName: "Probability & Statistics", credits: 4 },
            { course: "BE", branch: "Computer Engineering", semester: "3", subjectCode: "3130011", subjectName: "Engineering Economics & Management", credits: 3 },
            { course: "BE", branch: "Computer Engineering", semester: "4", subjectCode: "3140705", subjectName: "Database Management Systems (Advanced)", credits: 5 },
            { course: "BE", branch: "Computer Engineering", semester: "5", subjectCode: "3150710", subjectName: "Operating Systems", credits: 5 },
        ];

        // Insert subjects and build a map code → id
        const subjectMap: Record<string, any> = {};
        for (const s of subjectDefs) {
            const id = await ctx.db.insert("subjects", s);
            subjectMap[s.subjectCode] = id;
        }

        // ========== SYLLABUS ==========
        const syllabusDefs = [
            // Data Structures
            {
                code: "3130702", units: [
                    { unitNumber: 1, unitTitle: "Introduction to Data Structures", content: "Arrays: 1D and 2D arrays, operations. Linked Lists: Singly, Doubly, Circular linked lists. Operations: insertion, deletion, traversal, searching." },
                    { unitNumber: 2, unitTitle: "Stacks and Queues", content: "Stack: definition, operations (push, pop, peek), applications. Expression evaluation and conversion (infix, prefix, postfix). Queue: types (simple, circular, deque, priority queue), operations and applications." },
                    { unitNumber: 3, unitTitle: "Trees", content: "Binary Trees: traversals (inorder, preorder, postorder). Binary Search Trees: insertion, deletion, searching. AVL Trees: rotations and balancing. Heap: min-heap, max-heap, heap sort." },
                    { unitNumber: 4, unitTitle: "Graphs", content: "Graph representation: adjacency matrix, adjacency list. Traversals: BFS, DFS. Shortest path: Dijkstra's, Bellman-Ford. Minimum Spanning Tree: Prim's, Kruskal's." },
                    { unitNumber: 5, unitTitle: "Sorting and Searching", content: "Sorting: Bubble, Selection, Insertion, Merge Sort, Quick Sort, Radix Sort. Searching: Linear, Binary Search. Hashing: hash functions, collision resolution." },
                ]
            },
            // DBMS
            {
                code: "3130703", units: [
                    { unitNumber: 1, unitTitle: "Introduction to DBMS", content: "Database concepts, DBMS architecture, data models (relational, ER model). ER Diagram: entities, attributes, relationships, cardinality." },
                    { unitNumber: 2, unitTitle: "Relational Model & SQL", content: "Relational algebra, tuple/domain calculus. SQL: DDL, DML, DCL, TCL. Joins, subqueries, views, indexes." },
                    { unitNumber: 3, unitTitle: "Normalization", content: "Functional dependencies, Normal forms: 1NF, 2NF, 3NF, BCNF. Decomposition, lossless join." },
                    { unitNumber: 4, unitTitle: "Transaction Management", content: "ACID properties, concurrency control, locking protocols, deadlock handling. Recovery techniques: log-based, shadow paging." },
                    { unitNumber: 5, unitTitle: "Advanced Topics", content: "NoSQL databases, distributed databases, data warehousing, OLAP, data mining basics." },
                ]
            },
            // Digital Fundamentals
            {
                code: "3130704", units: [
                    { unitNumber: 1, unitTitle: "Number Systems & Codes", content: "Binary, Octal, Hexadecimal systems. BCD, Gray code, ASCII. Signed number representation." },
                    { unitNumber: 2, unitTitle: "Boolean Algebra & Logic Gates", content: "Boolean theorems, De Morgan's law. Universal gates (NAND, NOR). K-map simplification: 2, 3, 4 variables." },
                    { unitNumber: 3, unitTitle: "Combinational Circuits", content: "Adders, subtractors, multiplexers, demultiplexers, encoders, decoders, comparators." },
                    { unitNumber: 4, unitTitle: "Sequential Circuits", content: "Flip-flops (SR, JK, D, T), registers, counters (synchronous, asynchronous, up/down)." },
                ]
            },
            // OOP with C++
            {
                code: "3130706", units: [
                    { unitNumber: 1, unitTitle: "Introduction to OOP", content: "OOP concepts: classes, objects, encapsulation, abstraction, inheritance, polymorphism. Difference between C and C++." },
                    { unitNumber: 2, unitTitle: "Classes and Objects", content: "Constructors, destructors, copy constructor. Friend functions, static members. Operator overloading." },
                    { unitNumber: 3, unitTitle: "Inheritance", content: "Types: single, multiple, multilevel, hierarchical, hybrid. Virtual base class. Constructor/destructor in inheritance." },
                    { unitNumber: 4, unitTitle: "Polymorphism & Templates", content: "Virtual functions, pure virtual functions, abstract classes. Function and class templates. Exception handling: try, catch, throw." },
                    { unitNumber: 5, unitTitle: "File Handling & STL", content: "File streams: ifstream, ofstream, fstream. STL: vectors, lists, maps, iterators, algorithms." },
                ]
            },
            // Discrete Mathematics
            {
                code: "3130701", units: [
                    { unitNumber: 1, unitTitle: "Propositional Logic", content: "Propositions, connectives, truth tables. Logical equivalences, normal forms (CNF, DNF). Predicate logic, quantifiers." },
                    { unitNumber: 2, unitTitle: "Set Theory & Relations", content: "Sets, operations, power set. Relations: types, equivalence, partial order. Functions: types, composition, inverse." },
                    { unitNumber: 3, unitTitle: "Graph Theory", content: "Graphs: types, isomorphism, connectivity. Euler and Hamiltonian paths. Planar graphs, graph coloring, trees." },
                    { unitNumber: 4, unitTitle: "Combinatorics", content: "Counting principles, permutations, combinations. Pigeonhole principle. Inclusion-exclusion. Recurrence relations." },
                ]
            },
        ];

        for (const s of syllabusDefs) {
            const subjectId = subjectMap[s.code];
            if (!subjectId) continue;
            for (const u of s.units) {
                await ctx.db.insert("syllabus", { subjectId, ...u });
            }
        }

        // ========== QUESTIONS ==========
        const questionDefs = [
            // Data Structures
            {
                code: "3130702", questions: [
                    { unitNumber: 1, questionText: "Explain different types of linked lists with diagrams.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 5 },
                    { unitNumber: 1, questionText: "Define array. Explain advantages and disadvantages.", marks: 3, questionType: "short", isImportant: false, frequencyCount: 3 },
                    { unitNumber: 2, questionText: "What is a stack? Write algorithms for push and pop operations.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 8 },
                    { unitNumber: 2, questionText: "Convert infix to postfix: A+(B*C-(D/E^F)*G)/H", marks: 4, questionType: "short", isImportant: true, frequencyCount: 6 },
                    { unitNumber: 3, questionText: "Explain Binary Search Tree with insertion and deletion.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 7 },
                    { unitNumber: 3, questionText: "Write a program for inorder traversal of a binary tree.", marks: 4, questionType: "short", isImportant: false, frequencyCount: 4 },
                    { unitNumber: 4, questionText: "Write Dijkstra's algorithm for shortest path.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 6 },
                    { unitNumber: 4, questionText: "Explain BFS and DFS with example.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 7 },
                    { unitNumber: 5, questionText: "Compare all sorting algorithms with time complexity.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 5 },
                    { unitNumber: 5, questionText: "Explain hashing with collision resolution techniques.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 4 },
                    { unitNumber: 1, questionText: "What is a linked list?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 2 },
                    { unitNumber: 2, questionText: "Stack follows which principle?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 3 },
                    { unitNumber: 3, questionText: "Which traversal gives sorted output of BST?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 2 },
                    { unitNumber: 4, questionText: "Time complexity of BFS?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 2 },
                ]
            },
            // DBMS
            {
                code: "3130703", questions: [
                    { unitNumber: 1, questionText: "Explain ER model with example.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 9 },
                    { unitNumber: 2, questionText: "Write SQL queries for JOIN operations with examples.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 8 },
                    { unitNumber: 3, questionText: "Explain normalization up to BCNF with example.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 7 },
                    { unitNumber: 4, questionText: "Explain ACID properties with examples.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 6 },
                    { unitNumber: 1, questionText: "What is a primary key?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 4 },
                    { unitNumber: 2, questionText: "Which SQL command is used to delete a table?", marks: 1, questionType: "mcq", isImportant: false, frequencyCount: 3 },
                ]
            },
            // OOP C++
            {
                code: "3130706", questions: [
                    { unitNumber: 1, questionText: "Explain features of OOP with examples.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 8 },
                    { unitNumber: 2, questionText: "Explain constructor overloading with program.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 6 },
                    { unitNumber: 3, questionText: "Explain types of inheritance with diagrams.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 7 },
                    { unitNumber: 4, questionText: "Explain virtual functions and abstract classes.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 5 },
                    { unitNumber: 5, questionText: "Write a program for file handling in C++.", marks: 7, questionType: "long", isImportant: true, frequencyCount: 4 },
                ]
            },
        ];

        for (const s of questionDefs) {
            const subjectId = subjectMap[s.code];
            if (!subjectId) continue;
            for (const q of s.questions) {
                await ctx.db.insert("questions", { subjectId, ...q });
            }
        }

        // ========== STUDY MATERIALS ==========
        const materialDefs = [
            { code: "3130702", title: "Unit 1: Introduction to DS — Arrays & Linked Lists", content: "https://example.com/ds_unit1.pdf", materialType: "notes", unit: 1 },
            { code: "3130702", title: "Unit 2: Stacks and Queues", content: "https://example.com/ds_unit2.pdf", materialType: "notes", unit: 2 },
            { code: "3130702", title: "Unit 3: Trees — BST, AVL, Heap", content: "https://example.com/ds_unit3.pdf", materialType: "notes", unit: 3 },
            { code: "3130702", title: "Unit 4: Graphs — BFS, DFS, Dijkstra", content: "https://example.com/ds_unit4.pdf", materialType: "notes", unit: 4 },
            { code: "3130702", title: "Unit 5: Sorting & Searching Algorithms", content: "https://example.com/ds_unit5.pdf", materialType: "notes", unit: 5 },
            { code: "3130703", title: "Unit 1: ER Model & Database Concepts", content: "https://example.com/dbms_unit1.pdf", materialType: "notes", unit: 1 },
            { code: "3130703", title: "Unit 2: SQL & Relational Algebra", content: "https://example.com/dbms_unit2.pdf", materialType: "notes", unit: 2 },
            { code: "3130703", title: "Unit 3: Normalization (1NF to BCNF)", content: "https://example.com/dbms_unit3.pdf", materialType: "notes", unit: 3 },
            { code: "3130703", title: "Unit 4: Transaction & Concurrency", content: "https://example.com/dbms_unit4.pdf", materialType: "notes", unit: 4 },
            { code: "3130706", title: "Unit 1: OOP Concepts", content: "https://example.com/cpp_unit1.pdf", materialType: "notes", unit: 1 },
            { code: "3130706", title: "Unit 2: Classes & Operator Overloading", content: "https://example.com/cpp_unit2.pdf", materialType: "notes", unit: 2 },
            { code: "3130706", title: "Unit 3: Inheritance", content: "https://example.com/cpp_unit3.pdf", materialType: "notes", unit: 3 },
            { code: "3130706", title: "Unit 4: Polymorphism & Templates", content: "https://example.com/cpp_unit4.pdf", materialType: "notes", unit: 4 },
            { code: "3130704", title: "Unit 1: Number Systems & Codes", content: "https://example.com/df_unit1.pdf", materialType: "notes", unit: 1 },
            { code: "3130704", title: "Unit 2: Boolean Algebra & K-Maps", content: "https://example.com/df_unit2.pdf", materialType: "notes", unit: 2 },
            { code: "3130704", title: "Unit 3: Combinational Circuits", content: "https://example.com/df_unit3.pdf", materialType: "notes", unit: 3 },
            { code: "3130704", title: "Unit 4: Sequential Circuits", content: "https://example.com/df_unit4.pdf", materialType: "notes", unit: 4 },
            { code: "3130701", title: "Unit 1: Propositional Logic", content: "https://example.com/dm_unit1.pdf", materialType: "notes", unit: 1 },
            { code: "3130701", title: "Unit 2: Sets, Relations & Functions", content: "https://example.com/dm_unit2.pdf", materialType: "notes", unit: 2 },
            { code: "3130701", title: "Unit 3: Graph Theory", content: "https://example.com/dm_unit3.pdf", materialType: "notes", unit: 3 },
            { code: "3130701", title: "Unit 4: Combinatorics", content: "https://example.com/dm_unit4.pdf", materialType: "notes", unit: 4 },
        ];

        for (const m of materialDefs) {
            const subjectId = subjectMap[m.code];
            if (!subjectId) continue;
            await ctx.db.insert("studyMaterials", {
                subjectId,
                title: m.title,
                content: m.content,
                materialType: m.materialType,
                unit: m.unit,
                createdAt: Date.now(),
            });
        }

        // ========== PREVIOUS PAPERS (from data/pyqs_sem3) ==========
        const paperDefs = [
            // Data Structures
            {
                code: "3130702", papers: [
                    { year: "2021", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DSS2021.pdf" },
                    { year: "2021", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DSW2021.pdf" },
                    { year: "2022", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DSS2022.pdf" },
                    { year: "2022", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DSW2022.pdf" },
                    { year: "2023", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DSS2023.pdf" },
                    { year: "2023", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DSW2023.pdf" },
                    { year: "2024", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DSS2024.pdf" },
                    { year: "2024", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DSW2024.pdf" },
                ]
            },
            // DBMS
            {
                code: "3130703", papers: [
                    { year: "2021", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DBMSS2021.pdf" },
                    { year: "2021", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DBMSW2021.pdf" },
                    { year: "2022", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DBMSS2022.pdf" },
                    { year: "2022", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DBMSW2022.pdf" },
                    { year: "2023", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DBMSS2023.pdf" },
                    { year: "2023", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DBMSW2023.pdf" },
                    { year: "2024", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DBMSS2024.pdf" },
                    { year: "2024", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DBMSW2024.pdf" },
                ]
            },
            // Digital Fundamentals
            {
                code: "3130704", papers: [
                    { year: "2021", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DFS2021.pdf" },
                    { year: "2021", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DFW2021.pdf" },
                    { year: "2022", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DFS2022.pdf" },
                    { year: "2022", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DFW2022.pdf" },
                    { year: "2023", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DFS2023.pdf" },
                    { year: "2023", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DFW2023.pdf" },
                    { year: "2024", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/DFS2024.pdf" },
                    { year: "2024", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/DFW2024.pdf" },
                ]
            },
            // Engineering Economics
            {
                code: "3130011", papers: [
                    { year: "2021", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/ENGS2021.pdf" },
                    { year: "2021", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/ENGW2021.pdf" },
                    { year: "2022", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/ENGS2022.pdf" },
                    { year: "2022", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/ENGW2022.pdf" },
                    { year: "2023", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/ENGS2023.pdf" },
                    { year: "2023", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/ENGW2023.pdf" },
                    { year: "2024", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/ENGS2024.pdf" },
                    { year: "2024", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/ENGW2024.pdf" },
                ]
            },
            // Probability & Statistics
            {
                code: "3130005", papers: [
                    { year: "2021", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/P&SS2021.pdf" },
                    { year: "2021", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/P&SW2021.pdf" },
                    { year: "2022", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/P&SS2022.pdf" },
                    { year: "2022", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/P&SW2022.pdf" },
                    { year: "2023", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/P&SS2023.pdf" },
                    { year: "2023", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/P&SW2023.pdf" },
                    { year: "2024", examType: "Summer", paperPdfUrl: "/data/pyqs_sem3/P&SS2024.pdf" },
                    { year: "2024", examType: "Winter", paperPdfUrl: "/data/pyqs_sem3/P&SW2024.pdf" },
                ]
            },
        ];

        for (const s of paperDefs) {
            const subjectId = subjectMap[s.code];
            if (!subjectId) continue;
            for (const p of s.papers) {
                await ctx.db.insert("previousPapers", { subjectId, ...p });
            }
        }

        return `✅ Seeded: ${subjectDefs.length} subjects, ${syllabusDefs.reduce((a, s) => a + s.units.length, 0)} syllabus units, ${questionDefs.reduce((a, s) => a + s.questions.length, 0)} questions, ${materialDefs.length} materials, ${paperDefs.reduce((a, s) => a + s.papers.length, 0)} papers`;
    },
});

export const clearAll = mutation({
    handler: async (ctx) => {
        const tables = ["users", "subjects", "syllabus", "questions", "previousPapers", "mockTests", "testQuestions", "studyMaterials"] as const;
        let total = 0;
        for (const table of tables) {
            const docs = await ctx.db.query(table).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
                total++;
            }
        }
        return `🗑️ Cleared ${total} documents across all tables.`;
    },
});

import scrapedData from "./gtu_materials.json";

export const seedScraped = mutation({
    handler: async (ctx) => {
        let subjectsAdded = 0;
        let materialsAdded = 0;
        let papersAdded = 0;

        for (const item of scrapedData) {
            // Check if subject exists
            let subject = await ctx.db
                .query("subjects")
                .withIndex("by_code", (q) => q.eq("subjectCode", item.subjectCode))
                .first();

            let subjectId = subject?._id;

            if (!subject) {
                // Determine branch and semester from URL roughly
                // e.g. https://gtumaterial.com/gtu/materials/mechanical-engineering/1/...
                const urlParts = item.url.split('/');
                let branch = "Unknown Branch";
                let semester = "Unknown Semester";
                if (item.source === 'gtumaterial.com' && urlParts.length >= 7) {
                    branch = urlParts[5].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    semester = urlParts[6];
                }

                // Parse subjectName from title: "Maths - I (311004) - Complete Study Materials | GTU"
                let subjectName = item.title;
                const match = subjectName.match(/^(.*?)\s*\(\d+\)/);
                if (match) {
                    subjectName = match[1].trim();
                }

                subjectId = await ctx.db.insert("subjects", {
                    course: "BE",
                    branch: branch,
                    semester: semester,
                    subjectCode: item.subjectCode,
                    subjectName: subjectName,
                    credits: 4, // default
                });
                subjectsAdded++;
            }

            if (!subjectId) continue;

            // Insert Books as study materials
            if (item.books && Array.isArray(item.books)) {
                for (let i = 0; i < item.books.length; i++) {
                    await ctx.db.insert("studyMaterials", {
                        subjectId,
                        title: `Study Material ${i + 1}`,
                        content: item.books[i],
                        materialType: "book",
                        createdAt: Date.now()
                    });
                    materialsAdded++;
                }
            }

            // Insert syllabus as material if it's a link
            if (item.syllabusLink && item.syllabusLink !== "#") {
                await ctx.db.insert("studyMaterials", {
                    subjectId,
                    title: "Syllabus Copy",
                    content: item.syllabusLink,
                    materialType: "syllabus",
                    createdAt: Date.now()
                });
                materialsAdded++;
            }

            // Insert papers
            if (item.papers && Array.isArray(item.papers)) {
                for (let i = 0; i < item.papers.length; i++) {
                    await ctx.db.insert("previousPapers", {
                        subjectId,
                        year: "Previous Year",
                        examType: "Regular",
                        paperPdfUrl: item.papers[i]
                    });
                    papersAdded++;
                }
            }
        }

        return `✅ Seeded Scraped Data: ${subjectsAdded} new subjects, ${materialsAdded} materials, ${papersAdded} past papers.`;
    }
});
import sem4Data from "./gtu_semester_4_materials.json";

const SUBJECT_NAMES: Record<string, string> = {
    "3110001": "Chemistry",
    "3110002": "English",
    "3110003": "Programming for Problem Solving",
    "3110004": "Basic Civil Engineering",
    "3110005": "Basic Electrical Engineering",
    "3110006": "Basic Mechanical Engineering",
    "3110007": "Environmental Science",
    "3110011": "Physics-I",
    "3110012": "Workshop",
    "3110013": "Engineering Graphics and Design",
    "3110014": "Mathematics - I",
    "3110015": "Mathematics - II",
    "3110016": "Basics of Electronics",
    "3110018": "Physics-II",
    "3130004": "Effective Technical Communication",
    "3130006": "Probability and Statistics",
    "3130007": "Indian Constitution",
    "3130008": "Design Engineering - 1 A",
    "3130701": "Discrete Mathematics",
    "3130702": "Data Structures",
    "3130703": "Database Management Systems",
    "3130704": "Digital Fundamentals",
    "3140702": "Operating System",
    "3140705": "Object Oriented Programming - I (Java)",
    "3140707": "Computer Organization & Architecture",
    "3140708": "Discrete Mathematics",
    "3140709": "Principles of Economics and Management",
    "3150004": "Contributor Personality Development Program",
    "3150005": "Integrated Personality Development Course",
    "3150703": "Analysis and Design of Algorithms",
    "3150709": "Professional Ethics",
    "3150710": "Computer Networks",
    "3150711": "Software Engineering",
    "3150712": "Computer Graphics",
    "3150713": "Python for Data Science",
    "3150714": "Cyber Security",
    "3160002": "Contributor Personality Development Program",
    "3160003": "Integrated Personality Development Course",
    "3160704": "Theory of Computation",
    "3160707": "Advanced Java Programming",
    "3160712": "Microprocessor and Interfacing",
    "3160713": "Web Programming",
    "3160714": "Data Mining",
    "3160715": "System Software",
    "3160716": "IOT and Applications",
    "3160717": "Data Visualization",
    "3170001": "Summer Internship",
    "3170701": "Compiler Design",
    "3170710": "Mobile Computing and Wireless Communication",
    "3170716": "Artificial Intelligence",
    "3170717": "Cloud Computing",
    "3170718": "Information Retrieval",
    "3170719": "Distributed System",
    "3170720": "Information Security",
    "3170721": "Parallel and Distributed Computing",
    "3170722": "Big Data Analytics",
    "3170723": "Natural Language Processing",
    "3170724": "Machine Learning",
    "3170725": "Digital Forensics",
    "3170726": "Mobile Application Development"
};

export const seedSem4 = mutation({
    handler: async (ctx) => {
        let subjectsAdded = 0;
        let materialsAdded = 0;
        let papersAdded = 0;

        for (const item of sem4Data as any[]) {
            if (!item.subjectCode || item.subjectCode === "Unknown") continue;

            const existingSubject = await ctx.db
                .query("subjects")
                .withIndex("by_code", (q) => q.eq("subjectCode", item.subjectCode))
                .first();

            let subjectId = existingSubject?._id;

            if (!subjectId) {
                // Use mapping or default to "Unknown Subject"
                const subjectName = SUBJECT_NAMES[item.subjectCode] || "Unknown Subject";

                subjectId = await ctx.db.insert("subjects", {
                    course: "BE",
                    branch: "Computer Engineering",
                    semester: "4",
                    subjectCode: item.subjectCode,
                    subjectName: subjectName,
                    credits: 4,
                });
                subjectsAdded++;
            }

            // Insert based on type and title
            if (item.type === "video") {
                await ctx.db.insert("studyMaterials", {
                    subjectId,
                    title: item.title,
                    content: item.fileUrl,
                    materialType: "video",
                    source: item.source,
                    createdAt: Date.now()
                });
                materialsAdded++;
            } else if (item.type === "pdf" || item.type === "ppt") {
                const titleLower = item.title.toLowerCase();

                if (titleLower.includes("syllabus")) {
                    await ctx.db.insert("studyMaterials", {
                        subjectId,
                        title: "GTU Original Syllabus PDF",
                        content: item.fileUrl,
                        materialType: "syllabus",
                        source: item.source,
                        createdAt: Date.now()
                    });
                    materialsAdded++;
                } else if (titleLower.match(/(summer|winter)\s*\d+/)) {
                    // Try to extract year and examType
                    const yearMatch = titleLower.match(/\d{2}\s*\d{2}|\d{4}/);
                    const isSummer = titleLower.includes("summer");
                    const yearStr = yearMatch ? yearMatch[0].replace(/\s/g, "") : "Unknown";

                    await ctx.db.insert("previousPapers", {
                        subjectId,
                        year: "20" + yearStr.slice(-2), // Normalizing e.g. "2020"
                        examType: isSummer ? "Summer" : "Winter",
                        paperPdfUrl: item.fileUrl,
                    });
                    papersAdded++;
                } else {
                    // It's a general note or book
                    await ctx.db.insert("studyMaterials", {
                        subjectId,
                        title: item.title === "Download" ? "Study Notes/Book" : item.title,
                        content: item.fileUrl,
                        materialType: "notes",
                        unit: item.unit,
                        source: item.source,
                        createdAt: Date.now()
                    });
                    materialsAdded++;
                }
            }
        }

        return `✅ Seeded Semester 4 Data: ${subjectsAdded} new subjects, ${materialsAdded} materials (notes, syllabus, videos), ${papersAdded} past papers.`;
    }
});

export const fixUnknownSubjects = mutation({
    handler: async (ctx) => {
        const unknownSubjects = await ctx.db
            .query("subjects")
            .filter((q) => q.eq(q.field("subjectName"), "Unknown Subject"))
            .collect();

        let updated = 0;
        for (const subject of unknownSubjects) {
            const realName = SUBJECT_NAMES[subject.subjectCode];
            if (realName) {
                await ctx.db.patch(subject._id, { subjectName: realName });
                updated++;
            }
        }

        return `🛠️ Data Cleanup: Updated ${updated} subjects from "Unknown Subject" to correct GTU names.`;
    }
});
