"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAntigravity = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const queryAntigravity = async (topic) => {
    // Use the gemini-1.5-flash or pro model
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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
    return JSON.parse(responseText);
};
exports.queryAntigravity = queryAntigravity;
