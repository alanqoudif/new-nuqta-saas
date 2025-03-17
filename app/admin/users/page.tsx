'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit, FiTrash, FiUserPlus } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    // التحقق من صلاحيات المستخدم عند تحميل الصفحة
    const checkAdminPermissions = async () => {
      try {
        // التحقق من الجلسة الحالية
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          toast.error('حدث خطأ في التحقق من الجلسة');
          return;
        }
        
        if (!session) {
          console.error('No active session found');
          toast.error('يجب تسجيل الدخول للوصول إلى لوحة الإدارة');
          return;
        }
        
        // التحقق من دور المستخدم
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error checking user role:', profileError);
          toast.error('حدث خطأ في التحقق من صلاحيات المستخدم');
          return;
        }
        
        if (profile?.role !== 'admin') {
          console.error('User is not an admin:', profile?.role);
          toast.error('ليس لديك صلاحية الوصول إلى لوحة الإدارة');
          return;
        }
        
        console.log('Admin permissions verified successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error in admin permissions check:', error);
        toast.error('حدث خطأ في التحقق من صلاحيات المستخدم');
      }
    };
    
    checkAdminPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users...');
      
      // جلب المستخدمين من جدول profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('حدث خطأ أثناء جلب بيانات المستخدمين');
        setUsers([]);
        return;
      }
      
      if (!profilesData || profilesData.length === 0) {
        console.log('No users found');
        setUsers([]);
        return;
      }
      
      console.log('Users fetched successfully:', profilesData.length);
      
      // محاولة جلب معلومات إضافية من auth.users إذا كان ممكناً
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authUsers) {
          console.log('Auth users fetched successfully:', authUsers.users.length);
          
          // إنشاء قاموس للمستخدمين للوصول السريع
          const authUsersMap = new Map();
          authUsers.users.forEach(user => {
            authUsersMap.set(user.id, user);
          });
          
          // دمج بيانات المستخدمين مع الملفات الشخصية
          const mergedUsers = profilesData.map(profile => {
            const authUser = authUsersMap.get(profile.id);
            return {
              ...profile,
              email: authUser?.email || profile.email || 'غير متوفر'
            };
          });
          
          setUsers(mergedUsers);
          return;
        }
      } catch (authError) {
        console.error('Error fetching auth users:', authError);
        // استمر باستخدام بيانات الملفات الشخصية فقط
      }
      
      // إذا فشل جلب بيانات auth.users، استخدم بيانات الملفات الشخصية فقط
      setUsers(profilesData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المستخدمين');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newUserData.email || !newUserData.password) {
        toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }
      
      // إنشاء المستخدم باستخدام API مباشرة بدلاً من admin API
      const { data, error } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.fullName
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // تحديث دور المستخدم في جدول profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: newUserData.role,
            full_name: newUserData.fullName
          })
          .eq('id', data.user.id);
          
        if (profileError) throw profileError;
        
        toast.success('تم إضافة المستخدم بنجاح');
        setShowAddUserModal(false);
        setNewUserData({
          email: '',
          password: '',
          fullName: '',
          role: 'user'
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'حدث خطأ أثناء إضافة المستخدم');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleting(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      console.log('Deleting user:', userToDelete.id);
      
      // حذف المستخدم من جدول profiles أولاً
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
        
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }
      
      // محاولة حذف المستخدم من auth.users إذا كان لديك صلاحية
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        
        if (authError) {
          console.error('Error deleting auth user:', authError);
          // نستمر حتى لو فشلت هذه الخطوة
        }
      } catch (authError) {
        console.error('Error in auth user deletion:', authError);
        // نستمر حتى لو فشلت هذه الخطوة
      }
      
      toast.success('تم حذف المستخدم بنجاح');
      setIsDeleting(false);
      setUserToDelete(null);
      
      // إعادة تحميل قائمة المستخدمين
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'حدث خطأ أثناء حذف المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleting(false);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">إدارة المستخدمين</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="بحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                variant="gradient"
                icon={<FiUserPlus />}
                onClick={() => setShowAddUserModal(true)}
              >
                إضافة مستخدم
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="text-5xl mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">لم يتم العثور على مستخدمين</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-3 px-4 text-right">المستخدم</th>
                    <th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                    <th className="py-3 px-4 text-right">الدور</th>
                    <th className="py-3 px-4 text-right">تاريخ التسجيل</th>
                    <th className="py-3 px-4 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center mr-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name || ''} className="w-10 h-10 rounded-full" />
                            ) : (
                              <span className="text-primary-500 font-bold">
                                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span>{user.full_name || 'بدون اسم'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-primary-900/30 text-primary-500' 
                            : 'bg-gray-800 text-gray-300'
                        }`}>
                          {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiEdit className="text-gray-400" />}
                            className="hover:bg-gray-800"
                          >
                            {/* تعديل */}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiTrash className="text-red-500" />}
                            className="hover:bg-gray-800"
                            onClick={() => handleDeleteUser(user)}
                          >
                            {/* حذف */}
                          </Button>
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

      {/* Modal for adding new user */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  كلمة المرور
                </label>
                <Input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <Input
                  type="text"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  الدور
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                >
                  إضافة المستخدم
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal for deleting user */}
      {isDeleting && userToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">تأكيد حذف المستخدم</h2>
            <p className="mb-6">
              هل أنت متأكد من رغبتك في حذف المستخدم "{userToDelete.full_name || userToDelete.email}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={cancelDeleteUser}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="gradient"
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDeleteUser}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 