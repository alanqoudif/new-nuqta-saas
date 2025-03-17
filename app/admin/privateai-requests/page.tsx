'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface AIRequest {
  id: string;
  user_id: string;
  request_type: string;
  number_of_users: number | null;
  domain_of_use: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminPrivateAIRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    checkAdminPermissions();
    fetchRequests();
  }, [statusFilter]);

  const checkAdminPermissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        router.push('/login');
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
        toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      toast.error('حدث خطأ أثناء التحقق من الصلاحيات');
      router.push('/dashboard');
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching AI requests...');
      
      let query = supabase
        .from('privateai_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching AI requests:', error);
        
        // التحقق من وجود الجدول
        if (error.code === '42P01') { // رمز الخطأ عندما لا يوجد الجدول
          toast.error('جدول طلبات الذكاء الاصطناعي غير موجود. يرجى إنشاء الجدول أولاً.');
          setRequests([]);
          setIsLoading(false);
          return;
        }
        
        toast.error('حدث خطأ أثناء جلب طلبات الذكاء الاصطناعي');
        setRequests([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} AI requests`);
      setRequests(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchRequests:', error);
      toast.error('حدث خطأ أثناء جلب طلبات الذكاء الاصطناعي');
      setRequests([]);
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: AIRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (request: AIRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedRequest) return;
    
    try {
      const { error } = await supabase
        .from('privateai_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);
      
      if (error) {
        console.error('Error updating status:', error);
        toast.error('حدث خطأ أثناء تحديث حالة الطلب');
        return;
      }
      
      toast.success('تم تحديث حالة الطلب بنجاح');
      setIsStatusModalOpen(false);
      
      // تحديث القائمة
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: newStatus, updated_at: new Date().toISOString() } 
          : req
      ));
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge color="warning" icon={<FiClock />}>قيد الانتظار</Badge>;
      case 'approved':
        return <Badge color="success" icon={<FiCheck />}>تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge color="danger" icon={<FiX />}>مرفوض</Badge>;
      default:
        return <Badge color="default">غير معروف</Badge>;
    }
  };

  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.request_type && request.request_type.toLowerCase().includes(searchLower)) ||
      (request.domain_of_use && request.domain_of_use.toLowerCase().includes(searchLower)) ||
      (request.profiles?.full_name && request.profiles.full_name.toLowerCase().includes(searchLower)) ||
      (request.profiles?.email && request.profiles.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة طلبات الذكاء الاصطناعي</h1>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="البحث عن طلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'pending', label: 'قيد الانتظار' },
                { value: 'approved', label: 'تمت الموافقة' },
                { value: 'rejected', label: 'مرفوض' }
              ]}
              fullWidth
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400 mb-4">لا توجد طلبات ذكاء اصطناعي</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-right">نوع الطلب</th>
                  <th className="py-3 px-4 text-right">المستخدم</th>
                  <th className="py-3 px-4 text-right">مجال الاستخدام</th>
                  <th className="py-3 px-4 text-right">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-4">{request.request_type}</td>
                    <td className="py-3 px-4">{request.profiles?.full_name || 'غير معروف'}</td>
                    <td className="py-3 px-4">{request.domain_of_use || 'غير محدد'}</td>
                    <td className="py-3 px-4">{formatDate(request.created_at)}</td>
                    <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FiEye />}
                          onClick={() => handleViewDetails(request)}
                        >
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(request)}
                        >
                          تحديث الحالة
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal for viewing request details */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="تفاصيل الطلب"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400">نوع الطلب</h3>
              <p className="font-medium">{selectedRequest.request_type}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400">معلومات المستخدم</h3>
              <p className="font-medium">{selectedRequest.profiles?.full_name || 'غير معروف'}</p>
              <p className="text-sm">{selectedRequest.profiles?.email || 'لا يوجد بريد إلكتروني'}</p>
              <p className="text-sm">{selectedRequest.profiles?.phone || 'لا يوجد رقم هاتف'}</p>
            </div>
            
            {selectedRequest.number_of_users && (
              <div>
                <h3 className="text-sm text-gray-400">عدد المستخدمين</h3>
                <p className="font-medium">{selectedRequest.number_of_users}</p>
              </div>
            )}
            
            {selectedRequest.domain_of_use && (
              <div>
                <h3 className="text-sm text-gray-400">مجال الاستخدام</h3>
                <p className="font-medium">{selectedRequest.domain_of_use}</p>
              </div>
            )}
            
            {selectedRequest.description && (
              <div>
                <h3 className="text-sm text-gray-400">الوصف</h3>
                <p className="font-medium whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm text-gray-400">الحالة</h3>
              <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400">تاريخ الإنشاء</h3>
              <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400">آخر تحديث</h3>
              <p className="font-medium">{formatDate(selectedRequest.updated_at)}</p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsDetailsModalOpen(false)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal for updating status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="تحديث حالة الطلب"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-2">اختر الحالة الجديدة</h3>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                options={[
                  { value: 'pending', label: 'قيد الانتظار' },
                  { value: 'approved', label: 'تمت الموافقة' },
                  { value: 'rejected', label: 'مرفوض' }
                ]}
                fullWidth
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>إلغاء</Button>
              <Button onClick={handleStatusChange}>حفظ</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
} 