"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import Button from '../ui/Button';
import { supabase } from '@/lib/supabase';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sessionStatus, setSessionStatus] = useState<string>('checking');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // التحقق من حالة الجلسة عند تحميل المكون
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSessionStatus(session ? 'active' : 'none');
        setUserEmail(session?.user?.email || null);
        
        console.log('Navbar session check:', session ? 'Active' : 'None', 'User:', session?.user?.email || 'None');
      } catch (error) {
        console.error('Error checking session in Navbar:', error);
        setSessionStatus('error');
      }
    };
    
    checkSession();
    
    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in Navbar:', event, session?.user?.email || 'None');
      setSessionStatus(session ? 'active' : 'none');
      setUserEmail(session?.user?.email || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'خدماتنا', href: '/#services' },
    { name: 'من نحن', href: '/#about' },
    { name: 'اتصل بنا', href: '/#contact' },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return pathname === '/' && path.startsWith('/#');
    }
    return pathname === path;
  };

  // تحديد ما إذا كان يجب عرض أزرار المصادقة
  const showAuthButtons = user || sessionStatus === 'active';
  
  // معلومات المستخدم للعرض
  const displayName = user?.full_name || userEmail || 'المستخدم';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/nuqtalogo.webp" 
              alt="نقطة للذكاء الاصطناعي" 
              width={40} 
              height={40} 
              className="h-auto"
            />
            <span className="text-2xl font-bold gradient-text mr-2">نقطة للذكاء الاصطناعي</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-0 gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {showAuthButtons ? (
              <>
                <div className="text-sm text-gray-300 ml-2">
                  مرحباً، {displayName}
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    لوحة التحكم
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={signOut}>
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="gradient" size="sm">
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMenu}
            aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="container-custom py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive(link.href)
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                ))}
                {showAuthButtons ? (
                  <>
                    <div className="text-sm text-gray-300 flex items-center">
                      <FiUser className="mr-2" />
                      {displayName}
                    </div>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-gray-400 hover:text-white"
                      onClick={closeMenu}
                    >
                      لوحة التحكم
                    </Link>
                    <button
                      className="text-sm font-medium text-gray-400 hover:text-white text-right"
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm font-medium text-gray-400 hover:text-white"
                      onClick={closeMenu}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="text-sm font-medium text-gray-400 hover:text-white"
                      onClick={closeMenu}
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Debug Info - يظهر فقط في وضع التطوير */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black/80 text-white text-xs p-1 z-50">
          Session: {sessionStatus}, User: {userEmail || 'None'}
        </div>
      )}
    </header>
  );
};

export default Navbar; 