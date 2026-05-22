import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { AIStudyResponse } from "@studysync/shared";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const queryAntigravity = async (topic: string): Promise<AIStudyResponse> => {
  // Use the gemini-1.5-flash or pro model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } // Force JSON
  });

  const prompt = `
    Analyze the study topic: ${topic}.
    Act as a high-level academic tutor.
    Return ONLY a JSON object matching this structure:
    {
      "summary": "short explanation",
      "roadmap": ["step 1", "step 2"],
      "quiz": [{"question": "text", "answer": "text"}],
      "complexityScore": 1-10
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  return JSON.parse(responseText) as AIStudyResponse;
};
