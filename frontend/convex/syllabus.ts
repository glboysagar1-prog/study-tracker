import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBySubject = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        const syllabi = await ctx.db
            .query("syllabus")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();

        return syllabi.sort((a, b) => a.unitNumber - b.unitNumber);
    },
});
