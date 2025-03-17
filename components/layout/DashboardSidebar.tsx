"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiSettings, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX,
  FiUsers,
  FiEdit,
  FiMonitor
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useServices } from '@/context/ServicesContext';
import DynamicIcon from '@/components/ui/DynamicIcon';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick?: () => void;
  external?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  text, 
  isActive,
  onClick,
  external = false
}) => {
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${
        isActive
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
      onClick={onClick}
    >
      <span className="text-xl ml-3">{icon}</span>
      <span>{text}</span>
    </a>
  ) : (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${
        isActive
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
      onClick={onClick}
    >
      <span className="text-xl ml-3">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const DashboardSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { services, isLoading } = useServices();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isAdmin = user?.role === 'admin';

  // إنشاء روابط الخدمات ديناميكياً
  const serviceLinks = services
    .filter(service => service.is_active && !service.is_coming_soon)
    .map(service => ({
      href: service.url,
      icon: <DynamicIcon iconName={service.icon_name} />,
      text: service.name,
      external: service.url.startsWith('http')
    }));

  // الروابط الثابتة للوحة التحكم
  const dashboardLinks = [
    { href: '/dashboard', icon: <FiHome />, text: 'الرئيسية' },
    ...serviceLinks,
    { href: '/dashboard/settings', icon: <FiSettings />, text: 'الإعدادات' },
  ];

  const adminLinks = [
    { href: '/admin', icon: <FiUser />, text: 'لوحة الإدارة' },
    { href: '/admin/users', icon: <FiUsers />, text: 'المستخدمين' },
    { href: '/admin/services', icon: <DynamicIcon iconName="FiServer" />, text: 'إدارة الخدمات' },
    { href: '/admin/showcase', icon: <FiMonitor />, text: 'عرض الخدمات' },
    { href: '/admin/social-media', icon: <DynamicIcon iconName="FiShare2" />, text: 'وسائل التواصل' },
    { href: '/admin/privateai-requests', icon: <DynamicIcon iconName="FiServer" />, text: 'طلبات الذكاء الخاص' },
    { href: '/admin/early-access-requests', icon: <FiUsers />, text: 'طلبات الوصول المبكر' },
    { href: '/admin/contact-messages', icon: <DynamicIcon iconName="FiMessageSquare" />, text: 'رسائل التواصل' },
    { href: '/admin/blog', icon: <FiEdit />, text: 'إدارة المدونة' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg text-gray-300 hover:text-white"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
        initial={false}
        dir="rtl"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center">
              <Image 
                src="/nuqtalogo.webp" 
                alt="نقطة للذكاء الاصطناعي" 
                width={30} 
                height={30} 
                className="h-auto ml-2"
              />
              <span className="text-xl font-bold gradient-text">نقطة الذكاء</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {dashboardLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    text={link.text}
                    isActive={pathname === link.href}
                    onClick={closeSidebar}
                    external={link.external}
                  />
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="mt-8 pt-4 border-t border-gray-800">
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  الإدارة
                </h3>
                <div className="space-y-1">
                  {adminLinks.map((link) => (
                    <SidebarLink
                      key={link.href}
                      href={link.href}
                      icon={link.icon}
                      text={link.text}
                      isActive={pathname.startsWith(link.href)}
                      onClick={closeSidebar}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center ml-3">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'م'}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'المستخدم'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'مدير' : 'مستخدم'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                closeSidebar();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-300"
            >
              <FiLogOut className="ml-3" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar; 