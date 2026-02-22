import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBySubject = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("questions")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();
    },
});

export const getImportant = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        const questions = await ctx.db
            .query("questions")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();

        return questions
            .filter((q) => q.isImportant === true)
            .sort((a, b) => (b.frequencyCount || 0) - (a.frequencyCount || 0));
    },
});
