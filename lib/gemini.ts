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

        // Protocol: Standard v1 models have the highest compatibility
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        let lastError = "";

        const prompt = `
            Analyze this tech content: ${content.substring(0, 2000)}
            Return JSON: { "title": "...", "description": "...", "excerpt": "...", "keywords": [] }
        `;

        for (const name of models) {
            try {
                console.log(`AI Engine: Attempting stable link via ${name}...`);
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                if (text) {
                    const cleanText = text.replace(/```json|```/gi, "").trim();
                    const data = JSON.parse(cleanText);
                    return { success: true, data };
                }
            } catch (e: any) {
                lastError = e.message || "Bypass failed";
                console.warn(`AI Engine: ${name} link rejected:`, lastError);
            }
        }

        return {
            success: false,
            error: `All models rejected the connection (404/403). 
            
            DIAGNOSTIC DATA:
            - Key Prefix: ${apiKey.substring(0, 8)}
            - Latest Error: ${lastError}
            
            REQUIRED ACTION:
            1. Your Google project might not have the API enabled.
            2. Go here: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
            3. Ensure it says 'API Enabled'. If not, click ENABLE.
            4. REDEPLOY on Vercel after enabling.`
        };

    } catch (globalError: any) {
        return {
            success: false,
            error: `System Reset Required: ${globalError.message}`
        };
    }
}
