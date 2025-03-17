import React from 'react';
import * as FiIcons from 'react-icons/fi';

interface DynamicIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

/**
 * مكون لعرض أيقونة بشكل ديناميكي من مكتبة react-icons/fi
 */
const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, className = '', size }) => {
  // التحقق من وجود الأيقونة في مكتبة FiIcons
  const IconComponent = FiIcons[iconName as keyof typeof FiIcons];

  if (!IconComponent) {
    console.warn(`Icon ${iconName} not found in react-icons/fi`);
    // إرجاع أيقونة افتراضية في حالة عدم وجود الأيقونة المطلوبة
    return <FiIcons.FiHelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon; 