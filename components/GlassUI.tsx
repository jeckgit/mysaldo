import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'glass' | 'featured';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'glass',
  ...props 
}) => {
  let variantStyles = "";
  
  // Base styles for that "liquid" feel: heavy blur, subtle border, smooth rounding
  const baseStyles = "relative overflow-hidden backdrop-blur-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

  if (variant === 'glass') {
    // Standard liquid glass: translucent white
    variantStyles = `${baseStyles} bg-gradient-to-br from-white/60 to-white/30`;
  } else if (variant === 'white') {
    // "Milky" glass: more opaque but still blurred
    variantStyles = `${baseStyles} bg-white/80 border-white/60`;
  } else if (variant === 'featured') {
    // Colorful liquid glass for hero cards
    variantStyles = "relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-[#FFE4E6]/80 to-[#E9D5FF]/80 border border-white/50 shadow-[0_10px_40px_-10px_rgba(192,132,252,0.3)]";
  }

  return (
    <motion.div
      className={`rounded-[2.5rem] ${variantStyles} ${className}`}
      {...props}
    >
      {/* The "Liquid Shine" overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-60 pointer-events-none" />
      
      {/* Content wrapper to ensure z-index above the shine */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative px-6 py-4 rounded-[1.5rem] font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 overflow-hidden backdrop-blur-xl";
  
  let variantStyles = "";
  if (variant === 'primary') {
    variantStyles = "bg-black/90 text-white shadow-lg shadow-purple-900/20 hover:bg-black";
  } else if (variant === 'secondary') {
    variantStyles = "bg-white/50 border border-white/60 text-slate-700 hover:bg-white/70";
  } else if (variant === 'ghost') {
    variantStyles = "bg-transparent text-slate-600 hover:bg-white/30";
  } else if (variant === 'danger') {
    variantStyles = "bg-red-50/50 text-red-500 border border-red-100/50 hover:bg-red-100/50";
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const BackgroundMesh: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F1F5F9]">
      {/* Increased saturation and opacity for better 'bleed' through the glass */}
      
      {/* Top Pink/Rose Blob */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] rounded-full bg-[#FBCFE8] blur-[100px] opacity-80 animate-float" />
      
      {/* Center Purple Blob */}
      <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#DDD6FE] blur-[120px] opacity-80 animate-float" style={{ animationDelay: '3s' }} />
      
      {/* Bottom Teal/Blue Blob */}
      <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] rounded-full bg-[#BAE6FD] blur-[100px] opacity-60 animate-float" style={{ animationDelay: '5s' }} />
    </div>
  );
};
