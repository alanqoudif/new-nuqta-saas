import { Metadata } from 'next';
import { constructMetadata } from '../metadata';

export const metadata: Metadata = constructMetadata({
  title: 'لوحة الإدارة - نقطة للذكاء الاصطناعي',
  description: 'لوحة إدارة نقطة للذكاء الاصطناعي - إدارة المستخدمين والطلبات',
  noIndex: true, // لا نريد فهرسة صفحات الإدارة
}); 