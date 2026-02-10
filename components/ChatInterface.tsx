import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { createChatSession, generateGenesisImage, Attachment } from '../services/genai';
import { usageService } from '../services/usageService';
import { useAuth } from '../contexts/AuthContext';
import { Send, Image as ImageIcon, Loader2, Sparkles, User, Bot, Plus, Mic, Compass, Code, PenTool, Lightbulb, X as XIcon, Brain, Zap, Globe, TrendingUp } from 'lucide-react';
import { LogoMark } from './Logo';
import { ThinkingAnimation } from './ThinkingAnimation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatInterfaceProps {
  onOpenAuth: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatSession, setChatSession] = useState(() => createChatSession());
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [canSend, setCanSend] = useState(true); // Track locally to force re-render
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check limits on mount and updates
  useEffect(() => {
     if (!user) {
         setCanSend(usageService.canSendMessage(true));
     } else {
         setCanSend(true);
     }
  }, [user, messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAttachment({
            name: file.name,
            mimeType: file.type,
            base64: base64.split(',')[1] // Remove data URL prefix
          });
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if ((!text.trim() && !attachment) || isStreaming) return;

    // Check Usage Limits for Guests
    if (!user && !usageService.canSendMessage(false)) {
        onOpenAuth();
        return;
    }

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

    // Increment Usage for Guests
    if (!user) {
        usageService.incrementPromptCount();
    }

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
     
     // Check Usage Limits for Guests
     if (!user && !usageService.canSendMessage(false)) {
        onOpenAuth();
        return;
     }

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

      // Increment Usage for Guests
      if (!user) {
         usageService.incrementPromptCount();
      }

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
          
          const result = await generateGenesisImage(prompt);
          if (result.success && result.imageUrl) {
              setMessages(prev => prev.map(msg => 
                  msg.id === modelMsgId ? {
                      ...msg,
                      text: `Generated image based on: "${prompt}"`,
                      images: [result.imageUrl!],
                      isStreaming: false
                  } : msg
              ));
          } else {
              throw new Error(result.error || "Failed to generate image");
          }
      } catch (error: any) {
          setMessages(prev => prev.map(msg => 
              msg.isStreaming ? { ...msg, text: error.message || "Error generating image", isStreaming: false } : msg
          ));
      } finally {
          setIsStreaming(false);
      }
  };


  const renderWelcomeDashboard = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-treez-indigo/[0.07] rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[400px] h-[400px] bg-treez-accent/[0.04] rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-treez-purple/[0.05] rounded-full blur-[80px] animate-float" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center animate-fade-in">
          {/* Logo Mark */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-treez-indigo/20 rounded-2xl blur-xl scale-150 animate-pulse-slow" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d0d2a] to-[#13132b] border border-white/[0.08] flex items-center justify-center shadow-glow-sm">
                <LogoMark size={40} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </span>
            {user?.displayName && (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
                , {user.displayName.split(' ')[0]}
              </span>
            )}
          </h1>
          <p className="text-gray-400 max-w-lg text-base md:text-lg mb-10 leading-relaxed">
              Explore ideas, generate content, and think deeper with AI.
          </p>

          {/* Suggestion Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-10">
              {[
                  { icon: Brain, text: "Analyze complex data", desc: "Deep insights", color: 'from-violet-500/10 to-purple-500/10', iconColor: 'text-violet-400 group-hover:text-violet-300' },
                  { icon: Code, text: "Debug React code", desc: "Find & fix errors", color: 'from-cyan-500/10 to-blue-500/10', iconColor: 'text-cyan-400 group-hover:text-cyan-300' },
                  { icon: TrendingUp, text: "Brainstorm strategies", desc: "Business growth", color: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-400 group-hover:text-emerald-300' },
                  { icon: PenTool, text: "Write & create content", desc: "Articles & copy", color: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-400 group-hover:text-amber-300' }
              ].map((chip, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(chip.text)}
                    className={`bg-[#0a0a18] hover:bg-[#10101f] border border-white/[0.05] hover:border-white/[0.1] rounded-xl p-4 text-left transition-all duration-300 group hover-lift`}
                    disabled={!canSend}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                      <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${chip.color} transition-all duration-300`}>
                              <chip.icon size={18} className={`transition-colors ${chip.iconColor}`} />
                          </div>
                          <div>
                              <div className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">{chip.text}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">{chip.desc}</div>
                          </div>
                      </div>
                  </button>
              ))}
          </div>
          
          {/* Input Area */}
          <div className="w-full max-w-2xl relative z-20">
            <div className="bg-[#0a0a16] rounded-2xl p-2 border border-white/[0.06] focus-within:border-treez-indigo/30 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.12)] transition-all duration-300 flex items-center gap-2">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                 title="Attach image"
                 disabled={isStreaming || !canSend}
               >
                 <ImageIcon size={20} />
               </button>
               <input
                 type="file"
                 ref={fileInputRef}
                 onChange={handleFileChange}
                 accept="image/*"
                 className="hidden"
                 disabled={!canSend}
               />

               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder={!canSend ? "Daily limit reached. Sign in to continue." : "Ask TREEZ anything..."}
                 className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 focus:ring-0 focus:outline-none text-base px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 disabled={isStreaming || !canSend}
               />

               <button
                 onClick={() => handleSendMessage()}
                 disabled={(!input.trim() && !attachment) || isStreaming || !canSend}
                 className="p-3 bg-gradient-to-r from-treez-indigo to-treez-purple text-white rounded-xl shadow-lg hover:shadow-glow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                 title="Send message"
               >
                 {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
               </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-600">
               <span className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]'}`} />
                  {user ? (user.plan === 'pro' ? "Treez Pro" : "TREEZ Standard") : "Guest Mode"}
               </span>
               {!user && (
                 <>
                   <span className="text-gray-700">·</span>
                   <span>{usageService.getRemainingPrompts()} prompts remaining</span>
                 </>
               )}
            </div>
          </div>
        </div>
    </div>
  );

  const renderActiveChat = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-4xl mx-auto ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''} animate-slide-up`}
          >
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === MessageRole.USER 
                ? 'bg-treez-800' 
                : 'bg-gradient-to-br from-treez-accent to-treez-secondary'
             }`}>
                {msg.role === MessageRole.USER ? (
                    user?.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full object-cover" /> : <User size={16} className="text-gray-400" />
                ) : (
                    <Bot size={16} className="text-white" />
                )}
             </div>
             
             <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
                {msg.images && msg.images.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-white/10 mb-1 max-w-sm">
                        <img src={img} alt="User upload" className="w-full h-auto" />
                    </div>
                ))}
                
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                    msg.role === MessageRole.USER 
                    ? 'bg-[#1f1f3a] text-white rounded-tr-none' 
                    : 'bg-[#13132b] text-gray-100 rounded-tl-none border border-white/5'
                }`}>
                    {msg.role === MessageRole.USER ? (
                        msg.text
                    ) : (
                        <div className="markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({node, inline, className, children, ...props}: any) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <div className="rounded-lg overflow-hidden my-3 border border-white/10 shadow-lg">
                                                <div className="bg-black/30 px-4 py-2 text-xs text-gray-400 border-b border-white/10 flex justify-between items-center">
                                                    <span>{match[1]}</span>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={atomOneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1rem', background: '#0d0d1e' }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded text-treez-accent`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    p: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                                    li: ({children}) => <li className="pl-1">{children}</li>,
                                    h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-white border-b border-white/10 pb-2">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-lg font-bold mb-3 mt-4 text-gray-100">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-base font-bold mb-2 mt-3 text-gray-200">{children}</h3>,
                                    a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-treez-accent hover:underline decoration-treez-accent/50">{children}</a>,
                                    blockquote: ({children}) => <blockquote className="border-l-2 border-treez-accent pl-4 my-3 italic text-gray-400 bg-white/5 py-2 pr-2 rounded-r">{children}</blockquote>,
                                    table: ({children}) => <div className="overflow-x-auto my-4 rounded-lg border border-white/10"><table className="min-w-full divide-y divide-white/10">{children}</table></div>,
                                    thead: ({children}) => <thead className="bg-white/5">{children}</thead>,
                                    tbody: ({children}) => <tbody className="divide-y divide-white/10">{children}</tbody>,
                                    tr: ({children}) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
                                    th: ({children}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{children}</th>,
                                    td: ({children}) => <td className="px-4 py-3 text-sm text-gray-300 whitespace-pre-wrap">{children}</td>,
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    )}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-treez-accent align-middle animate-pulse"></span>}
                </div>
                <span className="text-[10px] text-gray-600 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
             </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex gap-4 max-w-4xl mx-auto animate-fade-in-up">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-treez-accent to-treez-secondary flex items-center justify-center shrink-0 shadow-lg shadow-treez-accent/20">
                    <Bot size={16} className="text-white animate-pulse" />
                 </div>
                 <div className="overflow-hidden rounded-2xl rounded-tl-none">
                    <ThinkingAnimation />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area for Active Chat */}
      <div className="p-4 bg-[#050511]/90 backdrop-blur-xl border-t border-white/[0.04] z-20">
        <div className="max-w-4xl mx-auto bg-[#0a0a16] rounded-2xl px-2 py-2 border border-white/[0.06] focus-within:border-treez-indigo/30 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.12)] transition-all duration-300 flex items-center gap-2">
           
           {attachment && (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-treez-indigo/40 ml-2">
                <img src={`data:${attachment.mimeType};base64,${attachment.base64}`} alt="Attachment" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setAttachment(null)}
                  className="absolute top-0 right-0 bg-black/60 w-full h-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <XIcon size={14} className="text-white" />
                </button>
              </div>
            )}

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                title="Attach image"
                disabled={isStreaming || !canSend}
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={!canSend}
              />

              <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder={!canSend ? "Daily limit reached. Sign in to continue." : "Ask TREEZ anything..."}
               className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 focus:ring-0 focus:outline-none text-base px-2 disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={isStreaming || !canSend}
             />
             
             <button
               onClick={() => handleSendMessage()}
               disabled={(!input.trim() && !attachment) || isStreaming || !canSend}
               className="p-2.5 bg-gradient-to-r from-treez-indigo to-treez-purple text-white rounded-xl shadow-lg hover:shadow-glow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
             >
               {isStreaming ? (
                 <Loader2 size={18} className="animate-spin" />
               ) : (
                 <Send size={18} />
               )}
             </button>
        </div>
        <div className="text-center mt-2">
             <p className="text-[10px] text-gray-600">
                {user ? "End-to-end Encryption · Private Session" : `${usageService.getRemainingPrompts()} free prompts remaining`}
             </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-treez-900">
        {messages.length === 0 ? renderWelcomeDashboard() : renderActiveChat()}
    </div>
  );
};