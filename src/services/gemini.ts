/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface TriviaQuestion {
  text: string;
  answer: string;
}

export async function generateQuestion(topicPrompt: string): Promise<TriviaQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `Generate exactly 10 highly engaging, extremely easy, very short trivia questions strictly about ${topicPrompt}. 
  The answer MUST be exactly ONE word for every single question. Make the questions so easy that a child could answer them contextually.
  Return the response STRICTLY as a raw JSON array of objects with exactly this schema (no markdown formatting, just the raw array):
  [
    {
      "text": "The very short question text here?",
      "answer": "Answer"
    }
  ]
  Do not include any markdown formatting, backticks, or extra text. Just the valid JSON array of 10 objects.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanedText = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return Array(10).fill({ text: "System Default: Which planet is known as the Red Planet?", answer: "Mars" });
  }
}
