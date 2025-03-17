'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSearch, FiMail, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  read: boolean;
  status: string;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    fetchMessages();
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

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching contact messages...');
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching contact messages:', error);
        
        // إذا كان الخطأ بسبب عدم وجود الجدول
        if (error.code === '42P01') { // relation does not exist
          toast.error('جدول رسائل التواصل غير موجود. يرجى إنشاء الجدول أولاً.');
          setMessages([]);
          return;
        }
        
        toast.error('حدث خطأ أثناء جلب رسائل التواصل');
        setMessages([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No contact messages found');
        setMessages([]);
        return;
      }
      
      console.log('Contact messages fetched successfully:', data.length);
      
      // تحويل حقل status إلى حقل read للتوافق مع الواجهة
      const formattedMessages = data.map(message => ({
        ...message,
        read: message.status === 'read',
        subject: message.subject || null
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('حدث خطأ أثناء جلب رسائل التواصل');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
    
    // إذا كانت الرسالة غير مقروءة، قم بتحديثها إلى مقروءة
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      console.log(`Marking message ${messageId} as read`);
      
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        
        // إذا كان الخطأ بسبب عدم وجود الجدول
        if (error.code === '42P01') { // relation does not exist
          toast.error('جدول رسائل التواصل غير موجود. يرجى إنشاء الجدول أولاً.');
          return;
        }
        
        toast.error('حدث خطأ أثناء تحديث حالة الرسالة');
        return;
      }
      
      console.log('Message marked as read successfully');

      // تحديث قائمة الرسائل
      setMessages(messages.map(message => 
        message.id === messageId 
          ? { ...message, read: true, status: 'read' } 
          : message
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          read: true,
          status: 'read'
        });
      }
      
      toast.success('تم تحديث حالة الرسالة بنجاح');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الرسالة');
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

  const getReadStatusBadge = (read: boolean) => {
    return read 
      ? <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">مقروءة</span>
      : <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">غير مقروءة</span>;
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      (message.name && message.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.email && message.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.message && message.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (readFilter === 'all') return matchesSearch;
    if (readFilter === 'read') return matchesSearch && message.read;
    return matchesSearch && !message.read;
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
            <h1 className="text-2xl font-bold mb-4 md:mb-0">رسائل التواصل</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="بحث عن رسالة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as any)}
              >
                <option value="all">جميع الرسائل</option>
                <option value="read">المقروءة</option>
                <option value="unread">غير المقروءة</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="text-5xl mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">لم يتم العثور على رسائل</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-3 px-4 text-right">المرسل</th>
                    <th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                    <th className="py-3 px-4 text-right">الموضوع</th>
                    <th className="py-3 px-4 text-right">التاريخ</th>
                    <th className="py-3 px-4 text-right">الحالة</th>
                    <th className="py-3 px-4 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center ml-3">
                            <span className="text-primary-500 font-bold">
                              {message.name ? message.name[0].toUpperCase() : 'م'}
                            </span>
                          </div>
                          <span>{message.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{message.email}</td>
                      <td className="py-3 px-4">{message.subject || 'بدون موضوع'}</td>
                      <td className="py-3 px-4">{formatDate(message.created_at)}</td>
                      <td className="py-3 px-4">
                        {getReadStatusBadge(message.read)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(message)}
                            icon={<FiEye />}
                          >
                            عرض
                          </Button>
                          {!message.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-400"
                              onClick={() => handleMarkAsRead(message.id)}
                              icon={<FiCheck />}
                            >
                              تحديد كمقروءة
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

      {/* Modal for viewing message details */}
      {showDetailsModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">تفاصيل الرسالة</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الاسم</p>
                    <p>{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                    <div className="flex items-center">
                      <FiMail className="text-gray-500 ml-2" />
                      <p>{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">التاريخ</p>
                    <p>{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الحالة</p>
                    <p>{getReadStatusBadge(selectedMessage.read)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">الموضوع</h3>
                <p className="bg-gray-800 p-3 rounded-lg">
                  {selectedMessage.subject || 'بدون موضوع'}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">الرسالة</h3>
                <div className="bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  إغلاق
                </Button>
                
                {!selectedMessage.read && (
                  <Button
                    variant="gradient"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleMarkAsRead(selectedMessage.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    تحديد كمقروءة
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