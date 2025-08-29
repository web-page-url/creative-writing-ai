import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateContent(prompt: string) {
  try {
    if (!apiKey) {
      throw new Error('API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }
    
    console.log('Generating content with API key:', apiKey ? `API key is set (${apiKey.substring(0, 10)}...)` : 'API key is missing');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('403')) {
        throw new Error('API key is invalid or doesn\'t have proper permissions. Please check your Gemini API key.');
      } else if (error.message.includes('API Key')) {
        throw new Error('Please set a valid Gemini API key in your environment variables.');
      }
    }
    
    throw error;
  }
}

export async function generateStreamContent(prompt: string) {
  try {
    if (!apiKey) {
      throw new Error('API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }
    
    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Error generating stream content:', error);
    throw error;
  }
}