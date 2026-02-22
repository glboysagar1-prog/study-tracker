import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        email: v.string(),
        passwordHash: v.optional(v.string()),
        college: v.optional(v.string()),
        branch: v.optional(v.string()),
        semester: v.optional(v.string()),
        aiCredits: v.number(),
        totalAiRequests: v.number(),
        createdAt: v.number(), // timestamp
    }).index("by_username", ["username"])
        .index("by_email", ["email"]),

    subjects: defineTable({
        course: v.string(),
        branch: v.string(),
        semester: v.string(),
        subjectCode: v.string(),
        subjectName: v.string(),
        credits: v.number(),
    }).index("by_code", ["subjectCode"])
        .index("by_semester", ["course", "branch", "semester"]),

    syllabus: defineTable({
        subjectId: v.id("subjects"),
        unitNumber: v.number(),
        unitTitle: v.string(),
        content: v.string(),
    }).index("by_subject", ["subjectId"]),

    questions: defineTable({
        subjectId: v.id("subjects"),
        unitNumber: v.number(),
        questionText: v.string(),
        marks: v.number(),
        questionType: v.string(), // 'mcq', 'short', 'long'
        options: v.optional(v.array(v.string())), // For MCQ options
        aiExplanation: v.optional(v.string()),
        isImportant: v.optional(v.boolean()),
        frequencyCount: v.optional(v.number()),
    }).index("by_subject", ["subjectId"]),

    previousPapers: defineTable({
        subjectId: v.id("subjects"),
        year: v.string(),
        examType: v.string(), // 'Regular', 'Re-exam', etc.
        paperPdfUrl: v.optional(v.string()),
        solutionPdfUrl: v.optional(v.string()),
    }).index("by_subject", ["subjectId"]),

    mockTests: defineTable({
        subjectId: v.id("subjects"),
        userId: v.optional(v.id("users")),
        title: v.string(),
        durationMinutes: v.number(),
        startedAt: v.optional(v.number()),
        completedAt: v.optional(v.number()),
        score: v.optional(v.number()),
        maxScore: v.optional(v.number()),
    }).index("by_subject", ["subjectId"]),

    testQuestions: defineTable({
        testId: v.id("mockTests"),
        questionId: v.id("questions"),
        userAnswer: v.optional(v.string()),
        isCorrect: v.optional(v.boolean()),
    }).index("by_test", ["testId"]),

    studyMaterials: defineTable({
        subjectId: v.id("subjects"),
        title: v.string(),
        content: v.string(), // URL or text
        materialType: v.string(), // 'notes', 'flashcards', 'summary', 'ppt', 'video', 'paper'
        unit: v.optional(v.number()),
        source: v.optional(v.string()), // For scraped/external sources
        createdAt: v.number(),
    }).index("by_subject", ["subjectId"]),

    scrapedMaterials: defineTable({
        type: v.string(), // 'pdf', 'ppt', 'video', 'paper'
        subjectCode: v.string(),
        title: v.string(),
        fileUrl: v.string(),
        source: v.string(),
        unit: v.optional(v.number()),
    }).index("by_subject_code", ["subjectCode"]),
});
