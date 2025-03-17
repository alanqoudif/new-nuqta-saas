/**
 * تنسيق التاريخ بالتنسيق العربي
 * @param dateString التاريخ كسلسلة نصية
 * @returns التاريخ المنسق
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // التحقق من صحة التاريخ
  if (isNaN(date.getTime())) return '';
  
  // تنسيق التاريخ بالعربية
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق التاريخ والوقت بالتنسيق العربي
 * @param dateString التاريخ كسلسلة نصية
 * @returns التاريخ والوقت المنسق
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // التحقق من صحة التاريخ
  if (isNaN(date.getTime())) return '';
  
  // تنسيق التاريخ والوقت بالعربية
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * الحصول على الوقت المنقضي منذ تاريخ معين
 * @param dateString التاريخ كسلسلة نصية
 * @returns الوقت المنقضي كنص
 */
export function getTimeAgo(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // التحقق من صحة التاريخ
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // أقل من دقيقة
  if (diffInSeconds < 60) {
    return 'منذ لحظات';
  }
  
  // أقل من ساعة
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  
  // أقل من يوم
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  
  // أقل من أسبوع
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  }
  
  // أقل من شهر
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  }
  
  // أقل من سنة
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  }
  
  // أكثر من سنة
  const years = Math.floor(diffInSeconds / 31536000);
  return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
} 