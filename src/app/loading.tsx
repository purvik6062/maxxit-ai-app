import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 z-50">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-950 border-dashed animate-spin"></div>
        
        {/* Middle ring */}
        <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-blue-300 dark:border-blue-800 border-dashed animate-[spin_3s_linear_infinite]"></div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-blue-500 dark:border-blue-600 border-dashed animate-[spin_2s_linear_infinite]"></div>
        
        {/* Center dot - adjusted position */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 animate-pulse"></div>
      </div>
      
      {/* Loading text - increased size */}
      <div className="absolute mt-24 text-base md:text-lg font-medium text-blue-600 dark:text-blue-400">
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite]">L</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.1s]">o</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.2s]">a</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.3s]">d</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.4s]">i</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.5s]">n</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.6s]">g</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.7s]">.</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.8s]">.</span>
        <span className="inline-block animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:0.9s]">.</span>
      </div>
    </div>
  );
}