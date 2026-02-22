import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySubject = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("mockTests")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();
    },
});

export const create = mutation({
    args: {
        subjectId: v.id("subjects"),
        title: v.string(),
        durationMinutes: v.number(),
        maxScore: v.number(),
    },
    handler: async (ctx, args) => {
        const testId = await ctx.db.insert("mockTests", {
            subjectId: args.subjectId,
            title: args.title,
            durationMinutes: args.durationMinutes,
            maxScore: args.maxScore,
            startedAt: Date.now(),
        });
        return testId;
    },
});

export const updateScore = mutation({
    args: {
        testId: v.id("mockTests"),
        score: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.testId, {
            score: args.score,
            completedAt: Date.now(),
        });
    },
});
