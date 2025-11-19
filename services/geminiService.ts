import { GoogleGenAI, Type } from "@google/genai";
import { Product, AIAnalysisResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeProductPricing = async (product: Product): Promise<AIAnalysisResult | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  const prompt = `
    Analise o seguinte produto para um varejista brasileiro:
    Produto: ${product.name}
    SKU: ${product.sku}
    Custo Total Unitário: R$ ${product.totalUnitCost.toFixed(2)}
    Preço de Venda Definido: R$ ${product.sellingPrice.toFixed(2)}
    Markup Aplicado: ${product.markupPercentage}%
    
    Forneça:
    1. Um texto curto e persuasivo de marketing para vender este produto (marketingCopy).
    2. Uma análise financeira curta sobre a margem de lucro. O preço está saudável? (financialAdvice).
    3. Uma nota de 1 a 10 sobre a competitividade baseada em margens típicas de varejo (competitivenessScore).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketingCopy: { type: Type.STRING },
            financialAdvice: { type: Type.STRING },
            competitivenessScore: { type: Type.NUMBER },
          },
          required: ["marketingCopy", "financialAdvice", "competitivenessScore"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing product with Gemini:", error);
    return null;
  }
};