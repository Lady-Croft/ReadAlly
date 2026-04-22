import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getBookInsight(title: string, author: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a very brief (2-3 sentences), inspiring summary or mood description for the book "${title}" by ${author}. Focus on why it's worth reading.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep reading to discover the magic of this story.";
  }
}

export async function generateQuiz(title: string, author: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 3-question multiple-choice quiz for the book "${title}" by ${author}. The questions should be about general knowledge of the book's plot or themes that a reader would likely know. Provide exactly 4 options for each question.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER, description: "0-based index of the correct option" }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text).questions;
    }
  } catch (error) {
    console.error("Quiz Gen Error:", error);
  }
  return null;
}

export async function generateVisualContext(title: string, author: string, sceneDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the book "${title}" by ${author}, provide a detailed visual description for the following scene or section: "${sceneDescription}". 
      Describe the lighting, colors, atmosphere, and key details as if you were directing a film. 
      Limit to 2-3 atmospheric sentences.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Visual Context Error:", error);
    return "A shroud of mystery hangs over this scene, waiting for your imagination to illuminate it.";
  }
}

export async function searchBooks(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 real books related to the search query: "${query}". For each book, provide: title, author, totalPages (estimated), a short description, and a genre. Ensure the books are real and highly relevant.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            books: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  totalPages: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  coverUrl: { type: Type.STRING, description: "A high-quality Unsplash image URL that matches the book mood" }
                },
                required: ["title", "author", "totalPages", "description", "genre", "coverUrl"]
              }
            }
          },
          required: ["books"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text).books;
    }
  } catch (error) {
    console.error("Search Books Error:", error);
  }
  return [];
}

export async function generateBookChapters(title: string, author: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 substantial chapters for the book "${title}" by ${author}. 
      Each chapter should have a title and 3-4 paragraphs of high-fidelity text matching the author's style. 
      Return the content as a JSON array of chapter objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["chapters"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text).chapters;
    }
  } catch (error) {
    console.error("Chapters Gen Error:", error);
  }
  return [{ title: 'Archive Error', content: 'The restoration process was interrupted. Please try again.' }];
}

export async function generateNextChapter(title: string, author: string, lastChapterTitle: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Continue the book "${title}" by ${author}. The last chapter was "${lastChapterTitle}". 
      Write the next chapter (Title and 4-5 paragraphs). Match the style perfectly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Next Chapter Gen Error:", error);
  }
  return null;
}
