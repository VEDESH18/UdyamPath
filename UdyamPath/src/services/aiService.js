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

function parseJSONOrThrow(text) {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON:", text);
    throw new Error("AI returned invalid JSON format.");
  }
}

export async function validateIdea({ idea, language, location, budget, sector, stage }) {
  const m = getModel();
  if (!m) return getMockValidation(idea);
  
  const langName = LANG_NAMES[language] || 'English';

  const prompt = `You are an expert Indian Startup Validator. Validate this social entrepreneurship idea.
Idea: "${idea}"
Context: Location: ${location}, Budget: ${budget}, Sector: ${sector}, Stage: ${stage}
Language for output: ${langName}

Output ONLY valid JSON matching this structure exactly without any code formatting blocks or markdown texts:
{
  "overallScore": 85,
  "problemValidity": { "score": 80, "title": "string", "description": "string" },
  "uniquenessScore": 90,
  "uniquenessReason": "string",
  "targetAudience": { "primary": "string", "secondary": "string", "size": "string" },
  "marketSize": { "tam": "string", "sam": "string", "som": "string", "description": "string" },
  "existingSolutions": [{ "name": "string", "gap": "string" }],
  "strengths": ["string", "string"],
  "challenges": ["string", "string"],
  "firstSteps": ["string", "string", "string"],
  "emotionalImpact": { "message": "string", "peopleCount": 10, "comparison": "string" }
}`;

  try {
    const result = await m.generateContent(prompt);
    return parseJSONOrThrow(result.response.text());
  } catch(e) {
    console.warn("AI Validation Failed, falling back to mock:", e);
    return getMockValidation(idea);
  }
}

function getMockValidation(idea) {
  return {
    "overallScore": 82,
    "problemValidity": { "score": 85, "title": "Highly Relevant", "description": "Addresses a crucial grassroots issue in the current market environment." },
    "uniquenessScore": 75,
    "uniquenessReason": "While the core concept exists, your localized execution strategy provides a solid moat.",
    "targetAudience": { "primary": "Local communities and tier-2 businesses", "secondary": "Urban millennials seeking authentic impact", "size": "15M+ potential users" },
    "marketSize": { "tam": "₹10,000 Cr", "sam": "₹2,500 Cr", "som": "₹150 Cr", "description": "A rapidly expanding market driven by growing digital adoption." },
    "existingSolutions": [{ "name": "Traditional NGOs", "gap": "Lack of digital scalability" }, { "name": "Corporate CSRs", "gap": "Poor grassroots trust" }],
    "strengths": ["Local community ties", "Low customer acquisition cost"],
    "challenges": ["Initial funding", "Regulatory compliance"],
    "firstSteps": ["Build a WhatsApp group MVP", "Secure 10 early-adopter beta testers", "Register as a Section-8 entity"],
    "emotionalImpact": { "message": "This idea has the potential to rewrite futures.", "peopleCount": 50000, "comparison": "the population of an entire district" }
  };
}

export async function generateScenario({ startup, module, language, newsContext, previousAnalogies = [] }) {
  const m = getModel();
  if (!m) return getMockScenario(module.name);

  const langName = LANG_NAMES[language] || 'English';
  const historyString = previousAnalogies.length > 0 ? `DO NOT use these companies as your core analogy: ${previousAnalogies.join(', ')}` : '';

  const prompt = `You are the Game Master for an Indian Social Startup Simulation.
Startup Idea: "${startup.idea}"
City/Context: ${startup.city || 'India'}
Current Module / Challenge: ${module.name} (${module.category})
Difficulty: ${module.difficulty || 'Intermediate'}
Language for output: ${langName}

Real World News Context (Tie this into the scenario!): "${newsContext || 'General market conditions'}"

${historyString}

Generate a highly interactive, 3-stage Gamified Scenario based on a real-world comparative case study (e.g., how Zepto, OYO, or Zomato handled a similar challenge). 
The stages must be:
Stage 1 (type: "mcq"): A critical decision with 4 options. Only 1 is optimal. For ALL options, include consequence insights and budget/trust penalties.
Stage 2 (type: "multiselect"): A risk management challenge where the user must select EXACTLY 2 correct strategic elements out of 4 options.
Stage 3 (type: "input"): A final reflection stage asking a targeted 1-line question for the user to answer via text input.

Output ONLY valid JSON matching exactly this structure (no markdown fences or code blocks):
{
  "realWorldAnalogy": "Name of the real Indian startup used for this case study (e.g. Zepto)",
  "stages": [
    {
      "id": "stage_1",
      "type": "mcq",
      "context": "string (the dramatic reading of the challenge. 3-4 sentences.)",
      "question": "string (the specific question to answer)",
      "options": [
        { "id": "A", "text": "string text", "isOptimal": false, "insight": "Why this failed in reality.", "budget": -5000, "trust": -10 },
        { "id": "B", "text": "string text", "isOptimal": true, "insight": "Why this works.", "budget": 1000, "trust": 20 }
        // ... must have exactly 4 options A, B, C, D
      ]
    },
    {
      "id": "stage_2",
      "type": "multiselect",
      "context": "string (the story evolves based on moving past stage 1)",
      "question": "Tick the top 2 correct strategies to execute next.",
      "options": [
        { "id": "A", "text": "string text", "isOptimal": true },
        { "id": "B", "text": "string text", "isOptimal": false },
        { "id": "C", "text": "string text", "isOptimal": true },
        { "id": "D", "text": "string text", "isOptimal": false }
      ],
      "feedback": { "success": "Insight if they pick the right 2", "failure": "Insight if they get it wrong" }
    },
    {
       "id": "stage_3",
       "type": "input",
       "context": "string (final twist or culmination)",
       "question": "In one sentence, summarize your core moat to investors."
    }
  ]
}`;

  try {
    const result = await m.generateContent(prompt);
    return parseJSONOrThrow(result.response.text());
  } catch(e) {
    console.warn("AI Scenario Failed, falling back to mock:", e);
    return getMockScenario(module.name);
  }
}

function getMockScenario(modName) {
  return {
    "realWorldAnalogy": "Haqdarshak",
    "stages": [
      {
        "id": "stage_1",
        "type": "mcq",
        "context": `Welcome to ${modName}. Your startup is facing a massive trust deficit in the rural deployment zone. Similar to the early days of Haqdarshak, locals view your app as another data-mining scam. Your runway is under 6 months.`,
        "question": "What is the fastest way to build initial operational trust?",
        "options": [
          { "id": "A", "text": "Run a massive Facebook ad campaign.", "isOptimal": false, "insight": "Burned cash. Nobody trusts an ad for grassroots problems.", "budget": -20000, "trust": -5 },
          { "id": "B", "text": "Partner with village Anganwadi workers.", "isOptimal": true, "insight": "Golden Path! Haqdarshak used active community nodes to bypass skepticism.", "budget": -5000, "trust": 40 },
          { "id": "C", "text": "Offer the platform entirely for free forever.", "isOptimal": false, "insight": "Destroys perceived value and ruins your unit economics.", "budget": -50000, "trust": 10 },
          { "id": "D", "text": "Wait to build a flawless v2 before launching.", "isOptimal": false, "insight": "You ran out of runway while hiding in a room perfectly coding useless features.", "budget": -80000, "trust": 0 }
        ]
      },
      {
        "id": "stage_2",
        "type": "multiselect",
        "context": "With initial trust secured, you receive your first minor funding tranche. Now you need to scale operational capacity without hiring full-time employees.",
        "question": "Tick the 2 most critical strategies to deploy next.",
        "options": [
          { "id": "A", "text": "Train a localized commission-based field force.", "isOptimal": true },
          { "id": "B", "text": "Rent a large premium office in the nearest Tier-1 city.", "isOptimal": false },
          { "id": "C", "text": "Digitize offline processes for the field force using WhatsApp.", "isOptimal": true },
          { "id": "D", "text": "Hire top-tier MBAs for ground operations.", "isOptimal": false }
        ],
        "feedback": { "success": "Perfect. Asset-light scalability is key. Local field forces + WhatsApp workflows drove mass adoption without burning runway.", "failure": "Flawed strategy. High overheads (offices/MBAs) bleed out social startups before product-market-fit is proven." }
      },
      {
         "id": "stage_3",
         "type": "input",
         "context": "Your field force is active, and the initial traction is promising. However, an investor asks you a tough question during a pitch.",
         "question": "In one single line, what is your unfair advantage against a well-funded corporate competitor?"
      }
    ]
  };
}

export async function evaluateDecision({ scenarioContext, userResponse, language }) {
  const m = getModel();
  if (!m) return { feedback: "Great point! Consistency is key.", score: 85 };

  const langName = LANG_NAMES[language] || 'English';
  const prompt = `You are a strict but encouraging startup mentor. 
Context: ${scenarioContext}
User's Strategy Summary: "${userResponse}"
Language to respond in: ${langName}

Grade this strategy summary on a scale of 0 to 100.
Provide a 2-sentence feedback explaining why it's strong or weak.

Output ONLY valid JSON matching this structure:
{
  "feedback": "string",
  "score": 85
}`;

  try {
    const result = await m.generateContent(prompt);
    return parseJSONOrThrow(result.response.text());
  } catch(e) {
    console.warn("AI Eval Failed, falling back to mock:", e);
    return { feedback: "That's an interesting approach, executing it will be the real test.", score: 70 };
  }
}

export async function getGrowthInsights({ startup, gameHistory, founderDNA, language }) {
  const m = getModel();
  const langName = LANG_NAMES[language] || 'English';

  const prompt = `You are the AI Growth Coach for an Indian Social Entrepreneur.
Startup: "${startup.idea}"
Recent Game History: ${JSON.stringify(gameHistory?.slice(-5) || [])}
Language: ${langName}

Based on recent decisions, generate a personalized growth dashboard.
Output ONLY valid JSON without markdown fences:
{
  "weaknessAreas": [{ "area": "string", "score": 40, "description": "string" }],
  "strengthAreas": [{ "area": "string", "score": 80, "description": "string" }],
  "mentorMessage": "string",
  "nextMilestone": "string"
}`;
  if (!m) return { mentorMessage: "Please connect Gemini API for growth insights." };
  try {
    const result = await m.generateContent(prompt);
    return parseJSONOrThrow(result.response.text());
  } catch(e) { return null; }
}

export async function generateReportInsights({ startup, module, scenario, attempts, language }) {
  const m = getModel();
  if (!m) return getMockInsights();
  const langName = LANG_NAMES[language] || 'English';

  const breakdown = attempts.map((a, i) => `[Stage ${i+1}] Q: ${a.question} | Response: ${Array.isArray(a.userAnswerRaw) ? a.userAnswerRaw.join(', ') : a.userAnswerRaw}`).join('\n');

  const prompt = `You are a startup executive coach.
The founder is building: "${startup.idea}"
They just completed the module: "${module.name}"
Case Study Context: "${scenario.context}"

Their phase-by-phase strategic responses:
${breakdown}

Analyze their strategic mindset across this case study.
Output ONLY valid JSON matching this exact structure:
{
  "overallInsight": "string (1-2 sentences summarizing their approach and what they must learn)",
  "strength": "string (One thing they did right or should lean into)",
  "blindspot": "string (The main conceptual error they made based on wrong attempts)",
  "oneLineSolution": "string (Short, punchy takeaway max 10 words. e.g. Community trust beats paid ads entirely.)"
}
Respond in Language: ${langName}`;

  try {
    const result = await m.generateContent(prompt);
    return parseJSONOrThrow(result.response.text());
  } catch(e) {
    console.warn("AI Insights failed, using mock", e);
    return getMockInsights();
  }
}

function getMockInsights() {
  return {
    overallInsight: "It's common to default to paid marketing when growth is slow, but in tier-2 Indian contexts, organic community trust is the ultimate currency. You learned this the hard way through budget burn.",
    strength: "You recognized the need for rapid distribution in your final choice.",
    blindspot: "Assuming D2C SaaS playbooks work in grassroots B2B agricultural environments.",
    oneLineSolution: "Community trust beats paid ads entirely."
  };
}

export async function chatWithCoach({ messages, startup, language }) {
  const m = getModel();
  if (!m) return "I'm here to help! Please add your Gemini API key to get personalized AI coaching.";

  const langName = LANG_NAMES[language] || 'English';
  const systemContext = `You are the UdyamPath AI Mentor. You are guiding an Indian social entrepreneur building: "${startup?.idea || 'a new project'}".
Use language: ${langName}. Be direct, empathetic, and focus on practical Indian context (jugaad, rural dynamics, unit economics). Do not be overly verbose. Use markdown for readability.`;

  const chatHistory = messages.slice(-8).map(msg => {
    const parts = [];
    if (msg.content) {
      parts.push({ text: msg.content });
    }
    if (msg.image) {
      parts.push({
        inlineData: {
          data: msg.image.data,
          mimeType: msg.image.mimeType
        }
      });
    }
    // Fallback if empty
    if (parts.length === 0) {
      parts.push({ text: "Empty message" });
    }

    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts,
    };
  });

  try {
    const chat = m.startChat({
      history: chatHistory.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.8,
      },
      systemInstruction: systemContext,
    });

    const lastMsg = chatHistory[chatHistory.length - 1];
    
    // Pass the parts array to sendMessage for multidisplay
    const result = await chat.sendMessage(lastMsg.parts);
    return result.response.text();
  } catch (err) {
    console.error('Coach chat error:', err);
    return "Network error, please try again.";
  }
}

export async function evaluateLevelFailure({ startup, levelDetails, scores, history, language }) {
  const m = getModel();
  const langName = LANG_NAMES[language] || 'English';

  const prompt = `You are the AI Growth Coach for an Indian Social Entrepreneur.
They just FAILED Level: "${levelDetails?.title}" (${levelDetails?.description}).
Their Scores: Impact(${scores?.socialImpact}/${levelDetails?.thresholds?.impact||0}), Finance(${scores?.financialSustainability}/${levelDetails?.thresholds?.finance||0})
Required to Pass: ${JSON.stringify(levelDetails?.thresholds || {})}
Game History: ${JSON.stringify(history)}
Language: ${langName}

Analyze their gameplay decisions and generate a specific harsh-but-fair feedback message, AND assign exactly 2 personalized learning modules they must study before retaking the level.

Output ONLY valid JSON without any markdown code block:
{
  "failureReason": "string (Why they failed based on their choices)",
  "mentorMessage": "string (Encouraging but firm advice on what to rethink)",
  "assignedHomework": [
    { "title": "string", "reason": "string", "estimatedTime": "15 mins" },
    { "title": "string", "reason": "string", "estimatedTime": "20 mins" }
  ]
}`;

  const result = await m.generateContent(prompt);
  return parseJSONOrThrow(result.response.text());
}

export async function generateDynamicResources({ startup, language }) {
  const m = getModel();
  const langName = LANG_NAMES[language] || 'English';

  const prompt = `Generate a list of highly specific, real-world educational resources (books, frameworks, exact youtube search terms) tailored perfectly to this Indian social enterprise idea:
Idea: "${startup.idea}"
Sector: "${startup.sector}"
Language: ${langName}

Output ONLY valid JSON without markdown fences:
{
  "videos": [
    { "title": "string (Specific Video Title)", "channel": "string", "duration": "10 min", "thumbnailColor": "indigo" },
    { "title": "string (Specific Video Title)", "channel": "string", "duration": "15 min", "thumbnailColor": "rose" },
    { "title": "string (Specific Video Title)", "channel": "string", "duration": "8 min", "thumbnailColor": "emerald" }
  ],
  "books": [
    { "title": "string", "author": "string", "keyTakeaway": "string" },
    { "title": "string", "author": "string", "keyTakeaway": "string" }
  ]
}`;
  
  const result = await m.generateContent(prompt);
  return parseJSONOrThrow(result.response.text());
}
