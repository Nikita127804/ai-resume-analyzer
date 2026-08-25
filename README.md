# AI Resume Analyzer 🚀
> Full-Stack AI-Powered Resume & Job Description Matcher, ATS Friendliness Checker, and RAG Career Advisor (B.Tech CSE Final Year Project).

[![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://ai-resume-analyzer-one-sage.vercel.app)
[![Backend: Render](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://ai-resume-analyzer-api-tn92.onrender.com)
[![Database: MongoDB_Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-green?logo=mongodb)](https://mongodb.com)
[![LLM: Google_Gemini](https://img.shields.io/badge/LLM-Google_Gemini-4285F4?logo=google)](https://aistudio.google.com)

---

## 🌐 Live Production Deployment Links

- **🌐 Live Web Application (Vercel)**: [https://ai-resume-analyzer-one-sage.vercel.app](https://ai-resume-analyzer-one-sage.vercel.app)
- **💻 GitHub Repository**: [https://github.com/Nikita127804/ai-resume-analyzer](https://github.com/Nikita127804/ai-resume-analyzer)
- **⚡ Live Backend API (Render)**: `https://ai-resume-analyzer-api-tn92.onrender.com`

---

## ✨ Key Features

1. **AI Skill Extraction**: Automatically parses uploaded PDF resumes (`pdf-parse` v1.1.1) and target job descriptions using Google Gemini (`gemini-3.6-flash`) to extract technical skills, tools, and frameworks.
2. **Vector Embeddings & Semantic Matching**: Generates 3072-dimensional text embeddings (`gemini-embedding-001`) and computes high-precision cosine similarity scores between candidate resumes and job requirements.
3. **Rule-Based ATS Friendliness Audit**: Performs automated ATS checks (section headings, contact info, optimal word count, bullet point density, text readability) and provides a score out of 100 with detailed diagnostic breakdown.
4. **AI Improvement Suggestions**: Generates 3 to 5 targeted recommendations using Gemini to bridge identified skill gaps.
5. **Interactive AI Bullet Point Rewriter**: Transforms weak resume bullet points into impact-driven, quantifiable achievements tailored to the target job context.
6. **RAG Chat Advisor**: Retrieval-Augmented Generation chat system allowing candidates to ask questions grounded in their specific resume and job description chunks.
7. **Multi-JD Vector Ranking**: Ranks multiple job descriptions against a single resume using vector similarity to help candidates discover their best-fit roles.
8. **PDF Report Export**: Export analysis results and score breakdowns as clean, formatted PDF reports.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose, Multer, `pdf-parse` (v1.1.1).
- **Database**: MongoDB Atlas.
- **Authentication**: JWT (JSON Web Tokens), `bcryptjs`.
- **AI Models**:
  - `gemini-3.6-flash` (Structured Skill Extraction, Recommendation Generation, Bullet Rewriting).
  - `gemini-embedding-001` (3072-dim Vector Embedding Generation).

---

## 🏗️ Project Architecture

```text
ai-resume-analyzer/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptors
│   │   ├── components/         # Navbar, Layout, ProtectedRoute
│   │   ├── context/            # AuthContext (login/signup state)
│   │   ├── pages/              # Landing, Dashboard, Upload, AnalysisDetail, Chat
│   │   └── App.jsx             # React Router setup
│   └── package.json
│
└── server/                     # Node.js + Express Backend
    ├── controllers/            # authController, resumeController, jobController, analysisController, chatController
    ├── middleware/             # authMiddleware (JWT verification), upload (Multer memoryStorage)
    ├── models/                 # User, Resume, JobDescription, Analysis
    ├── routes/                 # authRoutes, resumeRoutes, jobRoutes, analysisRoutes, chatRoutes
    ├── utils/                  # llm.js (Gemini API), similarity.js (Cosine), atsChecker.js, rag.js
    ├── index.js                # Express app entry point & CORS configuration
    └── package.json
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection URI
- Free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Environment Setup

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
LLM_API_KEY=your_google_gemini_api_key
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install & Run

**Backend**:
```bash
cd server
npm install
npm run dev
```

**Frontend**:
```bash
cd client
npm install
npm run dev
```

---

## 📄 License
ISC License - B.Tech CSE Final Year Capstone Project.
