import React from 'react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  href,
  className = '',
  onClick,
  hoverEffect = true
}) => {
  const cardContent = (
    <>
      {(icon || title) && (
        <div className="flex items-center mb-4">
          {icon && <div className="text-primary-600 text-xl mr-2">{icon}</div>}
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
        </div>
      )}
      <div>{children}</div>
    </>
  );

  const baseClasses = "bg-white rounded-xl shadow-md p-6";
  const hoverClasses = hoverEffect ? "hover:shadow-lg transition-shadow transform hover:-translate-y-1 transition-transform duration-300" : "";
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {cardContent}
    </div>
  );
};

export default Card;