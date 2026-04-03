# UdyamPath

### The High-Stakes Stakeholder Simulator for Social Entrepreneurs

[![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)](https://udyam-path-qhcd.vercel.app/)
[![Demo](https://img.shields.io/badge/Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://udyam-path-qhcd.vercel.app/)
[![Hackathon](https://img.shields.io/badge/GDG-2026-blue?style=for-the-badge)](https://github.com/VEDESH18/UdyamPath)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub](https://img.shields.io/badge/GitHub-VEDESH18-181717?style=for-the-badge&logo=github)](https://github.com/VEDESH18)

> "Traditional courses teach you to read a map. UdyamPath teaches you to fly the plane during a storm."

UdyamPath is an AI-first simulation and coaching platform built for founders in India, especially Tier-2 and Tier-3 ecosystems. It converts passive startup learning into realistic decision-making through scenario simulation, multilingual guidance, and role-based stakeholder interactions.

## Live Product

- Production: https://udyam-path-qhcd.vercel.app/

## What Is UdyamPath?

UdyamPath is designed as a founder command center for high-pressure startup choices:

- Validate social startup ideas before expensive execution.
- Practice critical conversations with investors, officials, and beneficiaries.
- Learn through dynamic scenarios, not static quizzes.
- Build confidence with localized, multilingual AI coaching.

## Why This Project Matters

In early-stage entrepreneurship, failure is often caused by execution decisions under uncertainty, not lack of intent. UdyamPath addresses that gap by providing:

- Contextual simulation over textbook theory.
- Vernacular coaching for inclusive adoption.
- Repeatable, measurable learning loops for founder growth.

## Core Product Modules

### 1) AI Stakeholder Simulator

- Simulates investor, government, and community conversations.
- Changes narrative path based on user responses.
- Evaluates trust, clarity, and strategy quality.

### 2) Founder Coaching Layer

- Supports Hindi, Telugu, Tamil, and English interactions.
- Guides users in real-time through challenging scenarios.
- Provides adaptive feedback with explanation-oriented coaching.

### 3) Smart Learning Engine

- Tracks performance across modules.
- Stores progression and outcomes for each user.
- Surfaces targeted resources to close skill gaps.

### 4) Validation and Decision Intelligence

- Stress-tests idea feasibility and impact potential.
- Helps users reason about pivot risk, growth fit, and compliance.
- Encourages evidence-backed decision making.

## Agentic AI Architecture

UdyamPath uses a multi-agent design pattern:

- Validator Agent: assesses social impact and viability.
- Simulation Director: generates role-play scenarios from business context.
- Udyam Guru Agent: mentor-style support for confidence and clarity.
- Resource Agent: maps weaknesses to actionable learning resources.

## Technology Stack

### Frontend

- React 18
- Vite 6
- TailwindCSS
- Framer Motion
- React Router

### AI and Data

- OpenAI
- Google Gemini
- Sarvam AI
- Firebase Firestore
- Firebase Authentication

### Utility and Reporting

- jsPDF
- Recharts

## Learning Curriculum (8 Critical Founder Tracks)

1. Fundraising and investor readiness
2. Crisis response and reputation management
3. Sales and early traction strategy
4. Team and leadership decisions
5. Government and compliance workflow
6. Zero-budget marketing execution
7. Pivot strategy under uncertainty
8. Revenue and sustainability modeling

## Project Structure

```text
UdyamPath/
   src/
      components/
      context/
      data/
      hooks/
      pages/
      services/
      utils/
```

## Installation and Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### 1) Clone and Install

```bash
git clone https://github.com/VEDESH18/UdyamPath.git
cd UdyamPath
npm install
```

### 2) Configure Environment

Create a root `.env` file with:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_YOUTUBE_API_KEY=your_youtube_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_SARVAM_API_KEY=your_sarvam_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3) Run the App

```bash
npm run dev
```

## Deployment Guide

### Deploy Frontend on Vercel

1. Import repository in Vercel.
2. Root Directory: `UdyamPath`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add all `VITE_` environment variables.
6. Deploy and verify.

### Firebase Production Auth Checklist

To avoid `auth/unauthorized-domain`:

1. Open Firebase Console for active project.
2. Go to Authentication -> Settings -> Authorized domains.
3. Add exact Vercel domain (and custom domain if any).
4. Enable Email/Password and Google providers.

## Security Best Practices

- Never commit `.env` or private keys.
- Keep API secrets in platform environment variables.
- Rotate exposed keys immediately if leaked.
- Use backend proxy for sensitive AI keys in production.

## Performance Notes

- Large Vite chunk warnings are optimization hints, not deploy blockers.
- Recommended improvements:
  - Route-level code splitting
  - Manual chunking via Rollup options
  - Lazy-loading heavy components

## Roadmap

- Server-side AI proxy for secure key management
- Scenario analytics for mentors and incubators
- Expanded language coverage
- Adaptive difficulty based on founder maturity

## Contributing

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit clear, atomic changes
4. Open a pull request

## Contact

- GitHub: https://github.com/VEDESH18
- LinkedIn: https://www.linkedin.com/in/vedesh-ridhvi/
- Email: vedeshridhvi@gmail.com

## License

Currently shared for hackathon and portfolio use. Add a formal license for open-source distribution.

## Author

Built by VEDESH18 for GDG Hackathon 2026.
