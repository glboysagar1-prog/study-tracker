import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const chat = action({
    args: {
        prompt: v.string(),
        context: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) throw new Error("GROQ_API_KEY not set");

        const systemContext =
            args.context ||
            "You are an AI tutor helping GTU students prepare for their exams. Provide clear, concise, and accurate explanations.";

        const messages: { role: string; content: string }[] = [
            { role: "system", content: systemContext },
            { role: "user", content: args.prompt },
        ];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },
});

export const summarizeUnit = action({
    args: {
        subjectId: v.id("subjects"),
        unitNumber: v.number(),
    },
    handler: async (ctx, args) => {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) throw new Error("GROQ_API_KEY not set");

        // Look up the subject and syllabus unit
        const subject = await ctx.runQuery(
            internal.subjects.getById,
            { id: args.subjectId }
        );
        const syllabusUnits = await ctx.runQuery(
            internal.syllabus.getBySubject,
            { subjectId: args.subjectId }
        );
        const unit = syllabusUnits?.find(
            (u: any) => u.unitNumber === args.unitNumber
        );

        const subjectName = subject?.subjectName || "Unknown Subject";
        const unitContent = unit?.content || "No content available";

        const prompt = `Please provide a concise summary of the following unit content for Subject ${subjectName}, Unit ${args.unitNumber}:\n\n${unitContent.slice(0, 2000)}`;

        const messages = [
            {
                role: "system",
                content:
                    "You are an expert academic summarizer. Create a clear, bulleted summary of the key concepts in this unit.",
            },
            { role: "user", content: prompt },
        ];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },
});
