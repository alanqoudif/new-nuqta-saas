import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دمج أسماء الفئات مع دعم Tailwind CSS
 * يستخدم clsx لدمج الفئات وtwMerge لدمج فئات Tailwind بشكل صحيح
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 