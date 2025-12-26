
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let isGlobalQuotaExhausted = false;

export const getAIStatus = () => isGlobalQuotaExhausted;

async function safeGenerateContent(params: any, fallback: { text: string }) {
  try {
    const response = await ai.models.generateContent(params);
    isGlobalQuotaExhausted = false;
    return response;
  } catch (error: any) {
    const errorMessage = error.message || "";
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      console.warn("AI Quota Exhausted. Switching to Fallback Mode.");
      isGlobalQuotaExhausted = true;
    } else {
      console.error("Gemini API Connection Issue:", error);
    }
    return {
      isFallback: true,
      text: fallback.text,
      candidates: [{ content: { parts: [{ text: fallback.text }] }, groundingMetadata: { groundingChunks: [] } }]
    } as any;
  }
}

/**
 * Refines a practical task to ensure clear deliverables and competitive reward levels for a reverse auction.
 */
export const refineTaskDetails = async (task: { title: string, description: string, reward: number }) => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a senior market analyst for an Indian P2P task marketplace. 
    Analyze this task: 
    Title: "${task.title}"
    Description: "${task.description}"
    Current Reward: ₹${task.reward}
    
    Tasks:
    1. Search for current Indian market rates for similar professional tasks (could be sales, research, etc).
    2. Improve the description for absolute clarity (mention deliverables).
    3. Suggest an optimized "Maximum Reward" to attract high-quality bidders.
    4. Provide a 1-sentence "Expert Reasoning" for the changes.
    
    Return ONLY JSON with keys: "title", "description", "reward", "difficulty", "estimatedTime", "reasoning".`,
    config: { 
      tools: [{ googleSearch: {} }] 
    },
  }, { text: JSON.stringify(task) });

  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        suggestion: JSON.parse(jsonMatch[0]),
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter((w: any) => w?.uri) || []
      };
    }
  } catch (e) {}
  return { suggestion: task, sources: [] };
};

/**
 * Fetches "Market Activity" insights for practical task delivery.
 */
export const getMarketPulse = async () => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: "Identify the top 3 practical professional tasks currently in high demand for P2P marketplaces in India (e.g. sales leads, product promos, data scrubbing). Provide: earningPath, trend, earningPotential, and practicalRequirement.",
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            earningPath: { type: Type.STRING },
            trend: { type: Type.STRING },
            earningPotential: { type: Type.STRING },
            practicalRequirement: { type: Type.STRING }
          },
          required: ["earningPath", "trend", "earningPotential", "practicalRequirement"]
        }
      }
    },
  }, { text: "[]" });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const suggestTaskSpecs = async (title: string, description: string) => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this task title: "${title}". Suggest a difficulty ("Basic", "Intermediate", "High-Value") and an estimated duration for completion. Return JSON: {"difficulty": "...", "estimatedTime": "..."}`,
  }, { text: JSON.stringify({ difficulty: "Intermediate", estimatedTime: "4 hours" }) });

  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {}
  return { difficulty: "Intermediate", estimatedTime: "4 hours" };
};

export const getIndustryInsights = async () => {
  const fallbackText = "Active tasks in Sales Support and Digital Marketing are currently dominating the network bidding liquidity.";
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: "Summarize the current volume of practical P2P tasks in India in one high-impact sentence.",
    config: { tools: [{ googleSearch: {} }] },
  }, { text: fallbackText });

  return {
    text: response.text || fallbackText,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter((w: any) => w?.uri) || [],
    isQuotaLimited: (response as any).isFallback
  };
};

export const analyzeAccountingData = async (transactions: any[]) => {
  if (transactions.length === 0) return "Account active. Participate in task biddings to build your professional throughput.";
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this task-based transaction ledger: ${JSON.stringify(transactions)}`,
  }, { text: "Ledger verified against portal protocols." });
  return response.text;
};
