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

        let model;
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-pro"];
        let successModel = "";

        for (const modelName of modelsToTry) {
            try {
                const testModel = genAI.getGenerativeModel({ model: modelName });
                // We don't know if it's truly available until we try a small generation
                // but getGenerativeModel itself rarely fails; the failure happens at generateContent
                model = testModel;
                successModel = modelName;
                break;
            } catch (e) {
                console.warn(`Model ${modelName} initialization failed:`, e);
            }
        }

        if (!model) {
            throw new Error("Critical Failure: No compatible Gemini models could be initialized.");
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

        console.log(`AI Engine: Deploying payload to ${successModel}...`);
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
                error: `AI analysis succeeded via ${successModel} but returned an invalid format. Raw snippet: ${text.substring(0, 50)}`
            };
        }
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        const rawMessage = error.message || "Unknown error";

        // Detailed error reporting for 404/not found
        if (rawMessage.includes("404") || rawMessage.includes("not found")) {
            return {
                success: false,
                error: `Model Access Error (404): The API reported that the model is missing for this key. 
                1. Your key starts with '${apiKey.substring(0, 6)}'. Is this correct?
                2. If you JUST updated the key to Vercel, you MUST go to the 'Deployments' tab and click 'Redeploy' for it to work.
                3. Verify you created the key at aistudio.google.com and NOT the Google Cloud Console.`
            };
        }

        return {
            success: false,
            error: `Tactical AI Error: ${rawMessage}`
        };
    }
}
