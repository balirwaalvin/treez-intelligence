import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { createChatSession, generateGenesisImage, Attachment } from '../services/genai';
import { Send, Image as ImageIcon, Loader2, Sparkles, User, Bot, Plus, Mic, Compass, Code, PenTool, Lightbulb, X as XIcon } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatSession, setChatSession] = useState(() => createChatSession());
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string = input) => {
    if ((!text.trim() && !attachment) || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: text,
      timestamp: new Date(),
      images: attachment ? [`data:${attachment.mimeType};base64,${attachment.base64}`] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentAttachment = attachment;
    setAttachment(null); // Clear attachment immediately
    setIsStreaming(true);

    try {
      // Create a placeholder for the model response
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: modelMsgId,
          role: MessageRole.MODEL,
          text: '',
          timestamp: new Date(),
          isStreaming: true
        }
      ]);

      const result = await chatSession.sendMessageStream({ 
        message: userMsg.text,
        attachment: currentAttachment || undefined
      });
      
      let fullText = '';
      for await (const chunk of result) {
        const text = chunk.text; // Access text directly
        if (text) {
           fullText += text;
           setMessages(prev => prev.map(msg => 
              msg.id === modelMsgId 
                ? { ...msg, text: fullText } 
                : msg
           ));
        }
      }
      
      setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
          ...prev, 
          { 
              id: Date.now().toString(), 
              role: MessageRole.SYSTEM, 
              text: "An error occurred connecting to Treez. Please try again.", 
              timestamp: new Date() 
          }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleImageGeneration = async (promptText: string = input) => {
     if (!promptText.trim() || isStreaming) return;
     
     const prompt = promptText;
     setInput('');
     setAttachment(null);
     
     const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        text: `Generate image: ${prompt}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsStreaming(true);

      try {
          // Placeholder
          const modelMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, {
              id: modelMsgId,
              role: MessageRole.MODEL,
              text: 'Visualizing concept...',
              timestamp: new Date(),
              isStreaming: true
          }]);

          // Use the secure backend service
          const imageUrl = await generateGenesisImage(prompt);

          if (imageUrl) {
              setMessages(prev => prev.map(msg => 
                  msg.id === modelMsgId ? { ...msg, text: 'Here is your generated image.', images: [imageUrl], isStreaming: false } : msg
              ));
          } else {
               throw new Error("No image returned");
          }

      } catch (e) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.SYSTEM, text: "Image generation failed.", timestamp: new Date() }]);
      } finally {
          setIsStreaming(false);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip the data:image/xyz;base64, part
        const base64Data = base64String.split(',')[1];
        setAttachment({
          base64: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Suggestion Chip Component ---
  const SuggestionChip = ({ icon: Icon, label, prompt }: { icon: any, label: string, prompt: string }) => (
    <button 
      onClick={() => handleSendMessage(prompt)}
      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-treez-accent/30 transition-all duration-300 group"
    >
      <div className="p-1.5 rounded-full bg-treez-900/50 group-hover:bg-treez-accent/20 transition-colors">
        <Icon size={16} className="text-treez-accent" />
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>
    </button>
  );

  // --- Render Functions ---

  const renderWelcomeDashboard = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in relative z-10">
        
        {/* Decorative Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-treez-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow pointer-events-none"></div>

        {/* Greetings */}
        <div className="text-left w-full max-w-3xl mb-10 space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-treez-accent to-treez-secondary">Treez</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-400">The beginning of something new.</h2>
        </div>

        {/* Central Input Capsule */}
        <div className="w-full max-w-3xl relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-treez-accent to-treez-secondary rounded-[2rem] opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
            <div className="relative bg-[#0a0a16] rounded-[1.8rem] p-4 flex flex-col gap-2 shadow-2xl input-glow border border-white/10 transition-all duration-300">
                
                {attachment && (
                  <div className="relative w-20 h-20 mb-2 rounded-lg overflow-hidden border border-treez-accent/50 group-attachment">
                    <img src={`data:${attachment.mimeType};base64,${attachment.base64}`} alt="Attachment" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setAttachment(null)}
                      className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 hover:bg-red-500/80 transition-colors"
                    >
                      <XIcon size={14} className="text-white" />
                    </button>
                  </div>
                )}

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Message Treez..."
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-lg resize-none min-h-[60px] max-h-[200px]"
                />
                
                <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileSelect} 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${attachment ? 'text-treez-accent' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Plus size={20} />
                        </button>
                        <button 
                            onClick={() => handleImageGeneration()} 
                            disabled={!input.trim()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-treez-accent transition-colors text-sm font-medium"
                        >
                            <ImageIcon size={18} />
                            <span>Create image</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <Mic size={20} />
                        </button>
                        <button 
                             onClick={() => handleSendMessage()}
                             disabled={(!input.trim() && !attachment)}
                             className={`p-2 rounded-full transition-all duration-300 ${input.trim() || attachment ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-gray-500'}`}
                        >
                            <Send size={18} className={(input.trim() || attachment) ? "translate-x-0.5 translate-y-0.5" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions / Suggestions */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <SuggestionChip icon={PenTool} label="Creative Writing" prompt="Write a short sci-fi story about a robot discovering emotions." />
            <SuggestionChip icon={Code} label="Code Assistant" prompt="Write a Python script to visualize stock market data." />
            <SuggestionChip icon={Lightbulb} label="Brainstorm" prompt="Give me 5 unique ideas for a mobile app start-up." />
            <SuggestionChip icon={Compass} label="Plan a Trip" prompt="Plan a 3-day itinerary for Tokyo." />
        </div>
    </div>
  );

  const renderActiveChat = () => (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pt-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === MessageRole.USER ? 'bg-treez-secondary' : 
              msg.role === MessageRole.SYSTEM ? 'bg-red-500' : 'bg-gradient-to-br from-treez-accent to-treez-secondary'
            }`}>
               {msg.role === MessageRole.USER ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
              msg.role === MessageRole.USER 
                ? 'bg-[#3a7bd5]/20 border border-[#3a7bd5]/30' 
                : 'bg-[#13132b] border border-white/5'
            }`}>
              {msg.role === MessageRole.MODEL && <div className="text-xs text-treez-accent mb-2 font-semibold tracking-wider opacity-80">TREEZ</div>}
              
              {/* Render Attached Images for User Messages */}
              {msg.images && msg.role === MessageRole.USER && msg.images.map((img, idx) => (
                  <div key={idx} className="mb-3 rounded-lg overflow-hidden border border-white/20 max-w-xs">
                      <img src={img} alt="User Attachment" className="w-full h-auto" />
                  </div>
              ))}

              <div className="prose prose-invert prose-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-100">{msg.text}</p>
              </div>
              
              {/* Render Generated Images for Model Messages */}
              {msg.images && msg.role === MessageRole.MODEL && msg.images.map((img, idx) => (
                  <div key={idx} className="mt-3 rounded-xl overflow-hidden shadow-lg border border-white/10">
                      <img src={img} alt="Generated" className="w-full h-auto" />
                  </div>
              ))}
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-treez-accent to-treez-secondary flex items-center justify-center shrink-0">
                    <Bot size={20} className="text-white animate-pulse" />
                 </div>
                 <div className="bg-[#13132b] border border-white/5 rounded-2xl p-4 flex items-center">
                    <Loader2 className="animate-spin text-treez-accent" size={20} />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 bg-treez-900/90 backdrop-blur-md border-t border-white/5 z-20">
        <div className="max-w-4xl mx-auto bg-[#0a0a16] rounded-[24px] px-4 py-2 border border-white/10 focus-within:border-treez-accent/50 focus-within:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all flex flex-col">
           
           {attachment && (
              <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden border border-treez-accent/50">
                <img src={`data:${attachment.mimeType};base64,${attachment.base64}`} alt="Attachment" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setAttachment(null)}
                  className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 hover:bg-red-500/80 transition-colors"
                >
                  <XIcon size={12} className="text-white" />
                </button>
              </div>
            )}

           <div className="flex items-center gap-2">
             <button 
               onClick={() => handleImageGeneration()}
               disabled={isStreaming || !input.trim()}
               className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-treez-accent transition-colors"
             >
               <ImageIcon size={20} />
             </button>
             
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
              />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors ${attachment ? 'text-treez-accent' : 'hover:text-white'}`}
             >
                <Plus size={20} />
             </button>

             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Message Treez..."
               className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400"
             />
             
             <button
               onClick={() => handleSendMessage()}
               disabled={isStreaming || (!input.trim() && !attachment)}
               className={`p-2 rounded-full transition-all ${
                 input.trim() || attachment
                   ? 'bg-white text-black hover:bg-gray-200' 
                   : 'bg-white/5 text-gray-500 cursor-not-allowed'
               }`}
             >
               {isStreaming ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
             </button>
           </div>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-500">Treez can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-treez-900">
        {/* Render Dashboard if no messages, otherwise render chat */}
        {messages.length === 0 ? renderWelcomeDashboard() : renderActiveChat()}
    </div>
  );
};