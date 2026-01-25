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

        // Log masked key for diagnostic verification
        console.log(`AI Engine: Initializing with key ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);

        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

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

        let lastError = "";

        // ACTIVE NEGOTIATION LOOP
        // We must attempt generation inside the loop to truly verify model access (404s happen here)
        for (const modelName of modelsToTry) {
            try {
                console.log(`AI Engine: Negotiating with ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    console.log(`AI Engine: Connection established via ${modelName}`);

                    // Clean and parse
                    const cleanText = text.replace(/```json|```/gi, "").trim();
                    try {
                        const data = JSON.parse(cleanText);
                        return { success: true, data };
                    } catch (parseError) {
                        console.error(`Format mismatch on ${modelName}:`, text);
                        // Continue to next model if format is bad? No, usually model access is the issue.
                        // But let's try next model just in case.
                    }
                }
            } catch (e: any) {
                lastError = e.message || "Unknown negotiation error";
                console.warn(`AI Engine: Model ${modelName} rejected request:`, lastError);
                // Continue to next model in the fleet
            }
        }

        // FLEET FAILURE
        return {
            success: false,
            error: `Fleet Negotiation Failed: All compatible models returned errors. Latest: ${lastError}.
            1. Verified Key: ${apiKey.substring(0, 6)}...
            2. Check: Is your key from aistudio.google.com?
            3. Check: Is your project region supported by Google AI?`
        };

    } catch (globalError: any) {
        console.error("Critical AI Pipeline Error:", globalError);
        return {
            success: false,
            error: `Critical Failure: ${globalError.message || "An unexpected error occurred."}`
        };
    }
}
