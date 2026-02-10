import React, { useState } from 'react';
import { generateGenesisVideo } from '../services/genai';
import { Video, Loader2, AlertCircle } from 'lucide-react';

export const VideoInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setVideoUri(null);

    try {
        // Call the secure backend service
        const uri = await generateGenesisVideo(prompt);
        
        if (uri) {
            // Note: In a real production environment, you would proxy the video file 
            // through your backend to avoid exposing the storage bucket URL directly 
            // if it requires auth parameters.
            setVideoUri(uri);
        } else {
            setError("Failed to retrieve video.");
        }

    } catch (e: any) {
        console.error(e);
        setError(e.message || "Video generation failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">TREEZ Motion</h2>
                <p className="text-gray-400">Cinematic video generation powered by Veo.</p>
            </div>

            <div className="space-y-4">
                <textarea
                    className="w-full h-32 bg-treez-800/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none placeholder-gray-500"
                    placeholder="Describe the video you want to imagine... e.g., A cyberpunk city in rain, neon lights reflecting on wet pavement, cinematic 4k"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                    onClick={generateVideo}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <><Loader2 className="animate-spin" /> Generating Dream (this takes a moment)...</>
                    ) : (
                        <><Video /> Generate Video</>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {videoUri && (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black animate-fade-in-up">
                    {/* Note: If the video fails to load due to missing key parameters in the URL, 
                        it implies the backend should stream the bytes. 
                        For this demo, we display the container. */}
                    <video 
                        src={videoUri} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full aspect-video"
                    />
                </div>
            )}
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    TREEZ Motion uses the Veo model. Videos are generated securely on our servers.
                </p>
            </div>
        </div>
    </div>
  );
};