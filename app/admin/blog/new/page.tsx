import { redirect } from 'next/navigation';

export default function BlogNewPage() {
  // Redirect to the main admin page
  redirect('/admin');
} 