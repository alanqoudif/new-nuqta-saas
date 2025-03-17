"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'ghost' | 'danger' | 'destructive' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-300 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600',
    outline: 'bg-transparent border border-gray-700 text-white hover:bg-gray-800 active:bg-gray-700',
    gradient: 'bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white hover:from-primary-700 hover:via-secondary-700 hover:to-accent-700',
    ghost: 'bg-transparent text-white hover:bg-gray-800 active:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};

export default Button; 