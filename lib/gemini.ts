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
        // Clean the key of any accidental whitespace from Vercel paste
        const cleanKey = apiKey.trim();
        const genAI = new GoogleGenerativeAI(cleanKey);

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        let lastError = "";

        const prompt = `
            Analyze this content: ${content.substring(0, 1000)}
            Return JSON keys ONLY: "title", "description", "excerpt", "keywords"
        `;

        for (const name of models) {
            try {
                console.log(`AI Engine: Forcing v1 protocol for ${name}...`);
                // Explicitly forcing v1 to avoid v1beta 404 issues
                const model = genAI.getGenerativeModel({ model: name }, { apiVersion: 'v1' });
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                if (text) {
                    const cleanText = text.replace(/```json|```/gi, "").trim();
                    const data = JSON.parse(cleanText);
                    return { success: true, data };
                }
            } catch (e: any) {
                lastError = e.message || "Endpoint rejection";
                console.warn(`AI Engine: ${name} link failed:`, lastError);
            }
        }

        return {
            success: false,
            error: `API REJECTION: ${lastError}.
            
            TECHNICAL DIAGNOSTIC:
            - Target Models: ${models.join(", ")}
            - Force Version: v1
            
            This 404 is happening inside Google's network. It means your API Key DOES NOT HAVE PERMISSION to use these models yet.
            
            VERIFY THIS IMMEDIATELY:
            1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/overview
            2. Even if it says 'API Enabled', click 'MANAGE' and then 'QUOTAS'. 
            3. If quotas are 0, your project is restricted.
            4. Easiest Fix: Create a BRAND NEW Google account and get a fresh key from AI Studio.`
        };

    } catch (globalError: any) {
        return {
            success: false,
            error: `System Reset Required: ${globalError.message}`
        };
    }
}
