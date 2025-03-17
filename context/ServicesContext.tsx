'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServicesService, Service } from '@/lib/services-service';

interface ServicesContextType {
  services: Service[];
  isLoading: boolean;
  refreshServices: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const activeServices = await ServicesService.getActiveServices();
      setServices(activeServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل الخدمات عند تهيئة السياق
  useEffect(() => {
    loadServices();
  }, []);

  // دالة لإعادة تحميل الخدمات (تستخدم عند إضافة أو تعديل أو حذف خدمة)
  const refreshServices = async () => {
    await loadServices();
  };

  return (
    <ServicesContext.Provider value={{ services, isLoading, refreshServices }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): ServicesContextType => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}; 