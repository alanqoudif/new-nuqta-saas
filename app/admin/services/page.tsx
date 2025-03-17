'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiClock, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ServicesService, Service } from '@/lib/services-service';
import { useServices } from '@/context/ServicesContext';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function AdminServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { refreshServices } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_name: 'FiServer',
    color: 'primary',
    url: '',
    is_active: true,
    is_coming_soon: false,
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

      // تحميل الخدمات
      await loadServices();
    };

    const timer = setTimeout(() => {
      checkAdmin();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  // تحميل الخدمات
  const loadServices = async () => {
    setIsLoading(true);
    try {
      const allServices = await ServicesService.getAllServices();
      setServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('حدث خطأ أثناء تحميل الخدمات');
    } finally {
      setIsLoading(false);
    }
  };

  // فتح نافذة إضافة خدمة جديدة
  const openAddModal = () => {
    setCurrentService(null);
    setFormData({
      name: '',
      description: '',
      icon_name: 'FiServer',
      color: 'primary',
      url: '',
      is_active: true,
      is_coming_soon: false,
      display_order: services.length + 1,
    });
    setIsModalOpen(true);
  };

  // فتح نافذة تعديل خدمة
  const openEditModal = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      icon_name: service.icon_name,
      color: service.color,
      url: service.url,
      is_active: service.is_active,
      is_coming_soon: service.is_coming_soon,
      display_order: service.display_order,
    });
    setIsModalOpen(true);
  };

  // فتح نافذة حذف خدمة
  const openDeleteModal = (service: Service) => {
    setCurrentService(service);
    setIsDeleteModalOpen(true);
  };

  // تغيير قيم النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // حفظ الخدمة (إضافة أو تعديل)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentService) {
        // تحديث خدمة موجودة
        await ServicesService.updateService(currentService.id, formData);
        toast.success('تم تحديث الخدمة بنجاح');
      } else {
        // إضافة خدمة جديدة
        await ServicesService.createService(formData);
        toast.success('تم إضافة الخدمة بنجاح');
      }
      
      setIsModalOpen(false);
      await loadServices();
      // تحديث الخدمات في السياق (لتحديث القائمة الجانبية)
      await refreshServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('حدث خطأ أثناء حفظ الخدمة');
    }
  };

  // حذف خدمة
  const handleDeleteService = async () => {
    if (!currentService) return;
    
    try {
      await ServicesService.deleteService(currentService.id);
      toast.success('تم حذف الخدمة بنجاح');
      setIsDeleteModalOpen(false);
      await loadServices();
      // تحديث الخدمات في السياق (لتحديث القائمة الجانبية)
      await refreshServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('حدث خطأ أثناء حذف الخدمة');
    }
  };

  // تغيير حالة التفعيل
  const toggleServiceActive = async (service: Service) => {
    try {
      await ServicesService.toggleServiceActive(service.id, !service.is_active);
      toast.success(`تم ${service.is_active ? 'تعطيل' : 'تفعيل'} الخدمة بنجاح`);
      await loadServices();
      // تحديث الخدمات في السياق (لتحديث القائمة الجانبية)
      await refreshServices();
    } catch (error) {
      console.error('Error toggling service active state:', error);
      toast.error('حدث خطأ أثناء تغيير حالة الخدمة');
    }
  };

  // تغيير حالة "قادم قريباً"
  const toggleServiceComingSoon = async (service: Service) => {
    try {
      await ServicesService.toggleServiceComingSoon(service.id, !service.is_coming_soon);
      toast.success(`تم ${service.is_coming_soon ? 'إلغاء' : 'تفعيل'} حالة "قادم قريباً" بنجاح`);
      await loadServices();
      // تحديث الخدمات في السياق (لتحديث القائمة الجانبية)
      await refreshServices();
    } catch (error) {
      console.error('Error toggling service coming soon state:', error);
      toast.error('حدث خطأ أثناء تغيير حالة "قادم قريباً"');
    }
  };

  // تغيير ترتيب الخدمة
  const moveService = async (service: Service, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === services.length - 1)
    ) {
      return;
    }

    const newServices = [...services];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // تبديل الخدمات
    [newServices[currentIndex], newServices[targetIndex]] = [newServices[targetIndex], newServices[currentIndex]];
    
    // تحديث ترتيب العرض
    const serviceIds = newServices.map(s => s.id);
    
    try {
      await ServicesService.reorderServices(serviceIds);
      toast.success('تم تغيير ترتيب الخدمات بنجاح');
      await loadServices();
      // تحديث الخدمات في السياق (لتحديث القائمة الجانبية)
      await refreshServices();
    } catch (error) {
      console.error('Error reordering services:', error);
      toast.error('حدث خطأ أثناء تغيير ترتيب الخدمات');
    }
  };

  // إذا كان التحميل جارياً، عرض رسالة تحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
        <Button onClick={openAddModal} className="flex items-center">
          <FiPlus className="mr-2" /> إضافة خدمة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className={`p-3 bg-${service.color}-900/30 rounded-lg mr-4`}>
                  <DynamicIcon 
                    iconName={service.icon_name} 
                    className={`text-2xl text-${service.color}-500`} 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{service.name}</h3>
                  <p className="text-gray-400 text-sm">{service.url}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => moveService(service, 'up')} 
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  disabled={service.display_order === 1}
                >
                  <FiArrowUp />
                </button>
                <button 
                  onClick={() => moveService(service, 'down')} 
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  disabled={service.display_order === services.length}
                >
                  <FiArrowDown />
                </button>
                <button 
                  onClick={() => toggleServiceActive(service)} 
                  className={`p-2 ${service.is_active ? 'bg-green-800' : 'bg-gray-800'} rounded-lg hover:bg-opacity-80`}
                  title={service.is_active ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
                >
                  {service.is_active ? <FiEye /> : <FiEyeOff />}
                </button>
                <button 
                  onClick={() => toggleServiceComingSoon(service)} 
                  className={`p-2 ${service.is_coming_soon ? 'bg-yellow-800' : 'bg-gray-800'} rounded-lg hover:bg-opacity-80`}
                  title={service.is_coming_soon ? 'إلغاء حالة قادم قريباً' : 'تفعيل حالة قادم قريباً'}
                >
                  <FiClock />
                </button>
                <button 
                  onClick={() => openEditModal(service)} 
                  className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700"
                >
                  <FiEdit2 />
                </button>
                <button 
                  onClick={() => openDeleteModal(service)} 
                  className="p-2 bg-red-800 rounded-lg hover:bg-red-700"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">لا توجد خدمات متاحة. قم بإضافة خدمة جديدة.</p>
          </div>
        )}
      </div>

      {/* نافذة إضافة/تعديل خدمة */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الخدمة</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الأيقونة</label>
              <input
                type="text"
                name="icon_name"
                value={formData.icon_name}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
                placeholder="مثال: FiServer"
                required
              />
              <p className="text-xs text-gray-400 mt-1">استخدم أسماء أيقونات من مكتبة react-icons/fi</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">اللون</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
                required
              >
                <option value="primary">أزرق (primary)</option>
                <option value="secondary">أخضر (secondary)</option>
                <option value="accent">وردي (accent)</option>
                <option value="indigo">نيلي (indigo)</option>
                <option value="purple">بنفسجي (purple)</option>
                <option value="teal">فيروزي (teal)</option>
                <option value="amber">كهرماني (amber)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">الرابط</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              placeholder="مثال: /dashboard/service-name أو https://example.com"
              required
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active">نشط</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_coming_soon"
                name="is_coming_soon"
                checked={formData.is_coming_soon}
                onChange={(e) => setFormData(prev => ({ ...prev, is_coming_soon: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_coming_soon">قادم قريباً</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              {currentService ? 'تحديث الخدمة' : 'إضافة الخدمة'}
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
        <div className="py-4">
          <p>هل أنت متأكد من رغبتك في حذف خدمة "{currentService?.name}"؟</p>
          <p className="text-red-400 text-sm mt-2">هذا الإجراء لا يمكن التراجع عنه.</p>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => setIsDeleteModalOpen(false)}
          >
            إلغاء
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleDeleteService}
          >
            حذف
          </Button>
        </div>
      </Modal>
    </div>
  );
} 