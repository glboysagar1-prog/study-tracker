import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBySubject = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("previousPapers")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();
    },
});
