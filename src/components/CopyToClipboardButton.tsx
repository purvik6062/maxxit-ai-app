"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyToClipboardButtonProps {
  textToCopy: string;
  className?: string;
}

export function CopyToClipboardButton({ 
  textToCopy, 
  className = "" 
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 hover:bg-[#2a374e] bg-[#1a2535] rounded cursor-pointer ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4 text-blue-400" />
      )}
    </button>
  );
} 