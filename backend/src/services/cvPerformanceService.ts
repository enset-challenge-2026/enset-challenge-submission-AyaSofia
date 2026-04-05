import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
};

export interface ATSAuditResult {
  score: number; // 0-100
  isReadable: boolean;
  issues: string[];
  recommendations: string[];
}

export interface ContentDiagnosisResult {
  strengths: string[];
  weaknesses: string[];
  missingKeyElements: string[];
  suggestions: string[];
}

export interface SkillRecommendation {
  skill: string;
  reason: string;
  demandScore: number; // 0-100 - how in demand is this skill
  relevantInternships: number;
}

export interface CVPerformanceResult {
  overallScore: number; // 0-100
  atsAudit: ATSAuditResult;
  contentDiagnosis: ContentDiagnosisResult;
  skillRecommendations: SkillRecommendation[];
  matchScore: number; // 0-100 - how well CV matches current market
  actionItems: string[];
  analyzedAt: string;
}

export const analyzePerformance = async (
  userId: string,
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<CVPerformanceResult> => {
  const ai = getAIClient();

  // Fetch popular internship skills from database for recommendations
  let topMarketSkills: string[] = [];
  try {
    // @ts-ignore - Internship model may not exist yet
    const popularInternships = await prisma.internship?.findMany({
      where: { isActive: true },
      select: { skills: true, title: true },
      take: 50,
    }) || [];

    const marketSkills = popularInternships
      .flatMap((i: { skills: string[] }) => i.skills)
      .reduce((acc: Record<string, number>, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    topMarketSkills = Object.entries(marketSkills)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 20)
      .map(([skill]) => skill);
  } catch {
    // If internship model doesn't exist, use default skills
    topMarketSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'HTML/CSS'];
  }

  const prompt = `Analyze this CV/Resume thoroughly and provide a comprehensive performance analysis.

Current market skills in demand: ${topMarketSkills.join(', ')}

Provide the analysis in the following structure:

1. ATS AUDIT (Technical Readability):
- Check if the CV is ATS-friendly (Application Tracking System)
- Score from 0-100
- Identify formatting issues that might prevent ATS parsing
- Check for proper section headers, bullet points, standard fonts recommendation
- Identify any tables, images, or complex formatting that ATS can't read

2. CONTENT DIAGNOSIS:
- Identify strengths (clear achievements, quantified results, relevant experience)
- Identify weaknesses (vague descriptions, missing information, irrelevant content)
- List missing key elements (contact info, education, experience, skills section)
- Provide specific improvement suggestions

3. SKILL RECOMMENDATIONS:
- Based on the current market demand, suggest skills the candidate should add or highlight
- For each skill, explain why it's valuable and how many internships require it
- Prioritize skills that match the candidate's background

4. MATCH SCORE:
- How well does this CV match current internship market requirements (0-100)

5. ACTION ITEMS:
- List 5-7 specific, actionable steps to improve this CV immediately

Return only valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.includes(',') ? base64Data.split(',')[1] : base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          atsAudit: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              isReadable: { type: Type.BOOLEAN },
              issues: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['score', 'isReadable', 'issues', 'recommendations'],
          },
          contentDiagnosis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingKeyElements: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['strengths', 'weaknesses', 'missingKeyElements', 'suggestions'],
          },
          skillRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                reason: { type: Type.STRING },
                demandScore: { type: Type.NUMBER },
                relevantInternships: { type: Type.NUMBER },
              },
              required: ['skill', 'reason', 'demandScore', 'relevantInternships'],
            },
          },
          matchScore: { type: Type.NUMBER },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          'overallScore',
          'atsAudit',
          'contentDiagnosis',
          'skillRecommendations',
          'matchScore',
          'actionItems',
        ],
      },
    },
  });

  const result: Omit<CVPerformanceResult, 'analyzedAt'> = JSON.parse(response.text || '{}');

  // Save analysis to database (if model exists)
  try {
    // @ts-ignore - CVPerformanceAnalysis model may not exist yet
    await prisma.cVPerformanceAnalysis?.create({
      data: {
        userId,
        fileName,
        overallScore: result.overallScore,
        atsScore: result.atsAudit.score,
        atsIsReadable: result.atsAudit.isReadable,
        atsIssues: result.atsAudit.issues,
        atsRecommendations: result.atsAudit.recommendations,
        strengths: result.contentDiagnosis.strengths,
        weaknesses: result.contentDiagnosis.weaknesses,
        missingElements: result.contentDiagnosis.missingKeyElements,
        suggestions: result.contentDiagnosis.suggestions,
        skillRecommendations: JSON.parse(JSON.stringify(result.skillRecommendations)),
        matchScore: result.matchScore,
        actionItems: result.actionItems,
      },
    });
  } catch {
    // Model doesn't exist yet, skip saving
    console.log('CVPerformanceAnalysis model not available, skipping save');
  }

  return {
    ...result,
    analyzedAt: new Date().toISOString(),
  };
};

export const getLatestAnalysis = async (userId: string): Promise<CVPerformanceResult | null> => {
  try {
    // @ts-ignore - CVPerformanceAnalysis model may not exist yet
    const analysis = await prisma.cVPerformanceAnalysis?.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return null;
    }

    return {
      overallScore: analysis.overallScore,
      atsAudit: {
        score: analysis.atsScore,
        isReadable: analysis.atsIsReadable,
        issues: analysis.atsIssues,
        recommendations: analysis.atsRecommendations,
      },
      contentDiagnosis: {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingKeyElements: analysis.missingElements,
        suggestions: analysis.suggestions,
      },
      skillRecommendations: analysis.skillRecommendations as unknown as SkillRecommendation[],
      matchScore: analysis.matchScore,
      actionItems: analysis.actionItems,
      analyzedAt: analysis.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
};

export const getAnalysisHistory = async (userId: string) => {
  try {
    // @ts-ignore - CVPerformanceAnalysis model may not exist yet
    const analyses = await prisma.cVPerformanceAnalysis?.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fileName: true,
        overallScore: true,
        atsScore: true,
        matchScore: true,
        createdAt: true,
      },
    }) || [];

    return analyses;
  } catch {
    return [];
  }
};
