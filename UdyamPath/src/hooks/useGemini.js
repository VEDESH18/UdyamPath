import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../context/AppContext';

export default function useGemini() {
  const { state } = useAppContext();
  
  const generateJSON = async (promptText, temperature = 0.7) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const languageSuffix = `\nRespond entirely in ${getLanguageName(state.language)}. Return ONLY JSON without any code fences.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText + languageSuffix }] }],
        generationConfig: {
          temperature: temperature,
        }
      });
      
      const raw = result.response.candidates[0].content.parts[0].text;
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        return JSON.parse(clean);
      } catch (e) {
        return JSON.parse(clean.match(/\{[\s\S]*\}/)[0]);
      }
    } catch (err) {
      console.error("Gemini Generation Error:", err);
      throw err;
    }
  };

  const streamText = async (promptText, onChunk) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing.");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 }
      });
      
      let fullText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(fullText);
      }
      return fullText;
    } catch (err) {
      console.error("Gemini Streaming Error:", err);
      throw err;
    }
  }

  return { generateJSON, streamText };
}

function getLanguageName(code) {
  switch(code) {
    case 'te': return 'Telugu (తెలుగు). Use simple everyday Telugu';
    case 'hi': return 'Hindi (हिंदी). Use simple conversational Hindi';
    case 'ta': return 'Tamil (தமிழ்). Use simple everyday Tamil';
    case 'en': 
    default: return 'clear simple English. Use Indian context';
  }
}
