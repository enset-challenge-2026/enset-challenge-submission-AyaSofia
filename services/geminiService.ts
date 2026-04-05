
import { GoogleGenAI, Type } from "@google/genai";
import { CVAnalysisResult, Internship, StudentProfile } from "../types";

const API_KEY = process.env.API_KEY || "";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const analyzeCV = async (base64Data: string, mimeType: string): Promise<CVAnalysisResult> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1] || base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this CV and provide a summary, extracted skills, career path suggestions, and areas for improvement. Return only valid JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          careerSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["summary", "extractedSkills", "careerSuggestions", "weaknesses"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const matchInternships = async (profile: StudentProfile, cvAnalysis: CVAnalysisResult | null): Promise<Internship[]> => {
  const ai = getAIClient();
  const prompt = `Based on the following student profile and CV analysis, suggest 5 realistic internship opportunities.
  Profile: ${JSON.stringify(profile)}
  CV Analysis: ${JSON.stringify(cvAnalysis)}
  
  Each suggestion should include a relevance score (0-100) and a reason why it matches.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            relevanceScore: { type: Type.NUMBER },
            matchReason: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["id", "title", "company", "location", "description", "relevanceScore", "matchReason", "requirements"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};
