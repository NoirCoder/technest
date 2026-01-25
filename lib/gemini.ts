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
        const apiVersions = ["v1", "v1beta"];
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

        // DEEP NEGOTIATION: Version x Model
        for (const version of apiVersions) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                // Note: The SDK typically handles versioning internally, but we can force it
                // via internal endpoint manipulation or by trying standard initialization

                for (const modelName of modelsToTry) {
                    try {
                        console.log(`AI Engine: Negotiating via ${version}/${modelName}...`);
                        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: version as any });
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();

                        if (text) {
                            console.log(`AI Engine: Connection secured via ${version}/${modelName}`);
                            const cleanText = text.replace(/```json|```/gi, "").trim();
                            const data = JSON.parse(cleanText);
                            return { success: true, data };
                        }
                    } catch (e: any) {
                        lastError = e.message || "Model rejection";
                        console.warn(`AI Engine: ${version}/${modelName} unavailable:`, lastError);
                    }
                }
            } catch (vError: any) {
                console.warn(`AI Engine: Version ${version} handshake failed.`);
            }
        }

        // TOTAL FLEET COLLAPSE
        return {
            success: false,
            error: `Strategic AI Failure: No connection established.
            Latest Error: ${lastError}
            Key Index: ${apiKey.substring(0, 8)}...

            DIAGNOSTIC: This 404 usually happens if:
            1. The key is NOT a 'Google AI Studio' key.
            2. The 'Generative Language API' is NOT enabled for your project.
            3. You have not REDEPLOYED on Vercel after saving settings.`
        };

    } catch (globalError: any) {
        console.error("Critical AI Pipeline Error:", globalError);
        return {
            success: false,
            error: `System Failure: ${globalError.message || "An unexpected error occurred."}`
        };
    }
}
