"use client";

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${fullWidth ? 'w-full' : ''}`}>
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`input ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
              fullWidth ? 'w-full' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 