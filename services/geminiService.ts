
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  /**
   * Extract business information from a website URL using Gemini.
   */
  async extractBusinessInfo(url: string) {
    try {
      new URL(url);
    } catch (e) {
      throw new Error("Invalid URL format. Please include http:// or https://");
    }

    const domain = new URL(url).hostname;
    const defaultFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this business website URL: ${url}. 
      Extract the following information and return it in JSON format:
      - businessName: The official name of the business.
      - description: A concise, catchy summary of what they do.
      - niche: The primary industry or category.
      - keywords: Array of 5-8 relevant search terms.
      - contactInfo: Email, phone, or address found on site.
      - primaryColor: A hex color code (e.g., #000000) that represents their brand primary color.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            description: { type: Type.STRING },
            niche: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            contactInfo: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
          },
          required: ["businessName", "description", "niche", "keywords"]
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      logoUrl: defaultFavicon
    };
  }

  /**
   * Generate social media post ideas with distinct visual styles.
   */
  async generatePostIdeas(businessInfo: any, count: number = 3) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this business profile: ${JSON.stringify(businessInfo)}, 
      generate ${count} high-impact social media post ideas. 
      IMPORTANT: Each caption MUST include the brand name (${businessInfo.businessName}) and the contact information (${businessInfo.contactInfo || 'not provided'}).
      Each idea must also be assigned a 'visualStyle' from these three: 'Editorial', 'Commercial', 'Minimalist'.
      Each idea must include:
      1. A professional caption with hashtags and contact details.
      2. A specific image prompt for a background visual that uses the brand color (${businessInfo.primaryColor}). 
      3. visualStyle: Assign one of the three styles to this post.
      DO NOT include text or logos in the image prompt.
      Return as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              visualStyle: { type: Type.STRING },
            },
            required: ["caption", "imagePrompt", "visualStyle"]
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  }

  /**
   * Generate a branded background image for social posts.
   */
  async generateImage(prompt: string, brandDetails?: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const enhancedPrompt = `
      High-end professional commercial background visual. 
      SCENE: ${prompt}
      COLOR THEME: Influenced by ${brandDetails?.primaryColor || 'corporate colors'}.
      STYLE: Clean, minimalist, high-end photography/digital art, no text, no characters' faces if possible. 8k resolution.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0, 10)}/800/800`;
  }
}

export const geminiService = new GeminiService();
