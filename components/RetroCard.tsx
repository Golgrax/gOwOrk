import React, { ReactNode } from 'react';

interface RetroCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

export const RetroCard: React.FC<RetroCardProps> = ({ children, title, className = '', variant = 'default' }) => {
  const borderColor = variant === 'danger' ? 'border-retro-red' : variant === 'success' ? 'border-retro-green' : 'border-black';
  // Updated bg to be semi-transparent
  const bgClass = variant === 'danger' ? 'bg-red-900/80 text-white' : 'bg-white/90 backdrop-blur-sm';

  return (
    <div className={`relative ${bgClass} border-4 ${borderColor} p-4 pixel-shadow ${className}`}>
      {title && (
        <div className="absolute -top-4 left-4 bg-retro-gold px-2 border-2 border-black font-bold uppercase tracking-wider text-sm pixel-shadow text-black">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};