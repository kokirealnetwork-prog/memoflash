import { GoogleGenAI, Type } from "@google/genai";
import { Card } from "../types";

const apiKey = process.env.API_KEY;

// Helper to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAnswersForCards = async (cards: Card[]): Promise<Card[]> => {
  if (!apiKey) {
    console.warn("API Key is missing");
    return cards;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Filter cards that have questions but empty answers
  const incompleteCards = cards.filter(c => c.question.trim() !== "" && c.answer.trim() === "");

  if (incompleteCards.length === 0) {
    return cards;
  }

  const questions = incompleteCards.map(c => c.question);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I will provide a list of questions or terms. Please provide a concise answer or definition for each.
      
      Questions:
      ${JSON.stringify(questions)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalQuestion: { type: Type.STRING },
              generatedAnswer: { type: Type.STRING }
            },
            required: ["originalQuestion", "generatedAnswer"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) return cards;

    const generatedData = JSON.parse(rawText) as { originalQuestion: string, generatedAnswer: string }[];

    // Create a map for faster lookup
    const answerMap = new Map(generatedData.map(item => [item.originalQuestion, item.generatedAnswer]));

    // Return new cards array with filled answers
    return cards.map(card => {
      if (card.question.trim() !== "" && card.answer.trim() === "") {
        const genAnswer = answerMap.get(card.question);
        if (genAnswer) {
          return { ...card, answer: genAnswer };
        }
      }
      return card;
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return cards;
  }
};

export const generateDeckFromTopic = async (topic: string): Promise<Card[]> => {
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a set of 5 flashcards about the topic: "${topic}". Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) return [];
    
    const items = JSON.parse(rawText) as {question: string, answer: string}[];

    return items.map(item => ({
      id: crypto.randomUUID(),
      question: item.question,
      answer: item.answer
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
}
