import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects the PORT environment variable.
const port = parseInt(process.env.PORT) || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// Initialize GenAI on the server
// NOTE: Ensure you add the API_KEY environment variable in the Cloud Run console.
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
  console.warn("⚠️  Warning: API_KEY is missing or not set properly.");
  console.warn("📝 Please set your GEMINI_API_KEY in the .env.local file");
  console.warn("🔑 Get your API key from: https://aistudio.google.com/app/apikey");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key_to_prevent_crash_on_start" });

// Create HTTP server to attach WebSocket to it
const server = http.createServer(app);

// In-memory stores
const chatSessions = new Map();
const videoOperations = new Map();

// --- REST Endpoints ---

// 1. Start a new Chat Session
app.post('/api/chat/start', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    const model = 'gemini-3-flash-preview';
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: "You are Treez, a highly advanced, creative, and helpful AI assistant developed by Treez Intelligence. You are capable of reasoning, coding, and creative writing. Your tone is professional yet warm and futuristic.",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    chatSessions.set(sessionId, chat);
    res.json({ sessionId });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// 2. Send Message (Streaming)
app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message, attachment } = req.body;
  const chat = chatSessions.get(sessionId);

  if (!chat) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    let messageContent = message;

    if (attachment) {
      messageContent = [
        { text: message },
        { 
          inlineData: { 
            mimeType: attachment.mimeType, 
            data: attachment.base64 
          } 
        }
      ];
    }

    const result = await chat.sendMessageStream({ message: messageContent });
    
    for await (const chunk of result) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write('Error generating response.');
    res.end();
  }
});

// 3. Generate Image
app.post('/api/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] }
    });

    let imageUrl = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      res.status(500).json({ error: 'No image generated' });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// 4. Start Video Generation (Veo)
app.post('/api/video/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = 'veo-3.1-fast-generate-preview';

    const operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    const opId = Date.now().toString();
    videoOperations.set(opId, operation);

    res.json({ operationId: opId });

  } catch (error) {
    console.error('Video generation start error:', error);
    res.status(500).json({ error: error.message || 'Failed to start video generation' });
  }
});

// 5. Poll Video Status
app.post('/api/video/poll', async (req, res) => {
  try {
    const { operationId } = req.body;
    let operation = videoOperations.get(operationId);

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    const updatedOperation = await ai.operations.getVideosOperation({ operation });
    videoOperations.set(operationId, updatedOperation);

    if (updatedOperation.done) {
        const videoUri = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
        res.json({ done: true, uri: videoUri });
        videoOperations.delete(operationId);
    } else {
        res.json({ done: false });
    }

  } catch (error) {
    console.error('Video polling error:', error);
    res.status(500).json({ error: 'Failed to poll video status' });
  }
});

// --- Static File Serving ---
app.use(express.static(__dirname));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- WebSocket Server for Live API ---
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
  console.log('Client connected to Live Proxy');

  try {
    const session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: "You are Treez Live, a real-time conversational intelligence developed by Treez Intelligence. Be concise, engaging, and friendly."
      },
      callbacks: {
        onopen: () => {
          ws.send(JSON.stringify({ type: 'open' }));
        },
        onmessage: (msg) => {
          ws.send(JSON.stringify(msg));
        },
        onclose: () => {
          ws.close();
        },
        onerror: (err) => {
          console.error('Google Live API Error:', err);
          ws.close();
        }
      }
    });

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'input') {
          session.sendRealtimeInput({ media: parsed.media });
        }
      } catch (e) {
        console.error('Error parsing client message', e);
      }
    });

    ws.on('close', () => {
      // Cleanup
    });

  } catch (error) {
    console.error('Failed to connect to Live API:', error);
    ws.close();
  }
});

// IMPORTANT: Bind to 0.0.0.0 for Cloud Run
server.listen(port, '0.0.0.0', () => {
  console.log(`Treez Backend Server running on http://0.0.0.0:${port}`);
});