import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '';

let genAI = null;
let model = null;

function getModel() {
  if (!model && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

const LANG_NAMES = { en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil' };

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) {
    console.error("Failed to parse AI JSON:", text);
    throw new Error('AI returned invalid JSON');
  }
}

export const CURRICULUM = {
  1: [
    { id: 'l1_m1', title: 'Problem Validation', icon: '🔍' },
    { id: 'l1_m2', title: 'Target Audience', icon: '👥' },
    { id: 'l1_m3', title: 'Competitive Landscape', icon: '🏆' },
    { id: 'l1_m4', title: 'Impact Framework', icon: '🎯' },
    { id: 'l1_m5', title: 'GTM Strategy', icon: '🚀' },
    { id: 'l1_m6', title: 'Funding Options', icon: '💰' },
  ],
  2: [
    { id: 'l2_m1', title: 'Jugaad MVP', icon: '🔧' },
    { id: 'l2_m2', title: 'Low-Cost Sourcing', icon: '📦' },
    { id: 'l2_m3', title: 'User Testing', icon: '🧪' },
    { id: 'l2_m4', title: 'Build-Measure-Learn', icon: '🔄' },
    { id: 'l2_m5', title: 'Tech vs No-Tech', icon: '💻' },
    { id: 'l2_m6', title: 'Pivoting', icon: '↩️' },
  ],
  3: [
    { id: 'l3_m1', title: 'Distribution Channels', icon: '🗺️' },
    { id: 'l3_m2', title: 'First 100 Customers', icon: '💯' },
    { id: 'l3_m3', title: 'Pricing for Tier-2', icon: '🏷️' },
    { id: 'l3_m4', title: 'Trust Building', icon: '🤝' },
    { id: 'l3_m5', title: 'Word-of-Mouth', icon: '📢' },
    { id: 'l3_m6', title: 'Partnerships', icon: '🤜🤛' },
  ],
  4: [
    { id: 'l4_m1', title: 'Unit Economics', icon: '📊' },
    { id: 'l4_m2', title: 'CAC vs LTV', icon: '💹' },
    { id: 'l4_m3', title: 'Cash Flow', icon: '🌊' },
    { id: 'l4_m4', title: 'Revenue Models', icon: '💡' },
    { id: 'l4_m5', title: 'Cost Reduction', icon: '✂️' },
    { id: 'l4_m6', title: 'Break-Even', icon: '⚖️' },
  ],
  5: [
    { id: 'l5_m1', title: 'Hiring in Tier-2/3', icon: '🏘️' },
    { id: 'l5_m2', title: 'Team Culture', icon: '🌱' },
    { id: 'l5_m3', title: 'Delegation', icon: '📋' },
    { id: 'l5_m4', title: 'Managing Conflict', icon: '☮️' },
    { id: 'l5_m5', title: 'Training & Growth', icon: '📈' },
    { id: 'l5_m6', title: 'Remote Teams', icon: '🌐' },
  ],
  6: [
    { id: 'l6_m1', title: 'Sustainable Impact', icon: '🌍' },
    { id: 'l6_m2', title: 'Systemising Ops', icon: '⚙️' },
    { id: 'l6_m3', title: 'Policy & Regulation', icon: '📜' },
    { id: 'l6_m4', title: 'Scaling Ethically', icon: '🕊️' },
    { id: 'l6_m5', title: 'Exit or Expand', icon: '🔭' },
    { id: 'l6_m6', title: 'Legacy Building', icon: '🏛️' },
  ],
};

export async function generateModule({ startup, moduleTitle, levelTitle, pastCaseStudyTitles = [], language }) {
  const cacheKey = `module_${moduleTitle}_attempt${pastCaseStudyTitles.length}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const m = getModel();
  const langName = LANG_NAMES[language] || 'English';

  const pastTitles = pastCaseStudyTitles.length
    ? `Do NOT use any of these case study titles: ${pastCaseStudyTitles.join(', ')}.`
    : '';

  const prompt = `You are a social entrepreneurship educator for Indian founders.
Startup idea: "${startup.idea}" (Sector: ${startup.sector}, Location: ${startup.location})
Module Topic: "${moduleTitle}" (Part of Level: "${levelTitle}")
Language: ${langName}
${pastTitles}

Generate a complete module with ONE real-world Indian case study and 3 learning questions.
The case study must be a REAL Indian social enterprise example (e.g. Gram Vaani, Jaipur Foot, Goonj, Selco, ITC e-Choupal, etc.) and must relate to BOTH the module topic AND the user's startup idea sector.

Output ONLY valid JSON without markdown code fences in this exact structure:
{
  "caseStudy": {
    "title": "string",
    "organizationName": "string",
    "shortSummary": "string (2-3 sentences, narrated as a story. This will be READ ALOUD.)",
    "challenge": "string (the specific challenge this organization faced — 1 sentence)",
    "outcome": "string (what they did and the impact — 1-2 sentences)"
  },
  "questions": [
    {
      "type": "mcq",
      "question": "A question about the module based on the case study",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Why this is the correct answer"
    },
    {
      "type": "match",
      "question": "Match each concept with its correct description",
      "leftItems": ["Term A", "Term B", "Term C"],
      "rightItems": ["Definition C", "Definition A", "Definition B"],
      "correctMatching": [2, 0, 1],
      "explanation": "How these concepts relate to the module"
    },
    {
      "type": "tick",
      "question": "Which of the following are true about ${moduleTitle}? (Select all that apply)",
      "options": ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
      "correctIndices": [0, 2],
      "explanation": "Why these are correct"
    }
  ],
  "reflectionPrompt": "A single-line question asking what the user would do in their own startup given this learning"
}`;

  const result = await m.generateContent(prompt);
  const parsed = parseJSON(result.response.text());
  sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
  return parsed;
}

export async function generateGuidance({ startup, moduleTitle, questionsWithAnswers, reflection, language }) {
  const m = getModel();
  const langName = LANG_NAMES[language] || 'English';

  const prompt = `You are a social entrepreneurship mentor.
Startup: "${startup.idea}" (${startup.sector})
The founder just completed the module: "${moduleTitle}"
Their answers: ${JSON.stringify(questionsWithAnswers)}
Their personal reflection: "${reflection}"
Language: ${langName}

For each answer, provide SHORT guidance (1-2 sentences) on how they can apply this to their actual startup.
Also provide an overall mentor message.

Output ONLY valid JSON without markdown code blocks:
{
  "questionFeedback": [
    { "isCorrect": true, "guidance": "How to apply this to their startup" },
    { "isCorrect": false, "guidance": "What to rethink and why" },
    { "isCorrect": true, "guidance": "Application tip" }
  ],
  "reflectionFeedback": "Personalised response to their reflection answer",
  "overallScore": 85,
  "mentorMessage": "2 sentence personalized encouragement",
  "nextStepTip": "One concrete action they can take this week"
}`;

  const result = await m.generateContent(prompt);
  return parseJSON(result.response.text());
}

export async function fetchNewsInsights(sector) {
  return [
    { title: `India's ${sector || 'Social'} Sector Sees 40% Growth in 2025 Impact Investment`, source: 'Economic Times', time: '2h ago', emoji: '📈' },
    { title: `How Tier-2 City Entrepreneurs Are Redefining ${sector || 'Social'} Impact`, source: 'YourStory', time: '4h ago', emoji: '🏘️' },
    { title: 'Government Launches ₹500Cr Fund for Social Startups Under DPIIT', source: 'Business Standard', time: '6h ago', emoji: '🏛️' },
    { title: `10 ${sector || 'Indian'} Innovators Selected for Ashoka Fellowship 2025`, source: 'Forbes India', time: '1d ago', emoji: '🏆' },
  ];
}
