"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiInstagram } from 'react-icons/fi';
import { SocialMediaService, SocialMedia } from '@/lib/social-media-service';
import * as FiIcons from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل روابط وسائل التواصل الاجتماعي من قاعدة البيانات
  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        console.log('Footer: Loading social media links...');
        const activeSocialMedia = await SocialMediaService.getActiveSocialMedia();
        
        if (activeSocialMedia && activeSocialMedia.length > 0) {
          console.log('Footer: Social media links loaded successfully:', activeSocialMedia);
          setSocialLinks(activeSocialMedia);
        } else {
          console.log('Footer: No active social media links found, using default links');
          // استخدام روابط افتراضية في حالة عدم وجود روابط في قاعدة البيانات
          setSocialLinks([
            { 
              id: '1', 
              platform: 'GitHub', 
              url: 'https://github.com/nuqta-ai', 
              icon_name: 'FiGithub', 
              is_active: true, 
              display_order: 1,
              created_at: '',
              updated_at: ''
            },
            { 
              id: '2', 
              platform: 'Twitter', 
              url: 'https://twitter.com/nuqta_ai', 
              icon_name: 'FiTwitter', 
              is_active: true, 
              display_order: 2,
              created_at: '',
              updated_at: ''
            },
            { 
              id: '3', 
              platform: 'LinkedIn', 
              url: 'https://linkedin.com/company/nuqtai', 
              icon_name: 'FiLinkedin', 
              is_active: true, 
              display_order: 3,
              created_at: '',
              updated_at: ''
            },
            { 
              id: '4', 
              platform: 'Email', 
              url: 'mailto:info@nuqtai.com', 
              icon_name: 'FiMail', 
              is_active: true, 
              display_order: 4,
              created_at: '',
              updated_at: ''
            }
          ]);
        }
      } catch (error) {
        console.error('Footer: Error loading social media links:', error);
        // استخدام روابط افتراضية في حالة حدوث خطأ
        setSocialLinks([
          { 
            id: '1', 
            platform: 'GitHub', 
            url: 'https://github.com/nuqta-ai', 
            icon_name: 'FiGithub', 
            is_active: true, 
            display_order: 1,
            created_at: '',
            updated_at: ''
          },
          { 
            id: '2', 
            platform: 'Twitter', 
            url: 'https://twitter.com/nuqta_ai', 
            icon_name: 'FiTwitter', 
            is_active: true, 
            display_order: 2,
            created_at: '',
            updated_at: ''
          },
          { 
            id: '3', 
            platform: 'LinkedIn', 
            url: 'https://linkedin.com/company/nuqtai', 
            icon_name: 'FiLinkedin', 
            is_active: true, 
            display_order: 3,
            created_at: '',
            updated_at: ''
          },
          { 
            id: '4', 
            platform: 'Email', 
            url: 'mailto:info@nuqtai.com', 
            icon_name: 'FiMail', 
            is_active: true, 
            display_order: 4,
            created_at: '',
            updated_at: ''
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialMedia();
  }, []);

  // الحصول على الأيقونة المناسبة من مكتبة react-icons/fi
  const getIconComponent = (iconName: string) => {
    const IconComponent = FiIcons[iconName as keyof typeof FiIcons];
    
    if (!IconComponent) {
      console.warn(`Icon ${iconName} not found in react-icons/fi`);
      return <FiMail />;
    }
    
    return <IconComponent />;
  };

  const footerLinks = [
    {
      title: 'خدماتنا',
      links: [
        { name: 'الذكاء الاصطناعي الخاص', href: '/#privateai' },
        { name: 'بناء المواقع بالذكاء الاصطناعي', href: '/#site-builder' },
        { name: 'روبوت واتساب للدردشة', href: '/#whatsapp-chatbot' },
      ],
    },
    {
      title: 'الشركة',
      links: [
        { name: 'من نحن', href: '/#about' },
        { name: 'اتصل بنا', href: '/#contact' },
        { name: 'المدونة', href: '/blog' },
      ],
    },
    {
      title: 'قانوني',
      links: [
        { name: 'شروط الخدمة', href: '/terms' },
        { name: 'سياسة الخصوصية', href: '/privacy' },
        { name: 'ملفات تعريف الارتباط', href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold gradient-text">نقطة للذكاء الاصطناعي</span>
            </Link>
            <p className="text-gray-400 mb-4">
              نحول المستقبل بحلول ذكاء اصطناعي سهلة الوصول وقوية للشركات والأفراد.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label={link.platform}
                >
                  {getIconComponent(link.icon_name)}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} نقطة للذكاء الاصطناعي. جميع الحقوق محفوظة.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/terms"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              الشروط
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              الخصوصية
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              ملفات تعريف الارتباط
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 