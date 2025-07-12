import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GeneratedBlogContent {
  content: string;
  excerpt: string;
}

export async function generateBlogContent(
  headline: string, 
  imageBase64?: string
): Promise<GeneratedBlogContent> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert content writer for the Centre of Entrepreneurship. Generate comprehensive, engaging blog content based on the provided headline. The content should be educational, informative, and suitable for an academic audience interested in entrepreneurship and business innovation. 

Format your response as JSON with the following structure:
{
  "content": "Full blog post content (minimum 800 words, well-structured with paragraphs)",
  "excerpt": "Brief summary for the blog listing (150-200 characters)"
}

The content should:
- Be professional and academic in tone
- Include practical insights and actionable advice
- Reference current trends in entrepreneurship and business
- Be well-structured with clear paragraphs
- Provide value to readers interested in business innovation`
      }
    ];

    const userMessage: any = {
      role: "user",
      content: []
    };

    if (imageBase64) {
      userMessage.content.push({
        type: "text",
        text: `Generate a comprehensive blog post with the headline: "${headline}". Use the provided image as context and inspiration for the content.`
      });
      userMessage.content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      });
    } else {
      userMessage.content = `Generate a comprehensive blog post with the headline: "${headline}". Create engaging, educational content suitable for the Centre of Entrepreneurship audience.`;
    }

    messages.push(userMessage);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.content || !result.excerpt) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      content: result.content,
      excerpt: result.excerpt.substring(0, 200) // Ensure excerpt is not too long
    };
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to generate blog content: " + (error as Error).message);
  }
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and describe its key elements, context, and any notable aspects that could be relevant for entrepreneurship or business content."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image: " + (error as Error).message);
  }
}
