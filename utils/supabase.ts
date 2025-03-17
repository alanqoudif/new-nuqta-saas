import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveContactForm(formData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([formData]);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving contact form:', error);
    return { success: false, error };
  }
}

export async function saveEarlyAccess(email: string) {
  try {
    const { data, error } = await supabase
      .from('early_access')
      .insert([{ email, created_at: new Date() }]);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving early access email:', error);
    return { success: false, error };
  }
}