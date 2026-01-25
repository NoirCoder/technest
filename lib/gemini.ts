'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSEOContent(content: string) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Missing Gemini API Key. Please verify GOOGLE_GEMINI_API_KEY exists in Vercel/Environment settings."
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        let model;
        try {
            // gemini-1.5-flash is the most optimal model for this task
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (e) {
            console.error("Failed to initialize gemini-1.5-flash:", e);
            throw new Error("Could not initialize the Gemini 1.5 Flash model. Ensure your API key is from Google AI Studio.");
        }

        const prompt = `
            Analyze the following tech blog content and provide:
            1. A compelling SEO Meta Title (max 60 chars)
            2. A high-conversion Meta Description (max 160 chars)
            3. A short, catchy teaser/excerpt (max 120 chars)
            4. 3-5 keywords

            Formatting: Return ONLY a valid JSON object with keys: "title", "description", "excerpt", "keywords".
            Do not include markdown code blocks or any other text.

            Content:
            ${content.substring(0, 4000)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response if it contains markdown code blocks or whitespace
        const cleanText = text.replace(/```json|```/gi, "").trim();

        try {
            const data = JSON.parse(cleanText);
            return { success: true, data };
        } catch (parseError) {
            console.error("Gemini JSON Parse Error:", text);
            return {
                success: false,
                error: `AI analysis succeeded but returned an invalid format. Raw response: ${text.substring(0, 100)}...`
            };
        }
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Detailed error reporting for 404/not found
        if (error.message?.includes("404") || error.message?.includes("not found")) {
            const rawMessage = error.message || "Unknown 404 error";
            return {
                success: false,
                error: `Model Access Error: ${rawMessage}. 
                1. Verify GOOGLE_GEMINI_API_KEY in Vercel is correct.
                2. Ensure you have REDEPLOYED your site after updating the key.
                3. Your key should start with 'AIzaSy'.`
            };
        }

        return {
            success: false,
            error: `Tactical AI Error: ${error.message || "An unexpected error occurred."}`
        };
    }
}
