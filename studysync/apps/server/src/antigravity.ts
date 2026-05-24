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

export const chatWithAntigravity = async (
  message: string,
  topic: string,
  history?: { sender: string; text: string }[]
): Promise<string> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash"
  });

  const contextHistory = history 
    ? history.slice(-6).map(h => `${h.sender === 'You' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
    : '';

  const prompt = `
    You are the "StudyPod Bot", a highly intelligent academic study assistant in a StudyPod collaborative workspace.
    The current active study topic is: "${topic}".
    You help the student understand complex terms, solve practice questions, explain concepts, and guide them in their learning path.
    
    Here is the recent conversation history:
    ${contextHistory}
    
    User says: "${message}"
    
    Give a helpful, clear, and context-aware response acting as a friendly, expert academic tutor. Keep it relatively concise but educational. Do not format with markdown headings, keep it in standard text with bullet points if necessary.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

