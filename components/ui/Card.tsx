"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
  gradient = false,
  glass = false,
}) => {
  const baseClasses = 'rounded-xl shadow-xl overflow-hidden transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-[1.02]' : '';
  const gradientClasses = gradient ? 'border border-transparent bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20' : 'border border-gray-800';
  const glassClasses = glass ? 'bg-gray-900/70 backdrop-blur-lg' : 'bg-gray-900';
  
  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${glassClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Card; 