import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and Brief */}
          <div className="col-span-1 md:col-span-1">
            <div className="relative h-12 w-48 mb-4">
              <Image
                src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/nuqta-logo-white.png"
                alt="نقطة للذكاء الإصطناعي"
                className="object-contain"
                fill
              />
            </div>
            <p className="text-gray-400 text-sm mt-4">
              نقدم حلول ذكاء اصطناعي متقدمة ومبتكرة لمساعدة الشركات والأفراد على تحسين إنتاجيتهم وتطوير أعمالهم.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-500 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-primary-500 transition-colors">
                  خدماتنا
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-500 transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-500 transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <FiMail className="text-primary-500" />
                <a href="mailto:info@nuqta.ai" className="text-gray-400 hover:text-primary-500 transition-colors">
                  info@nuqta.ai
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-primary-500" />
                <a href="tel:+9661234567890" className="text-gray-400 hover:text-primary-500 transition-colors">
                  +966 12 345 6789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin className="text-primary-500" />
                <span className="text-gray-400">الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">تابعنا</h3>
            <div className="flex items-center space-x-4 space-x-reverse">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiTwitter className="h-6 w-6" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiFacebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiInstagram className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>جميع الحقوق محفوظة &copy; {currentYear} نقطة للذكاء الاصطناعي</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;