import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string; iconOnly?: boolean }> = ({ size = 40, className = "", iconOnly = false }) => {
  const id = React.useId().replace(/:/g, '');
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id={`treezGrad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          
          {/* Reverse Gradient */}
          <linearGradient id={`treezGrad2-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          
          {/* Glow Filter */}
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Soft Glow for background circle */}
          <filter id={`softGlow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
            </feMerge>
          </filter>
          
          {/* Radial gradient for backdrop */}
          <radialGradient id={`bgGlow-${id}`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#050511" stopOpacity="0"/>
          </radialGradient>
        </defs>
        
        {/* Subtle background glow */}
        <circle cx="60" cy="55" r="50" fill={`url(#bgGlow-${id})`} />
        
        {/* === TREE TRUNK === */}
        <path 
          d="M 60 100 L 60 45" 
          stroke={`url(#treezGrad-${id})`}
          strokeWidth="5" 
          strokeLinecap="round"
          filter={`url(#glow-${id})`}
        >
          <animate attributeName="stroke-opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* === MAIN BRANCHES === */}
        {/* Left Branch */}
        <path 
          d="M 60 55 C 50 50, 35 42, 25 30" 
          stroke={`url(#treezGrad2-${id})`}
          strokeWidth="3.5" 
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${id})`}
        />
        {/* Right Branch */}
        <path 
          d="M 60 55 C 70 50, 85 42, 95 30" 
          stroke={`url(#treezGrad-${id})`}
          strokeWidth="3.5" 
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${id})`}
        />
        {/* Center Branch */}
        <path 
          d="M 60 45 L 60 20" 
          stroke={`url(#treezGrad-${id})`}
          strokeWidth="3.5" 
          strokeLinecap="round"
          filter={`url(#glow-${id})`}
        />
        
        {/* === SUB-BRANCHES (neural pathways) === */}
        {/* Left sub-branch */}
        <path 
          d="M 38 40 C 33 35, 22 28, 15 20" 
          stroke="#6366F1"
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* Right sub-branch */}
        <path 
          d="M 82 40 C 87 35, 98 28, 105 20" 
          stroke="#00D9FF"
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* Left inner sub-branch */}
        <path 
          d="M 42 44 C 38 38, 38 30, 40 22" 
          stroke="#818CF8"
          strokeWidth="1.5" 
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Right inner sub-branch */}
        <path 
          d="M 78 44 C 82 38, 82 30, 80 22" 
          stroke="#22D3EE"
          strokeWidth="1.5" 
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        
        {/* === ROOT SYSTEM (subtle) === */}
        <path 
          d="M 60 100 C 55 105, 42 108, 35 112" 
          stroke="#6366F1"
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path 
          d="M 60 100 C 65 105, 78 108, 85 112" 
          stroke="#00D9FF"
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        
        {/* === NEURAL NODES (glowing dots) === */}
        {/* Top center node */}
        <circle cx="60" cy="18" r="4" fill="#A855F7" filter={`url(#glow-${id})`}>
          <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Left tip node */}
        <circle cx="25" cy="30" r="3.5" fill="#00D9FF" filter={`url(#glow-${id})`}>
          <animate attributeName="r" values="3;4;3" dur="2.5s" repeatCount="indefinite" />
        </circle>
        {/* Right tip node */}
        <circle cx="95" cy="30" r="3.5" fill="#00D9FF" filter={`url(#glow-${id})`}>
          <animate attributeName="r" values="3;4;3" dur="2.3s" repeatCount="indefinite" />
        </circle>
        {/* Far left sub node */}
        <circle cx="15" cy="20" r="2.5" fill="#818CF8" filter={`url(#glow-${id})`}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Far right sub node */}
        <circle cx="105" cy="20" r="2.5" fill="#22D3EE" filter={`url(#glow-${id})`}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
        </circle>
        {/* Inner left sub node */}
        <circle cx="40" cy="22" r="2" fill="#818CF8" opacity="0.7">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.2s" repeatCount="indefinite" />
        </circle>
        {/* Inner right sub node */}
        <circle cx="80" cy="22" r="2" fill="#22D3EE" opacity="0.7">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
        
        {/* Junction node (center) */}
        <circle cx="60" cy="55" r="4" fill="white" filter={`url(#glow-${id})`}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Mid-trunk node */}
        <circle cx="60" cy="75" r="2.5" fill="#6366F1" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.6s" repeatCount="indefinite" />
        </circle>
        {/* Root node */}
        <circle cx="60" cy="100" r="3" fill="#A855F7" filter={`url(#glow-${id})`}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        
        {/* === DATA PARTICLES flowing up === */}
        <circle r="1.5" fill="#00D9FF" opacity="0.9">
          <animateMotion path="M 60,100 L 60,55 C 50,50 35,42 25,30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle r="1.5" fill="#A855F7" opacity="0.9">
          <animateMotion path="M 60,100 L 60,55 C 70,50 85,42 95,30" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle r="1" fill="white" opacity="0.8">
          <animateMotion path="M 60,100 L 60,18" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.1" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </svg>
      
      {!iconOnly && (
        <div className="flex flex-col justify-center h-full">
          <span className="text-2xl font-bold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 leading-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            TREEZ
          </span>
        </div>
      )}
    </div>
  );
};

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => {
  return <Logo size={size} className={className} iconOnly={true} />;
};