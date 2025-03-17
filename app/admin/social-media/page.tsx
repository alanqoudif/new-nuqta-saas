// Fixed toast.info issue - force update
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiArrowUp, FiArrowDown, FiShare2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { SocialMediaService, SocialMedia } from '@/lib/social-media-service';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function AdminSocialMediaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSocialMedia, setCurrentSocialMedia] = useState<SocialMedia | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon_name: 'FiGithub',
    is_active: true,
    display_order: 0,
  });

  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/auth/login?error=session_expired');
        return;
      }

      // التحقق من أن المستخدم مسؤول
      if (user.role !== 'admin') {
        router.push('/dashboard?error=access_denied');
        return;
      }

      // تحميل وسائل التواصل الاجتماعي
      await loadSocialMedia();
    };

    const timer = setTimeout(() => {
      checkAdmin();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  // تحميل وسائل التواصل الاجتماعي
  const loadSocialMedia = async () => {
    setIsLoading(true);
    try {
      console.log('Admin: Loading social media...');
      // استخدام خدمة SocialMediaService مباشرة بدلاً من نقطة النهاية API
      const allSocialMedia = await SocialMediaService.getAllSocialMedia();
      
      if (allSocialMedia && allSocialMedia.length > 0) {
        console.log('Admin: Social media loaded successfully:', allSocialMedia);
        setSocialMedia(allSocialMedia);
      } else {
        console.log('Admin: No social media found, showing empty state');
        setSocialMedia([]);
        toast('لا توجد وسائل تواصل اجتماعي. قم بإضافة وسائل تواصل جديدة.', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('Error loading social media:', error);
      toast.error('فشل في تحميل وسائل التواصل الاجتماعي');
      setSocialMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  // فتح نافذة إضافة وسيلة تواصل جديدة
  const openAddModal = () => {
    setCurrentSocialMedia(null);
    setFormData({
      platform: '',
      url: '',
      icon_name: 'FiGithub',
      is_active: true,
      display_order: socialMedia.length + 1,
    });
    setIsModalOpen(true);
  };

  // فتح نافذة تعديل وسيلة تواصل
  const openEditModal = (item: SocialMedia) => {
    setCurrentSocialMedia(item);
    setFormData({
      platform: item.platform,
      url: item.url,
      icon_name: item.icon_name,
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setIsModalOpen(true);
  };

  // فتح نافذة حذف وسيلة تواصل
  const openDeleteModal = (item: SocialMedia) => {
    setCurrentSocialMedia(item);
    setIsDeleteModalOpen(true);
  };

  // معالجة تغيير بيانات النموذج
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // حفظ وسيلة التواصل (إضافة أو تعديل)
  const handleSaveSocialMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentSocialMedia) {
        // تحديث وسيلة تواصل موجودة
        await SocialMediaService.updateSocialMedia(currentSocialMedia.id, formData);
        toast.success('تم تحديث وسيلة التواصل بنجاح');
      } else {
        // إضافة وسيلة تواصل جديدة
        await SocialMediaService.createSocialMedia(formData);
        toast.success('تمت إضافة وسيلة التواصل بنجاح');
      }
      
      setIsModalOpen(false);
      await loadSocialMedia();
    } catch (error) {
      console.error('Error saving social media:', error);
      toast.error('فشل في حفظ وسيلة التواصل الاجتماعي');
    }
  };

  // حذف وسيلة تواصل
  const handleDeleteSocialMedia = async () => {
    if (!currentSocialMedia) return;
    
    try {
      await SocialMediaService.deleteSocialMedia(currentSocialMedia.id);
      toast.success('تم حذف وسيلة التواصل بنجاح');
      setIsDeleteModalOpen(false);
      await loadSocialMedia();
    } catch (error) {
      console.error('Error deleting social media:', error);
      toast.error('فشل في حذف وسيلة التواصل الاجتماعي');
    }
  };

  // تغيير حالة التفعيل
  const handleToggleActive = async (item: SocialMedia) => {
    try {
      await SocialMediaService.toggleSocialMediaActive(item.id, !item.is_active);
      toast.success(`تم ${!item.is_active ? 'تفعيل' : 'إلغاء تفعيل'} وسيلة التواصل بنجاح`);
      await loadSocialMedia();
    } catch (error) {
      console.error('Error toggling social media active state:', error);
      toast.error('فشل في تغيير حالة وسيلة التواصل الاجتماعي');
    }
  };

  // تغيير ترتيب العرض
  const handleReorder = async (item: SocialMedia, direction: 'up' | 'down') => {
    const currentIndex = socialMedia.findIndex(s => s.id === item.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === socialMedia.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...socialMedia];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    try {
      await SocialMediaService.reorderSocialMedia(newOrder.map(item => item.id));
      toast.success('تم إعادة ترتيب وسائل التواصل بنجاح');
      await loadSocialMedia();
    } catch (error) {
      console.error('Error reordering social media:', error);
      toast.error('فشل في إعادة ترتيب وسائل التواصل الاجتماعي');
    }
  };

  // إذا كان التحميل جارياً، عرض مؤشر تحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل وسائل التواصل الاجتماعي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة وسائل التواصل الاجتماعي</h1>
          <p className="text-gray-400">
            إدارة روابط وسائل التواصل الاجتماعي التي تظهر في تذييل الموقع
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={openAddModal}
          className="flex items-center"
        >
          <FiPlus className="ml-2" /> إضافة وسيلة تواصل
        </Button>
      </div>

      {socialMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialMedia.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 bg-gray-800 rounded-lg ml-4`}>
                  <DynamicIcon 
                    iconName={item.icon_name} 
                    className={`text-2xl ${item.is_active ? 'text-primary-500' : 'text-gray-500'}`} 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.platform}</h3>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {item.url}
                  </a>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => openEditModal(item)}
                  className="flex items-center"
                >
                  <FiEdit2 className="ml-1" /> تعديل
                </Button>
                
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => openDeleteModal(item)}
                  className="flex items-center"
                >
                  <FiTrash2 className="ml-1" /> حذف
                </Button>
                
                <Button 
                  variant={item.is_active ? "warning" : "success"} 
                  size="sm" 
                  onClick={() => handleToggleActive(item)}
                  className="flex items-center"
                >
                  {item.is_active ? (
                    <><FiEyeOff className="ml-1" /> إخفاء</>
                  ) : (
                    <><FiEye className="ml-1" /> إظهار</>
                  )}
                </Button>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleReorder(item, 'up')}
                    disabled={socialMedia.indexOf(item) === 0}
                    className="flex items-center"
                  >
                    <FiArrowUp />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleReorder(item, 'down')}
                    disabled={socialMedia.indexOf(item) === socialMedia.length - 1}
                    className="flex items-center"
                  >
                    <FiArrowDown />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiShare2 className="text-5xl text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا توجد وسائل تواصل اجتماعي</h3>
          <p className="text-gray-400 mb-6">
            قم بإضافة وسائل التواصل الاجتماعي التي ترغب في عرضها في تذييل الموقع
          </p>
          <Button 
            variant="primary" 
            onClick={openAddModal}
            className="flex items-center mx-auto"
          >
            <FiPlus className="ml-2" /> إضافة وسيلة تواصل
          </Button>
        </div>
      )}

      {/* نافذة إضافة/تعديل وسيلة تواصل */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSocialMedia ? 'تعديل وسيلة تواصل' : 'إضافة وسيلة تواصل جديدة'}
      >
        <form onSubmit={handleSaveSocialMedia}>
          <div className="mb-4">
            <label htmlFor="platform" className="block mb-2 text-sm font-medium">
              اسم المنصة
            </label>
            <Input
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleFormChange}
              placeholder="مثال: تويتر، انستغرام، لينكد إن"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="url" className="block mb-2 text-sm font-medium">
              رابط الصفحة
            </label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleFormChange}
              placeholder="https://example.com/profile"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="icon_name" className="block mb-2 text-sm font-medium">
              اسم الأيقونة
            </label>
            <Select
              id="icon_name"
              name="icon_name"
              value={formData.icon_name}
              onChange={handleFormChange}
              required
              options={[
                { value: "FiGithub", label: "GitHub" },
                { value: "FiTwitter", label: "Twitter" },
                { value: "FiLinkedin", label: "LinkedIn" },
                { value: "FiInstagram", label: "Instagram" },
                { value: "FiMail", label: "Email" },
                { value: "FiFacebook", label: "Facebook" },
                { value: "FiYoutube", label: "YouTube" },
                { value: "FiGlobe", label: "Website" }
              ]}
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="ml-2"
              />
              <span>نشط (ظاهر في الموقع)</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              {currentSocialMedia ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد الحذف */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد الحذف"
      >
        <div className="mb-6">
          <p>هل أنت متأكد من رغبتك في حذف وسيلة التواصل "{currentSocialMedia?.platform}"؟</p>
          <p className="text-red-500 mt-2">هذا الإجراء لا يمكن التراجع عنه.</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteSocialMedia}
          >
            تأكيد الحذف
          </Button>
        </div>
      </Modal>
    </div>
  );
} 