// NOTE: We have removed the direct 'ai' export to prevent insecure frontend usage.
// All interactions now go through the backend API.

// Constants
export const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

// Use relative path for API calls. 
// This allows the frontend to talk to the backend on the same domain/port automatically,
// whether on localhost:3001 or on a deployed Cloud Run URL.
const API_BASE = '/api';

export interface Attachment {
  base64: string;
  mimeType: string;
}

/**
 * Creates a chat session that communicates with the backend.
 * Returns an object compatible with the GoogleGenAI Chat interface.
 */
export const createChatSession = () => {
  let sessionId: string | null = null;

  // Initialize session
  const initPromise = fetch(`${API_BASE}/chat/start`, { method: 'POST' })
    .then(res => res.json())
    .then(data => { sessionId = data.sessionId; })
    .catch(err => console.error("Failed to init chat session", err));

  return {
    sendMessageStream: async function* ({ message, attachment }: { message: string, attachment?: Attachment }) {
      await initPromise;
      if (!sessionId) throw new Error("Chat session not initialized");

      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message, attachment })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        // Yield an object mimicking the SDK response structure
        yield { text }; 
      }
    }
  };
};

/**
 * Generates an image via the backend.
 */
export const generateGenesisImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) throw new Error('Backend error');
    
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

/**
 * Generates a video via the backend (Secure Veo).
 * Handles polling internally.
 */
export const generateGenesisVideo = async (prompt: string): Promise<string | null> => {
    try {
        // 1. Start Operation
        const startRes = await fetch(`${API_BASE}/video/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!startRes.ok) {
            const errData = await startRes.json();
            throw new Error(errData.error || 'Failed to start video');
        }

        const { operationId } = await startRes.json();

        // 2. Poll until done
        let isDone = false;
        let videoUri = null;

        while (!isDone) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

            const pollRes = await fetch(`${API_BASE}/video/poll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationId })
            });

            if (!pollRes.ok) throw new Error("Polling failed");

            const pollData = await pollRes.json();
            
            if (pollData.done) {
                isDone = true;
                videoUri = pollData.uri;
            }
        }
        
        return videoUri;

    } catch (error) {
        console.error("Video generation failed:", error);
        throw error;
    }
}