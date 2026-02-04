<div align="center">
<img width="1200" height="475" alt="Treez Intelligence Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🌳 Treez Intelligence

### Advanced AI Platform with Multi-Modal Capabilities

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey?logo=express)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

**A full-stack, production-ready AI application featuring intelligent chat, real-time voice conversations, and AI-powered video generation — all powered by Google's cutting-edge Gemini AI.**

[View in AI Studio](https://ai.studio/apps/drive/1BvchPAOHXSJxUuJ3dtdd7k7_7rGHR2qT) • [Report Bug](https://github.com/balirwaalvin/treez-intelligence/issues) • [Request Feature](https://github.com/balirwaalvin/treez-intelligence/issues)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**Treez Intelligence** is a sophisticated, full-stack AI platform that harnesses the power of Google's Gemini AI to deliver three distinct, cutting-edge experiences:

- 🤖 **Intelligent Chat** - Context-aware conversations with multimodal understanding
- 🎙️ **Live Voice** - Real-time audio conversations with natural AI responses
- 🎬 **Video Generation** - AI-powered video creation from text descriptions

Built with modern web technologies and a secure backend architecture, Treez Intelligence demonstrates best practices in AI application development, including proper API key management, streaming responses, WebSocket communication, and a beautiful, responsive UI.

### Why Treez Intelligence?

- ✅ **Production-Ready**: Secure backend with environment variable management
- ✅ **Modern Stack**: React, TypeScript, Node.js, Express, Vite, Tailwind CSS
- ✅ **Real-Time**: WebSocket support for live voice features
- ✅ **Beautiful UI**: Polished, futuristic interface with smooth animations
- ✅ **Extensible**: Clean architecture for easy feature additions

---

## ✨ Key Features

### 💬 Treez Chat
- **Intelligent Conversations**: Powered by Gemini 3 Flash for fast, accurate responses
- **Image Understanding**: Upload and discuss images with AI
- **Streaming Responses**: Real-time text generation for fluid conversations
- **Session Management**: Persistent chat sessions with context awareness
- **Markdown Support**: Rich text formatting in responses

### 🎤 Treez Live
- **Real-Time Voice**: Natural voice conversations with AI
- **Low Latency**: WebSocket-based streaming for instant responses
- **Voice Selection**: Multiple voice options including Kore voice profile
- **Audio Processing**: Efficient audio streaming and playback
- **Hands-Free Mode**: Continuous conversation support

### 🎥 Treez Motion
- **AI Video Generation**: Create videos from text prompts using Veo 3.1
- **High Quality**: 720p resolution with 16:9 aspect ratio
- **Progress Tracking**: Real-time status updates during generation
- **Download Support**: Save generated videos locally
- **Fast Processing**: Optimized with Veo 3.1 Fast Generate

---

## 🛠️ Tech Stack

### Frontend
- **[React 18.2](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript 5.3](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite 5.0](https://vitejs.dev/)** - Lightning-fast build tool
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **[Node.js 18+](https://nodejs.org/)** - JavaScript runtime
- **[Express 4.18](https://expressjs.com/)** - Web application framework
- **[WebSocket (ws)](https://github.com/websockets/ws)** - Real-time communication
- **[CORS](https://github.com/expressjs/cors)** - Cross-origin resource sharing
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variable management

### AI & APIs
- **[Google Gemini API](https://ai.google.dev/)** - Advanced AI models
  - Gemini 3 Flash (Chat)
  - Gemini 2.5 Flash Native Audio (Live Voice)
  - Gemini 2.5 Flash Image (Image Generation)
  - Veo 3.1 Fast Generate (Video Creation)

### Development Tools
- **[Concurrently](https://github.com/open-cli-tools/concurrently)** - Run multiple processes
- **[PostCSS](https://postcss.org/)** - CSS transformation
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS vendor prefixes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (React + Vite)                 │
│              Port 3000                          │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  UI Components                           │  │
│  │  ├── ChatInterface                       │  │
│  │  ├── LiveInterface                       │  │
│  │  ├── VideoInterface                      │  │
│  │  └── Logo                                │  │
│  └──────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Service Layer (genai.ts)                │  │
│  │  • API Client                            │  │
│  │  • Session Management                    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
              Vite Proxy (/api → :3001)
                      ↓
┌─────────────────────────────────────────────────┐
│      Backend (Node.js + Express)                │
│              Port 3001                          │
│                                                 │
│  ┌────────────────���─────────────────────────┐  │
│  │  REST API Endpoints                      │  │
│  │  ├── POST /api/chat/start                │  │
│  │  ├── POST /api/chat/message (stream)     │  │
│  │  ├── POST /api/image                     │  │
│  │  ├── POST /api/video/generate            │  │
│  │  └── POST /api/video/poll                │  │
│  └──────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌──────────────────────────────────────────┐  │
│  │  WebSocket Server                        │  │
│  │  └── Live Voice Streaming                │  │
│  └──────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Google GenAI SDK                        │  │
│  │  • Session Management                    │  │
│  │  • Model Configuration                   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
              Google Gemini API
              • Chat Models
              • Voice Models  
              • Image Models
              • Video Models
```

### Key Design Principles

1. **Security First**: API keys never exposed to frontend
2. **Separation of Concerns**: Clear frontend/backend boundaries
3. **Scalability**: Stateless API design with session management
4. **Performance**: Streaming responses and WebSocket for real-time features
5. **Developer Experience**: Hot reload, TypeScript, and modern tooling

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/balirwaalvin/treez-intelligence.git
   cd treez-intelligence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create or edit `.env.local` in the root directory:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_actual_api_key_here
   API_KEY=your_actual_api_key_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

   > ⚠️ **Important**: Never commit your `.env.local` file to version control!

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - **Backend API** at `http://localhost:3001`
   - **Frontend** at `http://localhost:3000`

5. **Open your browser**
   
   Navigate to `http://localhost:3000` and start exploring!

---

## 💡 Usage

### Starting a Chat Conversation

1. Click on **"Treez Chat"** in the sidebar
2. Click **"New Chat"** to start a fresh conversation
3. Type your message or upload an image
4. Watch as the AI streams its response in real-time

**Example Prompts:**
- "Explain quantum computing in simple terms"
- "Write a Python function to sort a list"
- "Analyze this image and describe what you see" (with image upload)

### Using Live Voice

1. Navigate to **"Treez Live"** 
2. Allow microphone permissions when prompted
3. Click the microphone button to start talking
4. The AI will respond with natural voice

**Tips:**
- Speak clearly and at a normal pace
- Wait for the AI to finish responding before speaking again
- Check your microphone settings if audio isn't detected

### Generating Videos

1. Go to **"Treez Motion"**
2. Enter a detailed video description
3. Click **"Generate Video"**
4. Wait for processing (typically 30-60 seconds)
5. Preview and download your video

**Example Prompts:**
- "A serene sunset over a mountain lake"
- "A futuristic city with flying cars"
- "A cat playing piano in slow motion"

---

## 📡 API Documentation

### REST Endpoints

#### `POST /api/chat/start`
Initialize a new chat session.

**Response:**
```json
{
  "sessionId": "1738632000000"
}
```

#### `POST /api/chat/message`
Send a message to the chat (streaming response).

**Request:**
```json
{
  "sessionId": "1738632000000",
  "message": "Hello, Treez!",
  "attachment": {
    "mimeType": "image/jpeg",
    "base64": "base64_encoded_image"
  }
}
```

**Response:** Server-Sent Events (streaming text)

#### `POST /api/image`
Generate an image from a text prompt.

**Request:**
```json
{
  "prompt": "A futuristic AI robot"
}
```

**Response:**
```json
{
  "imageUrl": "data:image/jpeg;base64,..."
}
```

#### `POST /api/video/generate`
Start video generation process.

**Request:**
```json
{
  "prompt": "A peaceful forest scene"
}
```

**Response:**
```json
{
  "operationId": "1738632000001"
}
```

#### `POST /api/video/poll`
Check video generation status.

**Request:**
```json
{
  "operationId": "1738632000001"
}
```

**Response:**
```json
{
  "done": true,
  "uri": "gs://bucket/video.mp4"
}
```

### WebSocket Connection

**Endpoint:** `ws://localhost:3001`

**Client → Server:**
```json
{
  "type": "input",
  "media": {
    "mimeType": "audio/pcm",
    "data": "base64_encoded_audio"
  }
}
```

**Server → Client:**
```json
{
  "type": "audio",
  "data": "base64_encoded_audio"
}
```

---

## 📁 Project Structure

```
treez-intelligence/
├── components/                 # React UI Components
│   ├── ChatInterface.tsx       # Chat UI with message history
│   ├── LiveInterface.tsx       # Live voice interface
│   ├── VideoInterface.tsx      # Video generation UI
│   └── Logo.tsx                # Branding component
│
├── services/                   # Frontend service layer
│   └── genai.ts                # API client for backend communication
│
├── server.js                   # Express backend server
├── App.tsx                     # Main React application
├── index.tsx                   # React entry point
├── index.html                  # HTML template
├── types.ts                    # TypeScript type definitions
│
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
│
├── styles.css                  # Global styles
├── .env.local                  # Environment variables (not committed)
├── .gitignore                  # Git ignore rules
│
├── README.md                   # This file
├── SETUP_GUIDE.md              # Detailed setup instructions
└── GITHUB_PUSH_INSTRUCTIONS.md # Git deployment guide
```

---

## ⚙️ Configuration

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend and backend in development mode |
| `npm run dev:server` | Run only the backend server |
| `npm run dev:client` | Run only the frontend dev server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run preview` | Preview the production build locally |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `API_KEY` | Alias for GEMINI_API_KEY | ✅ Yes |
| `PORT` | Backend server port (default: 3001) | ❌ No |
| `NODE_ENV` | Environment (development/production) | ❌ No |

### Vite Proxy Configuration

The frontend proxies API requests to the backend:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false,
  }
}
```

---

## 🔐 Security

### Best Practices Implemented

1. **API Key Protection**
   - ✅ Keys stored in `.env.local` (gitignored)
   - ✅ Never exposed to frontend code
   - ✅ All AI operations proxied through backend

2. **CORS Configuration**
   - ✅ Configured for local development
   - ✅ Can be restricted for production deployment

3. **Input Validation**
   - ✅ Request body parsing with size limits (10mb)
   - ✅ Error handling on all endpoints

4. **Session Management**
   - ✅ Server-side session storage
   - ✅ Unique session IDs for each chat

### Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your domain only
- [ ] Use HTTPS for all connections
- [ ] Implement rate limiting
- [ ] Add authentication if needed
- [ ] Monitor API usage and costs
- [ ] Set up logging and error tracking

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper types
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

Private - All rights reserved.

This project is proprietary software. Unauthorized copying, distribution, or modification is prohibited.

---

## 📧 Contact

**Alvin Balirwa**
- Email: sanyukalvin@gmail.com
- GitHub: [@balirwaalvin](https://github.com/balirwaalvin)

**Project Link:** [https://github.com/balirwaalvin/treez-intelligence](https://github.com/balirwaalvin/treez-intelligence)

**AI Studio:** [View Project](https://ai.studio/apps/drive/1BvchPAOHXSJxUuJ3dtdd7k7_7rGHR2qT)

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) - Powerful AI models
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Express](https://expressjs.com/) - Backend framework

---

<div align="center">

**Built with ❤️ by Alvin Balirwa**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/balirwaalvin/treez-intelligence/issues) · [Request Feature](https://github.com/balirwaalvin/treez-intelligence/issues)

</div>
