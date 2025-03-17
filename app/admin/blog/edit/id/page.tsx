import { redirect } from 'next/navigation';

export default function BlogEditPage() {
  // Redirect to the main admin page
  redirect('/admin');
}