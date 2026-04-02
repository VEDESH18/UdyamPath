import { useAppContext } from '../context/AppContext';

export default function useOpenAI() {
  const { state } = useAppContext();
  
  const generateJSON = async (promptText, temperature = 0.7) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API key is missing. Add VITE_OPENAI_API_KEY to .env");
      
      const languageSuffix = `\nRespond entirely in ${getLanguageName(state.language)}. Return ONLY JSON without any code fences or markdown formatting. Ensure it is perfectly valid JSON.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cheap for json tasks, or gpt-4o if preferred
          messages: [{ role: 'user', content: promptText + languageSuffix }],
          temperature: temperature,
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${await res.text()}`);
      }

      const data = await res.json();
      const raw = data.choices[0].message.content;
      
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Fallback cleanup if needed (though json_object format guarantees JSON)
        const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean.match(/\\{[\\s\\S]*\\}/)[0]);
      }
    } catch (err) {
      console.error("OpenAI JSON Generation Error:", err);
      throw err;
    }
  };

  const streamText = async (promptText, onChunk) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API key is missing.");
      
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o', 
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.7,
          stream: true
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI Sync error: ${await res.text()}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
           if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                const content = data.choices[0]?.delta?.content || "";
                fullText += content;
                onChunk(fullText);
              } catch(e) {}
           }
        }
      }
      return fullText;
    } catch (err) {
      console.error("OpenAI Streaming Error:", err);
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
