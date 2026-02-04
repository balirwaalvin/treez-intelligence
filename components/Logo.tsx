import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="treezGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" />
            <stop offset="100%" stopColor="#7000ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Abstract Tree / Circuit 'T' Shape */}
        <path 
          d="M 50 90 L 50 30 M 50 30 L 20 30 M 50 30 L 80 30" 
          stroke="url(#treezGrad)" 
          strokeWidth="8" 
          strokeLinecap="round"
          filter="url(#glow)"
        >
             <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Nodes */}
        <circle cx="50" cy="90" r="4" fill="#7000ff" filter="url(#glow)" />
        <circle cx="20" cy="30" r="4" fill="#00f2ff" filter="url(#glow)" />
        <circle cx="80" cy="30" r="4" fill="#00f2ff" filter="url(#glow)" />
        <circle cx="50" cy="50" r="4" fill="white" filter="url(#glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Data flowing up */}
        <circle cx="50" cy="90" r="2" fill="white">
            <animate attributeName="cy" values="90;30" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
        </circle>

      </svg>
      <span className="text-xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
        TREEZ
      </span>
    </div>
  );
};