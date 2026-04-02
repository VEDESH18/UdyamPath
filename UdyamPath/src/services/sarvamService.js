const SARVAM_URL = 'https://api.sarvam.ai';
const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

// Sarvam API uses specific language codes: hi-IN, ta-IN, te-IN, bn-IN, etc.
const getSarvamCode = (lang) => {
  switch (lang) {
    case 'hi': return 'hi-IN';
    case 'te': return 'te-IN';
    case 'ta': return 'ta-IN';
    case 'en': return 'en-IN';
    default: return 'en-IN';
  }
};

export async function translateText(text, targetLang) {
  if (!API_KEY) {
    console.warn("No Sarvam API Key. Falling back to original text.");
    return text; // Fallback if no key
  }
  
  if (targetLang === 'en') return text; // No need to translate if already English

  try {
    const response = await fetch(`${SARVAM_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': API_KEY
      },
      body: JSON.stringify({
        input: text,
        source_language_code: 'en-IN',
        target_language_code: getSarvamCode(targetLang),
        speaker_gender: 'Female', // contextual hint for translation models sometimes
        mode: 'formal',
        model: 'sarvam-1'
      })
    });

    if (!response.ok) throw new Error(`Sarvam Translate Error: ${response.statusText}`);
    
    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error("Sarvam Translation Failed:", error);
    return text;
  }
}

export async function generateSpeech(text, targetLang) {
  if (!API_KEY || targetLang === 'en') {
    return null; // Don't do TTS if no key or if English (or use browser native)
  }

  try {
    const response = await fetch(`${SARVAM_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': API_KEY
      },
      body: JSON.stringify({
        inputs: [text.substring(0, 500)], // Bulbul v3 usually limits input length per req
        target_language_code: getSarvamCode(targetLang),
        speaker: 'meera', // Or standard female voice tag
        pitch: 0,
        pace: 1.05,
        loudness: 1.5,
        speech_sample_rate: 8000,
        enable_preprocessing: true,
        model: 'bulbul:v1'
      })
    });

    if (!response.ok) throw new Error(`Sarvam TTS Error: ${response.statusText}`);
    
    const data = await response.json();
    return data.audios[0]; // Base64 Audio string
  } catch (error) {
    console.error("Sarvam TTS Failed:", error);
    return null;
  }
}
