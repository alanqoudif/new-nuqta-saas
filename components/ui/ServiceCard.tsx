import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import Card from './Card';
import DynamicIcon from './DynamicIcon';
import { Service } from '@/lib/services-service';

interface ServiceCardProps {
  service: Service;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, className = '' }) => {
  const isExternalLink = service.url.startsWith('http');

  const CardContent = () => (
    <Card className={`p-6 hover:border-${service.color}-500 transition-all duration-300 h-full ${className}`}>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className={`p-3 bg-${service.color}-900/30 rounded-lg w-fit`}>
            <DynamicIcon 
              iconName={service.icon_name} 
              className={`text-2xl text-${service.color}-500`} 
            />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{service.name}</h3>
        <p className="text-gray-400 mb-4 flex-grow">
          {service.description}
        </p>
        <div className={`mt-auto flex items-center text-${service.color}-400 text-sm`}>
          {service.is_coming_soon ? 'قادم قريباً' : 'استكشف الآن'} <FiArrowRight className="mr-1" />
        </div>
      </div>
    </Card>
  );

  if (isExternalLink) {
    return (
      <a href={service.url} target="_blank" rel="noopener noreferrer">
        <CardContent />
      </a>
    );
  }

  return (
    <Link href={service.url}>
      <CardContent />
    </Link>
  );
};

export default ServiceCard; 