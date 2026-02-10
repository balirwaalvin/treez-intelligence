import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Activity, Radio } from 'lucide-react';

// --- Audio Utilities ---

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Component ---

export const LiveInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  const cleanupAudio = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    sourcesRef.current.forEach(src => {
        try { src.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
  };

  const connectToLive = async () => {
    try {
      setStatus('connecting');
      cleanupAudio(); // Ensure fresh start

      // 1. Output Audio Context (For hearing the model)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      nextStartTimeRef.current = 0;

      // Visualizer Setup
      const analyzer = outputCtx.createAnalyser();
      analyzer.fftSize = 256;
      outputNode.connect(analyzer);
      analyzerRef.current = analyzer;
      drawVisualizer();

      // 2. Input Audio Context (For speaking to the model)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Connect to Backend WebSocket
      // DYNAMICALLY determine the WebSocket URL based on the current page location.
      // This works for localhost (ws://) and Cloud Run/Production (wss://).
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host; // includes port
      const wsUrl = `${protocol}//${host}`;
      
      const ws = new WebSocket(wsUrl); 
      wsRef.current = ws;

      ws.onopen = () => {
         // Connection to backend established
         // Wait for backend to confirm Google connection
      };

      ws.onmessage = async (event) => {
         const message = JSON.parse(event.data);

         if (message.type === 'open') {
             console.log('TREEZ Live Connected via Proxy');
             setIsConnected(true);
             setStatus('connected');
             startMicrophoneStream(inputCtx, stream, ws);
             return;
         }

         // Handle Audio Output from Model
         const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
         if (base64Audio && audioContextRef.current) {
            const ctx = audioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
            );
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
            });
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
         }

         // Handle Interruption
         if (message.serverContent?.interrupted) {
             sourcesRef.current.forEach(src => {
                 try { src.stop(); } catch(e) {}
             });
             sourcesRef.current.clear();
             nextStartTimeRef.current = 0;
         }
      };

      ws.onerror = (e) => {
          console.error("WebSocket Error", e);
          setStatus('error');
      };

      ws.onclose = () => {
          console.log("WebSocket Closed");
          setIsConnected(false);
          setStatus('disconnected');
      };

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const startMicrophoneStream = (ctx: AudioContext, stream: MediaStream, ws: WebSocket) => {
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      
      processor.onaudioprocess = (e) => {
        if (isMuted || ws.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = createBlob(inputData);
        
        // Send to Backend
        ws.send(JSON.stringify({
            type: 'input',
            media: pcmData
        }));
      };
      
      source.connect(processor);
      processor.connect(ctx.destination);
  };

  const disconnect = () => {
    cleanupAudio();
    setIsConnected(false);
    setStatus('disconnected');
  };

  const toggleMute = () => {
      setIsMuted(!isMuted);
  };

  // Visualizer Loop
  const drawVisualizer = () => {
      if (!canvasRef.current || !analyzerRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if(!ctx) return;
      
      const analyzer = analyzerRef.current;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw);
          analyzer.getByteFrequencyData(dataArray);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = 50;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = '#000'; // Inner circle background
          ctx.fill();
          
          // Draw bars around the circle
          const bars = 60;
          const step = (Math.PI * 2) / bars;
          
          for(let i = 0; i < bars; i++) {
              const value = dataArray[i % bufferLength] || 0;
              const barHeight = (value / 255) * 60 + 5; // Scale height
              
              const angle = i * step;
              const x1 = centerX + Math.cos(angle) * radius;
              const y1 = centerY + Math.sin(angle) * radius;
              const x2 = centerX + Math.cos(angle) * (radius + barHeight);
              const y2 = centerY + Math.sin(angle) * (radius + barHeight);
              
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = `hsl(${(i/bars)*360}, 100%, 50%)`;
              ctx.lineWidth = 3;
              ctx.lineCap = 'round';
              ctx.stroke();
          }
      };
      draw();
  };
  
  // Cleanup on unmount
  useEffect(() => {
      return () => cleanupAudio();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-treez-900 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-treez-secondary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-treez-accent/20 rounded-full blur-[80px] animate-blob"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md p-8 glass-panel rounded-3xl shadow-2xl border-t border-white/10">
        
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white tracking-wide">TREEZ Live</h2>
            <p className="text-sm text-gray-400">
                {status === 'disconnected' && "Ready to connect"}
                {status === 'connecting' && "Establishing neural link..."}
                {status === 'connected' && "Listening & Responding"}
                {status === 'error' && "Connection interrupted"}
            </p>
        </div>

        {/* Visualizer Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            <canvas ref={canvasRef} width={300} height={300} className="absolute inset-0 w-full h-full" />
            
            {/* Central Icon */}
            <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-gradient-to-tr from-treez-accent to-treez-secondary shadow-[0_0_30px_rgba(112,0,255,0.6)]' : 'bg-gray-800'}`}>
                {isConnected ? <Activity size={40} className="text-white animate-pulse" /> : <Radio size={40} className="text-gray-500" />}
            </div>
        </div>

        {/* Controls */}
        <div className="flex gap-6 mt-4">
            {!isConnected ? (
                <button 
                    onClick={connectToLive}
                    disabled={status === 'connecting'}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Mic size={28} className="text-black fill-current" />
                </button>
            ) : (
                <>
                   <button 
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border border-white/10 ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                   </button>
                   
                   <button 
                        onClick={disconnect}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-500/30"
                    >
                        <Activity size={28} className="text-white" />
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};