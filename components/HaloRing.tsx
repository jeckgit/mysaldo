import React from 'react';
import { motion } from 'framer-motion';

interface HaloRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string; // Hex color
  trackColor?: string;
  children?: React.ReactNode;
}

export const HaloRing: React.FC<HaloRingProps> = ({ 
  progress, 
  size = 280, 
  strokeWidth = 20, 
  color = '#C084FC', 
  trackColor = '#F1F5F9', // slate-100
  children 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 1) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      
      <svg width={size} height={size} className="relative z-10 rotate-[-90deg]">
        {/* Track */}
        <circle
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <motion.circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
          }}
          animate={{
            strokeDashoffset: strokeDashoffset,
            stroke: color
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};