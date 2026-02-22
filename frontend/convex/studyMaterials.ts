import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySubject = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("studyMaterials")
            .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
            .collect();
    },
});

export const create = mutation({
    args: {
        subjectId: v.id("subjects"),
        title: v.string(),
        content: v.string(),
        materialType: v.string(),
        unit: v.optional(v.number()),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const materialId = await ctx.db.insert("studyMaterials", {
            subjectId: args.subjectId,
            title: args.title,
            content: args.content,
            materialType: args.materialType,
            unit: args.unit,
            source: args.source,
            createdAt: Date.now(),
        });
        return materialId;
    },
});

export const migrateFromScraped = mutation({
    handler: async (ctx) => {
        // Clear existing scraped materials to ensure fresh categorization
        const existingMaterials = await ctx.db.query("studyMaterials").collect();
        for (const mat of existingMaterials) {
            if (mat.source) {
                await ctx.db.delete(mat._id);
            }
        }

        const scraped = await ctx.db.query("scrapedMaterials").collect();
        const subjects = await ctx.db.query("subjects").collect();
        const subjectMap = new Map(subjects.map(s => [s.subjectCode, s._id]));

        const detectType = (item: any) => {
            const title = (item.title || "").toLowerCase();
            const url = (item.fileUrl || "").toLowerCase();
            const type = item.type;
            const source = (item.source || "").toLowerCase();

            // Broad keywords for labs
            if (title.includes('lab') || title.includes('manual') || title.includes('experiment') || title.includes('practical') || url.includes('lab')) return 'lab';

            // Syllabus
            if (title.includes('syllabus') || url.includes('syllabus')) return 'syllabus';

            // IMP / Important Question
            if (title.includes('imp') || title.includes('important') || title.includes('question') || url.includes('imp')) return 'imp';

            // Books
            if (title.includes('book') || title.includes('textbook') || title.includes('reference') || url.includes('book')) return 'book';

            // Papers
            if (title.includes('summer') || title.includes('winter') || title.includes('paper') || type === 'paper' || url.includes('paper')) return 'paper';

            // PPTs
            if (type === 'ppt' || title.includes('ppt') || url.includes('.ppt') || url.includes('.pptx')) return 'ppt';

            // Videos
            if (type === 'video') return 'video';

            // Ayan Memon specific heuristics (he often hosts Labs/IMPs)
            if (source.includes('ayanmemon')) {
                if (item.title === 'Download') return 'notes'; // Default
            }

            return 'notes'; // Default to notes
        };

        let count = 0;
        for (const item of scraped) {
            const subjectId = subjectMap.get(item.subjectCode);
            if (!subjectId) continue;

            await ctx.db.insert("studyMaterials", {
                subjectId,
                title: item.title === 'Download' ? `${item.type.toUpperCase()} Resource` : item.title,
                content: item.fileUrl,
                materialType: detectType(item),
                unit: item.unit,
                source: item.source,
                createdAt: Date.now(),
            });
            count++;
        }
        return `Successfully synchronized ${count} items with granular labels.`;
    }
});

export const getBySubjectCode = query({
    args: {
        subjectCode: v.string(),
        materialType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const subject = await ctx.db
            .query("subjects")
            .withIndex("by_code", (q) => q.eq("subjectCode", args.subjectCode))
            .first();
        if (!subject) return [];

        const materials = await ctx.db
            .query("studyMaterials")
            .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
            .collect();

        if (args.materialType) {
            return materials.filter((m) => m.materialType === args.materialType);
        }
        return materials;
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("studyMaterials").collect();
    },
});
