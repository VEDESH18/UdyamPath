import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export default function useSarvam() {
  const { state } = useAppContext();

  const getTargetLanguageCode = (code) => {
    switch(code) {
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'en': 
      default: return 'en-IN';
    }
  };

  const synthesizeSpeech = useCallback(async (text) => {
    try {
      const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
      if (!apiKey) {
        console.warn("Sarvam API key missing. Falling back to text-only mode.");
        return null;
      }
      
      const langCode = getTargetLanguageCode(state.language);

      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: langCode,
          speaker: 'anushka',
          pace: 1.0,
          enable_preprocessing: true
        })
      });

      if (!res.ok) {
        console.warn("Sarvam API failed:", await res.text());
        return null; // Silent fallback
      }

      const data = await res.json();
      if (data.audios && data.audios[0]) {
        return `data:audio/wav;base64,${data.audios[0]}`;
      }
      return null;
    } catch (err) {
      console.error("Sarvam TTS error:", err);
      return null; // Silent fallback
    }
  }, [state.language]);

  return { synthesizeSpeech, generateSpeech: synthesizeSpeech };
}
