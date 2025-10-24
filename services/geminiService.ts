import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Initialize the Google Gemini AI client. Assumes API_KEY is in environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Enhances or generates an image based on a base image, a prompt, and a specified count.
 * @param base64Data The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 * @param prompt The text prompt describing the desired modification or generation.
 * @param count The number of image variations to generate.
 * @returns A promise that resolves to an array of base64 encoded image data strings.
 */
export const enhanceImageWithGemini = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  count: number = 1
): Promise<string[]> => {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  const textPart = { text: prompt };

  const results: string[] = [];

  // Generate the requested number of images by calling the API multiple times.
  for (let i = 0; i < count; i++) {
    // Fix: Use ai.models.generateContent for image generation with gemini-2.5-flash-image model.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        // Fix: Specify IMAGE modality for image output.
        responseModalities: [Modality.IMAGE],
      },
    });

    // Fix: Correctly extract the base64 image data from the response.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        results.push(part.inlineData.data);
      }
    }
  }

  if (results.length < count) {
      throw new Error(`AI failed to generate the requested number of images. Got ${results.length}, expected ${count}.`);
  }

  return results;
};


/**
 * Generates a descriptive prompt for a given image.
 * @param base64Data The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 * @returns A promise that resolves to a suggested text prompt.
 */
export const generatePromptFromImage = async (
  base64Data: string,
  mimeType: string,
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  const textPart = { text: "Describe this architectural sketch in a concise and descriptive way, focusing on style, materials, and environment. This description will be used as a prompt to generate a photorealistic rendering." };

  // Fix: Use ai.models.generateContent with a text model to generate a description.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [imagePart, textPart],
    },
  });

  // Fix: Correctly extract the generated text from the response.
  return response.text;
};

/**
 * Generates multiple image variations from a single source image, each with a unique prompt.
 * @param base64Data The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 * @param prompts An array of text prompts, one for each desired variation.
 * @returns A promise that resolves to an array of base64 encoded image data strings.
 */
export const generateImageVariations = async (
  base64Data: string,
  mimeType: string,
  prompts: string[]
): Promise<string[]> => {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const generationPromises = prompts.map(prompt => {
    const textPart = { text: prompt };
    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  });

  const responses = await Promise.all(generationPromises);

  const results = responses.map(response => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    // This will be filtered out, and the length check below will catch the failure.
    return null;
  }).filter((data): data is string => data !== null);

  if (results.length < prompts.length) {
      throw new Error(`AI only generated ${results.length} of the ${prompts.length} requested images.`);
  }

  return results;
};