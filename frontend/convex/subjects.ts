import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {
        course: v.optional(v.string()),
        branch: v.optional(v.string()),
        semester: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const subjects = args.course
            ? await ctx.db
                .query("subjects")
                .withIndex("by_semester", (q) => q.eq("course", args.course!))
                .collect()
            : await ctx.db.query("subjects").collect();

        return subjects.filter((s) => {
            if (args.branch && s.branch !== args.branch) return false;
            if (args.semester && s.semester !== args.semester) return false;
            return true;
        });
    },
});

export const getById = query({
    args: { id: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getMetadata = query({
    handler: async (ctx) => {
        const subjects = await ctx.db.query("subjects").collect();

        const courses = [...new Set(subjects.map((s) => s.course).filter(Boolean))].sort();
        const branches = [...new Set(subjects.map((s) => s.branch).filter(Boolean))].sort();
        const semesters = [...new Set(subjects.map((s) => s.semester).filter(Boolean))].sort(
            (a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            }
        );

        return { courses, branches, semesters };
    },
});

export const getByCode = query({
    args: { subjectCode: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subjects")
            .withIndex("by_code", (q) => q.eq("subjectCode", args.subjectCode))
            .first();
    },
});
