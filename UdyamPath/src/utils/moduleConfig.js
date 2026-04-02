export const MOCK_ARTICLES = {
  'seed': { title: "Zepto raises $340M in strong funding round", description: "Quick commerce startup Zepto has raised $340 million at a $5 billion valuation despite a challenging macro environment — driven purely by unit economics discipline.", date: "2024-08-15", url: "https://example.com/zepto" },
  'crisis': { title: "Byju's navigates massive valuation markdown", description: "Edtech decacorn Byju's faces a crisis as investors mark down its valuation by 90%, employees go unpaid, and the BCCI threatens a Rs 158 crore lawsuit.", date: "2024-01-10", url: "https://example.com/byjus" },
  'customers': { title: "Dunzo's early hustle to find first 100 customers", description: "How Dunzo used personal WhatsApp messages to onboard its first users in Bengaluru, with Kabeer personally calling every customer who churned.", date: "2018-05-12", url: "https://example.com/dunzo" },
  'team': { title: "Freshworks early hiring blueprint", description: "Girish Mathrubootham's insights on hiring the first 50 engineers in Chennai — focusing on culture fit over credentials and paying above-market early to retain talent.", date: "2019-11-20", url: "https://example.com/freshworks" },
  'compliance': { title: "Paytm faces RBI regulatory action", description: "RBI restricts Paytm Payments Bank from accepting new deposits, causing stock to crash 40% in one week and forcing a complete business model restructure.", date: "2024-01-31", url: "https://example.com/paytm" },
  'marketing': { title: "Zomato's zero budget viral marketing", description: "How Zomato used quirky emails, social media roasts, and meme marketing to achieve virality — spending virtually nothing while competitors burned crores on TV ads.", date: "2020-03-05", url: "https://example.com/zomato" },
  'pivot': { title: "Naukri.com's pivot that saved the company", description: "Sanjeev Bikhchandani realized the free classifieds model was burning cash with no path to profitability. His painful pivot to subscriptions was mocked — then celebrated.", date: "2002-08-10", url: "https://example.com/naukri" },
  'revenue': { title: "ShareChat's monetization journey", description: "ShareChat introduces virtual gifting and brand integrations to monetize its massive Tier 2 and Tier 3 vernacular userbase after 4 years of pure growth focus.", date: "2022-07-22", url: "https://example.com/sharechat" },
  'default': { title: "Indian Startup Ecosystem 2024", description: "Despite global slowdown, Indian B2B SaaS and D2C brands continue scaling — driven by frugal innovation, vernacular reach, and mobile-first strategies.", date: new Date().toISOString(), url: "https://example.com/india" }
};

export const generateScenarioPrompt = (idea, moduleName, topic, difficulty, article, history, language = 'en') => {
  const diffInstructions = {
    'Beginner': 'Simple scenarios, one variable at a time, clear correct answers, very relatable analogies.',
    'Intermediate': 'Multiple competing variables, some ambiguity, real trade-offs required.',
    'Expert': 'High complexity, contradictory data, time pressure framing, no obvious right answer.'
  }[difficulty] || 'Intermediate';

  const langMap = {
    'en': 'English',
    'hi': 'Hindi (with English business terms)',
    'te': 'Telugu (with English business terms)',
    'ta': 'Tamil (with English business terms)'
  };
  const targetLanguage = langMap[language] || 'English';

  return `You are an IIM professor creating an immersive 10-minute startup case study simulation.

Founder's idea: "${idea}"
Module: ${moduleName} — ${topic}
Difficulty: ${difficulty} — ${diffInstructions}
Real case study basis: ${article.title} — ${article.description}

MISSION: Create a 3-STAGE narrative where the founder lives through an entire business crisis arc — from discovering the problem → making critical decisions → recovering and growing. The whole journey should take 8-12 minutes.

LANGUAGE INSTRUCTION: ALL generated content (descriptions, questions, options, explanations, avatarScript) MUST BE IN ${targetLanguage}. The JSON keys must remain in English.

CRITICAL RULES:
1. The real company (from the article) is the MENTOR story. The founder's specific idea "${idea}" is the STUDENT's parallel journey.
2. Every question must be an active STAKEHOLDER INTERACTION. Instead of asking fact-checking questions, put the user in a room talking to an investor, a government official, a customer, or a partner.
3. Every question must have a 'stakeholder' field like '👔 Investor', '🏛️ Government', '🧑‍🌾 Customer', '🤝 Co-founder', etc.
4. The 'context' field MUST boldly set the scene (e.g. 'You are sitting across from a VC...')
5. The 'question' field MUST be dialogue: 'How do you respond?' or 'What do you say?'
6. The 'impactIfWrong' MUST describe the stakeholder's negative physical reaction (e.g. 'The investor rolls his eyes and closes his notebook.')
7. 15 questions total, varied types, real branching consequences.

Return EXACTLY this JSON (no markdown, no code fences):
{
  "caseStudyTitle": "String — dramatic title",
  "companyName": "String — the real company",
  "companyContext": "String (3-4 sentences about the real company)",
  "whatHappened": "String (4-5 sentences, the core crisis with real numbers)",
  "yourSituation": "String (3-4 sentences connecting to '${idea}')",
  "keyChallenge": "String (1 powerful dramatic question the founder faces)",
  "stakesClarification": "String (what happens if they fail — be specific)",
  "avatarScript": "String (70-90 words, warm Indian mentor speaking to the founder, referencing their specific idea)",
  "stages": [
    {
      "id": 1,
      "title": "Stage 1: The Crisis Hits",
      "narration": "String (2-3 sentences setting up Stage 1 — the problem just emerged for the real company AND for the founder's idea)"
    },
    {
      "id": 2,
      "title": "Stage 2: The Critical Decision",
      "narration": "String (2-3 sentences — things got worse, now a major fork in the road)"
    },
    {
      "id": 3,
      "title": "Stage 3: Recover & Scale",
      "narration": "String (2-3 sentences — survived the crisis, now building forward)"
    }
  ],
  "questions": [
    {
      "id": 1, "stage": 1, "type": "mcq",
      "stakeholder": "String (e.g. '👔 Seed Investor')",
      "context": "String (1 sentence setting the scene where you are talking to this stakeholder)",
      "question": "String (e.g. 'How do you respond?' or 'What is your pitch?')",
      "options": { "A": "String (Dialogue — 'I tell them that...')", "B": "String", "C": "String", "D": "String" },
      "correct": "A", "explanation": "String (2 sentences, why the stakeholder liked this and mention real company outcome)", "analogy": "String (Indian analogy)", "impactIfWrong": "String (The stakeholder's negative REACTION if failed)", "branchesTo": null
    },
    {
      "id": 2, "stage": 1, "type": "truefalse",
      "stakeholder": "String (e.g. '🤝 Co-founder')",
      "context": "String",
      "statement": "String (A claim made by the stakeholder that you must agree or disagree with)",
      "correct": true,
      "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 3, "stage": 1, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "How do you respond?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "B", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 4, "stage": 1, "type": "fillblank",
      "stakeholder": "String",
      "context": "String",
      "sentence": "String (The stakeholder demands a number or metric: 'We need ___ to approve this.')",
      "answer": "String", "acceptable_answers": ["String", "String"], "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 5, "stage": 1, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "How do you handle this ultimatum?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "C", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 6, "stage": 2, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "What offer do you make them?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "A", "explanation": "String", "analogy": "String", "impactIfWrong": "String",
      "branchesTo": { "ifCorrect": "stage2_expert", "otherwise": "stage2_support" }
    },
    {
      "id": 7, "stage": 2, "type": "match",
      "stakeholder": "String (e.g. '📊 Board of Directors')",
      "context": "String",
      "question": "Match your negotiation offers to their corresponding stakeholder demands.",
      "pairs": [
        { "left": "String", "right": "String" },
        { "left": "String", "right": "String" },
        { "left": "String", "right": "String" },
        { "left": "String", "right": "String" }
      ],
      "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 8, "stage": 2, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "How do you defend your model?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "D", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 9, "stage": 2, "type": "truefalse",
      "stakeholder": "String",
      "context": "String",
      "statement": "String",
      "correct": false,
      "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 10, "stage": 2, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "What do you tell the press?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "B", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 11, "stage": 2, "type": "fillblank",
      "stakeholder": "String",
      "context": "String",
      "sentence": "String",
      "answer": "String", "acceptable_answers": ["String", "String"], "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 12, "stage": 3, "type": "mcq",
      "stakeholder": "String",
      "context": "String",
      "question": "How do you close the deal?",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "A", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 13, "stage": 3, "type": "truefalse",
      "context": "String",
      "statement": "String — about sustainable growth vs growth at all costs",
      "correct": true,
      "explanation": "String", "analogy": "String", "branchesTo": null
    },
    {
      "id": 14, "stage": 3, "type": "mcq",
      "context": "String — a key partnership opportunity appears",
      "question": "String — how do you evaluate this opportunity",
      "options": { "A": "String", "B": "String", "C": "String", "D": "String" },
      "correct": "C", "explanation": "String", "analogy": "String", "impactIfWrong": "String", "branchesTo": null
    },
    {
      "id": 15, "stage": 3, "type": "openended",
      "context": "You've lived through the full arc. Now apply your learnings.",
      "question": "Based on how ${article.title.split(' ').slice(0,3).join(' ')} handled this crisis — write YOUR specific 2-step action plan for the next 30 days for your idea: ${idea}",
      "scoringCriteria": "Must be specific to their idea, include at least one real metric or milestone, show learning from the case study",
      "exampleGoodAnswer": "String — a strong example answer referencing both the real company lesson and their specific idea",
      "branchesTo": null
    }
  ],
  "realWorldOutcome": "String (what actually happened to the real company — 2-3 sentences with numbers)",
  "keyLearning": "String (the one universally applicable insight)",
  "howThisApplies": "String (directly connecting to '${idea}')",
  "nextStepAction": "String (one specific thing the founder can do THIS WEEK)"
}`;
};
