'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiMail, FiPhone, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface EarlyAccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  service_name: string;
  notes: string | null;
  status: 'pending' | 'contacted' | 'completed';
  created_at: string;
  updated_at: string;
}

export default function AdminEarlyAccessRequestsPage() {
  const [requests, setRequests] = useState<EarlyAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<EarlyAccessRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all');

  useEffect(() => {
    fetchRequests();
    checkAdminPermissions();
  }, []);

  const checkAdminPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        window.location.href = '/auth/login';
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
        toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      toast.error('حدث خطأ أثناء التحقق من الصلاحيات');
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching early access requests...');
      
      const { data, error } = await supabase
        .from('early_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching early access requests:', error);
        
        // إذا كان الخطأ بسبب عدم وجود الجدول
        if (error.code === '42P01') { // relation does not exist
          toast.error('جدول طلبات الوصول المبكر غير موجود. يرجى إنشاء الجدول أولاً.');
          setRequests([]);
          return;
        }
        
        toast.error('حدث خطأ في جلب طلبات الوصول المبكر');
        setRequests([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No early access requests found');
        setRequests([]);
        return;
      }
      
      console.log('Early access requests fetched successfully:', data.length);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('حدث خطأ في جلب طلبات الوصول المبكر');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: EarlyAccessRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: 'pending' | 'contacted' | 'completed') => {
    try {
      const { data, error } = await supabase
        .from('early_access_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Error updating request status:', error);
        toast.error('حدث خطأ أثناء تحديث حالة الطلب');
        return;
      }

      // تحديث قائمة الطلبات
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus, updated_at: new Date().toISOString() } 
          : request
      ));
      
      toast.success(`تم تحديث حالة الطلب بنجاح`);
      
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">قيد الانتظار</span>;
      case 'contacted':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">تم التواصل</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">مكتمل</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">غير معروف</span>;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.full_name && request.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.email && request.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.company_name && request.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.service_name && request.service_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && request.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">طلبات الوصول المبكر</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="بحث عن طلب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">جميع الطلبات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="contacted">تم التواصل</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="text-5xl mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد طلبات تطابق معايير البحث' 
                  : 'لم يتم تقديم أي طلبات وصول مبكر بعد'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-right py-3 px-4">الاسم</th>
                    <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4">الخدمة</th>
                    <th className="text-right py-3 px-4">تاريخ الطلب</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{request.full_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <FiMail className="text-gray-500 ml-2" />
                          <span>{request.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{request.service_name}</td>
                      <td className="py-3 px-4">{formatDate(request.created_at)}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            icon={<FiEye />}
                          >
                            عرض
                          </Button>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-500 hover:text-blue-400"
                              onClick={() => handleUpdateStatus(request.id, 'contacted')}
                            >
                              تم التواصل
                            </Button>
                          )}
                          {request.status === 'contacted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500 hover:text-green-400"
                              onClick={() => handleUpdateStatus(request.id, 'completed')}
                            >
                              إكمال
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal for viewing request details */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">تفاصيل الطلب</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-white"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">معلومات مقدم الطلب</h3>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الاسم</p>
                      <p>{selectedRequest.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                      <p>{selectedRequest.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                      <div className="flex items-center">
                        <FiPhone className="text-gray-500 ml-2" />
                        <p>{selectedRequest.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الشركة</p>
                      <p>{selectedRequest.company_name || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium">تفاصيل الطلب</h3>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الخدمة المطلوبة</p>
                      <p>{selectedRequest.service_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">تاريخ الطلب</p>
                      <p>{formatDate(selectedRequest.created_at)}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-1">ملاحظات إضافية</p>
                      <p className="whitespace-pre-wrap">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    آخر تحديث
                  </p>
                  <p>{formatDate(selectedRequest.updated_at)}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  إغلاق
                </Button>
                
                {selectedRequest.status === 'pending' && (
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      handleUpdateStatus(selectedRequest.id, 'contacted');
                      setShowDetailsModal(false);
                    }}
                  >
                    تحديث إلى "تم التواصل"
                  </Button>
                )}
                
                {selectedRequest.status === 'contacted' && (
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleUpdateStatus(selectedRequest.id, 'completed');
                      setShowDetailsModal(false);
                    }}
                  >
                    تحديث إلى "مكتمل"
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 