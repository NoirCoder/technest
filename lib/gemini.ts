'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateSEOContent(content: string) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return { success: false, error: "Missing Gemini API Key. Add GOOGLE_GEMINI_API_KEY to .env.local" };
    }

    try {
        const prompt = `
            Analyze the following tech blog content and provide:
            1. A compelling SEO Meta Title (max 60 chars)
            2. A high-conversion Meta Description (max 160 chars)
            3. A short, catchy teaser/excerpt (max 120 chars)
            4. 3-5 keywords

            Formatting: Return ONLY a JSON object with keys: title, description, excerpt, keywords.

            Content:
            ${content.substring(0, 4000)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response if it contains markdown code blocks
        const jsonString = text.replace(/```json|```/gi, "").trim();
        const data = JSON.parse(jsonString);

        return { success: true, data };
    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        return { success: false, error: error.message };
    }
}
