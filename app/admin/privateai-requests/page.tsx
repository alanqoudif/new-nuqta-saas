'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiServer, FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface PrivateAIRequest {
  id: string;
  user_id: string;
  usage_type: string;
  number_of_users: number;
  domain_of_use: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export default function AdminPrivateAIRequestsPage() {
  const [requests, setRequests] = useState<PrivateAIRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PrivateAIRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching private AI requests...');
      
      // محاولة إنشاء الجدول أولاً إذا لم يكن موجوداً
      try {
        console.log('Checking if table exists and creating it if needed...');
        
        // استدعاء دالة SQL مخصصة لإنشاء الجدول إذا لم يكن موجوداً
        const { error: createTableError } = await supabase.rpc('create_privateai_requests_table_if_not_exists');
        
        if (createTableError) {
          console.error('Error creating table via RPC:', createTableError);
          // نستمر في المحاولة حتى لو فشلت عملية إنشاء الجدول
        } else {
          console.log('Table created or already exists');
        }
      } catch (createTableError) {
        console.error('Error in table creation attempt:', createTableError);
        // نستمر في المحاولة حتى لو فشلت عملية إنشاء الجدول
      }
      
      // محاولة إصلاح هيكل الجدول
      try {
        console.log('Attempting to fix table structure...');
        
        // محاولة استدعاء دالة إصلاح الهيكل
        const { error: fixError } = await supabase.rpc('fix_privateai_requests_schema');
        
        if (fixError) {
          console.error('Error fixing schema via RPC:', fixError);
          // نستمر في المحاولة حتى لو فشلت عملية إصلاح الجدول
        } else {
          console.log('Schema fixed successfully via RPC');
        }
      } catch (fixError) {
        console.error('Error in schema fix attempt:', fixError);
        // نستمر في المحاولة حتى لو فشلت عملية إصلاح الجدول
      }
      
      // محاولة جلب البيانات
      try {
        console.log('Fetching requests data...');
        const { data, error } = await supabase
          .from('privateai_requests')
          .select(`
            *,
            profiles (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching requests:', error);
          
          // التعامل مع خطأ عدم وجود العمود
          if (error.message && (
            error.message.includes('column') && error.message.includes('does not exist') ||
            error.message.includes('domain_of_use') ||
            error.message.includes('schema cache') ||
            error.message.includes('relation') && error.message.includes('does not exist')
          )) {
            console.error('Schema error detected. Trying simplified query...');
            
            // محاولة جلب البيانات بدون العلاقة مع profiles
            const { data: simpleData, error: simpleError } = await supabase
              .from('privateai_requests')
              .select('*')
              .order('created_at', { ascending: false });
              
            if (simpleError) {
              console.error('Error with simplified query:', simpleError);
              
              // إذا كان الخطأ يتعلق بعدم وجود الجدول، نعرض رسالة للمستخدم
              if (simpleError.message && simpleError.message.includes('relation') && simpleError.message.includes('does not exist')) {
                toast.error('جدول طلبات الذكاء الاصطناعي الخاص غير موجود. يرجى تنفيذ ملف SQL لإنشاء الجدول.');
                setRequests([]);
                return;
              }
              
              throw simpleError;
            }
            
            console.log('Requests fetched with simplified query:', simpleData?.length);
            
            // محاولة إثراء البيانات بمعلومات المستخدمين
            const enhancedData = await Promise.all((simpleData || []).map(async (request) => {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('full_name, email')
                  .eq('id', request.user_id)
                  .single();
                  
                if (profileError || !profileData) {
                  return { ...request, profiles: null };
                }
                
                return { ...request, profiles: profileData };
              } catch (error) {
                console.error('Error fetching profile data:', error);
                return { ...request, profiles: null };
              }
            }));
            
            setRequests(enhancedData || []);
            return;
          }
          
          throw error;
        }
        
        console.log('Requests fetched successfully:', data?.length);
        
        // التحقق من هيكل البيانات
        if (data && data.length > 0) {
          const sampleRequest = data[0];
          console.log('Sample request structure:', {
            id: sampleRequest.id,
            user_id: sampleRequest.user_id,
            status: sampleRequest.status,
            profiles: sampleRequest.profiles
          });
        }
        
        setRequests(data || []);
      } catch (fetchError) {
        console.error('Error in main fetch attempt:', fetchError);
        
        // محاولة أخيرة لجلب أي بيانات متاحة
        try {
          console.log('Final attempt to fetch any available request data...');
          const { data: anyRequests, error: anyError } = await supabase
            .from('privateai_requests')
            .select(`
              *,
              profiles (
                full_name,
                email
              )
            `)
            .limit(100);
            
          if (!anyError && anyRequests) {
            console.log('Retrieved some request data in final attempt:', anyRequests.length);
            setRequests(anyRequests);
          } else {
            // إذا كان الخطأ يتعلق بعدم وجود الجدول، نعرض رسالة للمستخدم
            if (anyError && anyError.message && anyError.message.includes('relation') && anyError.message.includes('does not exist')) {
              toast.error('جدول طلبات الذكاء الاصطناعي الخاص غير موجود. يرجى تنفيذ ملف SQL لإنشاء الجدول.');
              setRequests([]);
              return;
            }
            
            throw anyError || new Error('No data available');
          }
        } catch (finalError) {
          console.error('Final attempt also failed:', finalError);
          setRequests([]);
          toast.error('لا يمكن جلب طلبات الذكاء الاصطناعي الخاص. يرجى التحقق من هيكل قاعدة البيانات.');
        }
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error('حدث خطأ في جلب طلبات الذكاء الاصطناعي الخاص');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: PrivateAIRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      console.log(`Updating request ${requestId} status to ${newStatus}`);
      
      // استخدام دالة RPC لتحديث حالة الطلب
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_privateai_request_status', {
        p_request_id: requestId,
        p_status: newStatus
      });
      
      if (rpcError) {
        console.error('Error updating status via RPC:', rpcError);
        
        // التحقق من نوع الخطأ
        if (rpcError.message && rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
          console.warn('RPC function does not exist, falling back to direct update');
          
          // محاولة التحديث المباشر كخطة بديلة
          const { data, error } = await supabase
            .from('privateai_requests')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select();

          if (error) {
            console.error('Error in fallback update:', error);
            throw error;
          }

          console.log('Request status updated successfully via direct update:', data);
        } else if (rpcError.message && rpcError.message.includes('ليس لديك صلاحية')) {
          // خطأ في الصلاحيات
          toast.error('ليس لديك صلاحية لتحديث حالة الطلبات');
          return;
        } else {
          // أي خطأ آخر
          throw rpcError;
        }
      } else {
        console.log('Request status updated successfully via RPC:', rpcResult);
        
        // التحقق من نتيجة العملية
        if (rpcResult === false) {
          toast.error('فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
          return;
        }
      }
      
      // تحديث قائمة الطلبات في واجهة المستخدم
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus, updated_at: new Date().toISOString() } 
          : request
      ));
      
      // إظهار رسالة نجاح
      toast.success(`تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`);
      
      // تحديث الطلب المحدد إذا كان مفتوحاً
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error: any) {
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
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">تمت الموافقة</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">مرفوض</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">غير معروف</span>;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.profiles?.email && request.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.profiles?.full_name && request.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.usage_type && request.usage_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.domain_of_use && request.domain_of_use.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
            <h1 className="text-2xl font-bold mb-4 md:mb-0">طلبات الذكاء الاصطناعي الخاص</h1>
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
                <option value="approved">تمت الموافقة</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FiServer className="text-5xl mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد طلبات تطابق معايير البحث' 
                  : 'لم يتم تقديم أي طلبات بعد'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-right py-3 px-4">المستخدم</th>
                    <th className="text-right py-3 px-4">نوع الاستخدام</th>
                    <th className="text-right py-3 px-4">عدد المستخدمين</th>
                    <th className="text-right py-3 px-4">تاريخ الطلب</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{request.profiles?.full_name || 'مستخدم'}</div>
                          <div className="text-sm text-gray-500">{request.profiles?.email || 'بريد إلكتروني غير متوفر'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{request.usage_type}</td>
                      <td className="py-3 px-4">{request.number_of_users}</td>
                      <td className="py-3 px-4">{formatDate(request.created_at)}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            icon={<FiEye />}
                          >
                            عرض
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-400"
                                onClick={() => handleUpdateStatus(request.id, 'approved')}
                                icon={<FiCheck />}
                              >
                                قبول
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-400"
                                onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                icon={<FiX />}
                              >
                                رفض
                              </Button>
                            </>
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
                  <h3 className="text-lg font-medium">معلومات المستخدم</h3>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الاسم</p>
                      <p>{selectedRequest.profiles?.full_name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                      <p>{selectedRequest.profiles?.email || 'بريد إلكتروني غير متوفر'}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium">تفاصيل الطلب</h3>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">نوع الاستخدام</p>
                      <p>{selectedRequest.usage_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">عدد المستخدمين</p>
                      <p>{selectedRequest.number_of_users}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">مجال الاستخدام</p>
                      <p>{selectedRequest.domain_of_use}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">تاريخ الطلب</p>
                      <p>{formatDate(selectedRequest.created_at)}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-1">وصف الطلب</p>
                      <p className="whitespace-pre-wrap">{selectedRequest.description}</p>
                    </div>
                  )}
                </div>
                
                {selectedRequest.status !== 'pending' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {selectedRequest.status === 'approved' ? 'تمت الموافقة في' : 'تم الرفض في'}
                    </p>
                    <p>{formatDate(selectedRequest.updated_at)}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  إغلاق
                </Button>
                
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="gradient"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleUpdateStatus(selectedRequest.id, 'approved');
                        setShowDetailsModal(false);
                      }}
                    >
                      قبول الطلب
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        handleUpdateStatus(selectedRequest.id, 'rejected');
                        setShowDetailsModal(false);
                      }}
                    >
                      رفض الطلب
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 