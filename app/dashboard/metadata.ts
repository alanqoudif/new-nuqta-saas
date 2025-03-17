import { Metadata } from 'next';
import { constructMetadata } from '../metadata';

export const metadata: Metadata = constructMetadata({
  title: 'لوحة التحكم - نقطة للذكاء الاصطناعي',
  description: 'لوحة تحكم نقطة للذكاء الاصطناعي - إدارة خدمات الذكاء الاصطناعي الخاصة بك',
  noIndex: true, // لا نريد فهرسة صفحات لوحة التحكم
}); 