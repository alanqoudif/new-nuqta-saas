"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            <div className="relative h-10 w-40">
              <Image
                src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/nuqta-logo.png"
                alt="نقطة للذكاء الإصطناعي"
                className="object-contain"
                fill
                priority
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-1 justify-end space-x-reverse">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              onClick={closeMenu}
            >
              الرئيسية
            </Link>
            <Link 
              href="/services" 
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/services') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              onClick={closeMenu}
            >
              خدماتنا
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/about') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              onClick={closeMenu}
            >
              من نحن
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/contact') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              onClick={closeMenu}
            >
              اتصل بنا
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <span className="sr-only">فتح القائمة الرئيسية</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
            onClick={closeMenu}
          >
            الرئيسية
          </Link>
          <Link 
            href="/services" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/services') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
            onClick={closeMenu}
          >
            خدماتنا
          </Link>
          <Link 
            href="/about" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
            onClick={closeMenu}
          >
            من نحن
          </Link>
          <Link 
            href="/contact" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/contact') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
            onClick={closeMenu}
          >
            اتصل بنا
          </Link>
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;