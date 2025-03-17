import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'default', 
  icon,
  className 
}) => {
  const colorClasses = {
    default: 'bg-gray-700/50 text-gray-300',
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClasses[color],
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge; 