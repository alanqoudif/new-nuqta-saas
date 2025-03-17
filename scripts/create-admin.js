// Este script debe ejecutarse manualmente para crear el usuario administrador
// Ejecutar con: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    // 1. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@nuqta.ai',
      password: 'Admin1234#',
    });

    if (authError) {
      throw authError;
    }

    console.log('Usuario creado:', authData);

    // 2. Actualizar el rol a admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role_id: (await supabase.from('user_roles').select('id').eq('name', 'admin').single()).data.id 
      })
      .eq('id', authData.user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Usuario actualizado a admin');
    console.log('Credenciales de administrador:');
    console.log('Email: admin@nuqta.ai');
    console.log('Contraseña: Admin1234#');
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  }
}

createAdminUser(); 