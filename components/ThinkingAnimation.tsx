import React from 'react';

export const ThinkingAnimation = () => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0a16]/50 border border-white/5 backdrop-blur-sm animate-fade-in max-w-fit">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Glowing Core */}
        <div className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] z-10 animate-pulse" />
        
        {/* Spinning Gradient Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-treez-accent border-r-treez-purple opacity-80 animate-spin" style={{ animationDuration: '1.5s' }} />
        
        {/* Counter-Spinning Ring */}
        <div className="absolute inset-1 rounded-full border-[2px] border-transparent border-b-treez-indigo border-l-cyan-300/50 opacity-60 animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
        
        {/* Pulsing Aura */}
        <div className="absolute inset-[-4px] bg-gradient-to-r from-treez-accent/20 to-treez-purple/20 rounded-full blur-md animate-pulse" />
      </div>
      
      <div className="flex flex-col justify-center h-10">
        <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 animate-pulse">
            Thinking...
        </span>
        <div className="flex gap-1 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-treez-accent animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-treez-indigo animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
