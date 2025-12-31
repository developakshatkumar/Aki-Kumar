
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, GroundingLink } from "../types";

export const analyzeMedicalReport = async (
  fileData: FileData,
  redact: boolean,
  apiKey?: string
): Promise<AnalysisResult> => {
  const finalApiKey = apiKey || process.env.API_KEY || "";
  if (!finalApiKey) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  const systemInstruction = `
You are DocAssist, an educational document explainer. 
Classify the document as: 'report' (medical lab/scan), 'prescription' (doctor's note for meds), or 'other' (general documents).

If it's a medical report or prescription, use the 'DocAssist' persona (helpful, patient-centered, and clear). If it's a general document, be a helpful utility explainer.

Safety rules:
- Disclaimer: "Educational only, not medical advice."
- Advice seeking urgent care if symptoms/values look critical or if there are red flags.
- If it's a prescription: explain the purpose, frequency, and potential educational alternative medications (clearly state "discuss with your doctor").
- Use Google Search to verify current medical standards for findings or medications.

Task:
Extract and structure:
1) docType classification.
2) summary (empathetic and plain-language).
3) findings (for medical reports).
4) medicines (for prescriptions).
5) concerns.
6) urgencyLevel & redFlags.
7) specialist recommendations.
8) 10 Personalized Questions for a doctor.
9) Timeline & preparation steps.

Output format: Return STRICT JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      {
        parts: [
          { text: systemInstruction },
          {
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.mimeType
            }
          }
        ]
      }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          docType: { type: Type.STRING, enum: ["report", "prescription", "other"] },
          summary: { type: Type.STRING },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: { type: Type.STRING },
                observedValue: { type: Type.STRING },
                referenceRange: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["low", "normal", "high", "unknown"] },
                whatItMeansSimple: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["itemName", "observedValue", "status", "whatItMeansSimple", "whyItMatters", "confidence"]
            }
          },
          medicines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                use: { type: Type.STRING },
                frequency: { type: Type.STRING },
                duration: { type: Type.STRING },
                alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "use", "frequency", "alternatives"]
            }
          },
          concerns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
              required: ["area", "reasoning"]
            }
          },
          urgencyLevel: { type: Type.STRING, enum: ["routine", "soon", "urgent"] },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedSpecialists: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                specialty: { type: Type.STRING },
                rationale: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["specialty", "rationale", "confidence"]
            }
          },
          doctorQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          immediateSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          timeline: { type: Type.STRING },
          assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          reportDate: { type: Type.STRING }
        },
        required: ["docType", "summary", "concerns", "urgencyLevel", "redFlags", "recommendedSpecialists", "doctorQuestions", "immediateSteps", "timeline", "assumptions"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "{}") as AnalysisResult;
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.groundingLinks = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          uri: c.web.uri,
          title: c.web.title
        }));
    }

    return result;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to analyze the document. Please ensure it is clear.");
  }
};
