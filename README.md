<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Treez Intelligence - Advanced AI Platform

A full-stack AI application featuring chat, live voice, and video generation capabilities powered by Google's Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1BvchPAOHXSJxUuJ3dtdd7k7_7rGHR2qT

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (Port 3000)
- **Backend**: Node.js + Express + WebSocket (Port 3001)
- **AI**: Google Gemini API (@google/genai)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Edit the `.env.local` file and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
API_KEY=your_actual_api_key_here
```

**Get your API key from**: https://aistudio.google.com/app/apikey

### 3. Run the Application

**Development Mode** (runs both frontend and backend):
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

**Production Mode**:
```bash
npm run build
npm start
```

## 🎯 Features

- **Treez Chat**: Text-based AI chat with image attachment support
- **Treez Live**: Real-time voice conversation with AI
- **Treez Motion**: AI-powered video generation

## 📁 Project Structure

```
treez-intelligence/
├── components/          # React components
├── services/           # API service layer
├── server.js           # Express backend server
├── App.tsx             # Main React app
├── index.tsx           # React entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS config
└── package.json        # Dependencies & scripts
```

## 🔧 Available Scripts

- `npm run dev` - Run development server (frontend + backend)
- `npm run dev:server` - Run only backend server
- `npm run dev:client` - Run only frontend dev server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🌐 API Endpoints

- `POST /api/chat/start` - Initialize chat session
- `POST /api/chat/message` - Send chat message (streaming)
- `POST /api/image` - Generate image
- `POST /api/video/generate` - Start video generation
- `POST /api/video/poll` - Poll video generation status
- `WebSocket /` - Live voice connection

## 🔐 Security Notes

- API keys are stored in `.env.local` and never exposed to frontend
- All AI operations run through the backend server
- CORS is configured for local development

## 📝 License

Private - All rights reserved
