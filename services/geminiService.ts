import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai = new GoogleGenAI({
    apiKey: process.env.API_KEY!,
  });

  /**
   * Extract business information from a website URL
   */
  async extractBusinessInfo(url: string) {
    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL format. Please include http:// or https://");
    }

    const domain = new URL(url).hostname;
    const defaultFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

    const response = await this.ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `
Analyze this business website URL: ${url}.
Return the data strictly as JSON.

Fields:
- businessName
- description (short & catchy)
- niche
- keywords (5–8 items)
- contactInfo (email, phone, or address if found)
- primaryColor (hex, guess if needed)
      `,
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
          required: ["businessName", "description", "niche", "keywords"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    return {
      ...data,
      logoUrl: defaultFavicon,
    };
  }

  /**
   * Generate social media post ideas WITH captions + image prompts
   */
  async generatePostIdeas(businessInfo: any, count: number = 3) {
    const response = await this.ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `
Business profile:
${JSON.stringify(businessInfo)}

Generate ${count} social media post ideas.

Rules:
- Each caption MUST mention "${businessInfo.businessName}"
- Include contact info: ${businessInfo.contactInfo || "N/A"}
- Include relevant hashtags
- Assign visualStyle: Editorial | Commercial | Minimalist
- Image prompt should describe a BACKGROUND ONLY
- Do NOT include text or logos in the image

Return JSON array.
      `,
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
            required: ["caption", "imagePrompt", "visualStyle"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  }

  /**
   * FREE image generation (production-safe)
   * Uses deterministic Picsum images based on prompt
   */
  generateImage(prompt: string, brandDetails?: any): string {
    const seed = encodeURIComponent(
      `${prompt}-${brandDetails?.primaryColor || "brand"}`
    ).slice(0, 50);

    // Square, social-media ready
    return `https://picsum.photos/seed/${seed}/800/800`;
  }
}

export const geminiService = new GeminiService();
