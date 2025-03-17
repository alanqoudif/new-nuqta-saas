import React, { ChangeEvent, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col', fullWidth && 'w-full', className)}>
      {label && (
        <label className="mb-1 text-sm text-gray-400">
          {label}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        className={cn(
          'bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-500',
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select; 