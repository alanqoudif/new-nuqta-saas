import React from 'react';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 