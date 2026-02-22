import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addBatch = mutation({
    args: {
        materials: v.array(v.object({
            type: v.string(),
            subjectCode: v.string(),
            title: v.string(),
            fileUrl: v.string(),
            source: v.string(),
            unit: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        for (const material of args.materials) {
            // Check if already exists to avoid duplicates
            const existing = await ctx.db
                .query("scrapedMaterials")
                .withIndex("by_subject_code", (q) => q.eq("subjectCode", material.subjectCode))
                .filter((q) => q.eq(q.field("fileUrl"), material.fileUrl))
                .first();

            if (!existing) {
                await ctx.db.insert("scrapedMaterials", material);
            }
        }
    },
});

export const getBySubjectCode = query({
    args: { subjectCode: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("scrapedMaterials")
            .withIndex("by_subject_code", (q) => q.eq("subjectCode", args.subjectCode))
            .collect();
    },
});
