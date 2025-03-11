-- Crear tabla para roles de usuario (si no existe ya)
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insertar roles básicos si no existen
INSERT INTO user_roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO user_roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

-- Extender la tabla de perfiles de usuario con rol
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES user_roles(id) DEFAULT (SELECT id FROM user_roles WHERE name = 'user');

-- Crear tabla para solicitudes de PrivateAI
CREATE TABLE IF NOT EXISTS privateai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  usage_type TEXT NOT NULL,
  number_of_users INTEGER NOT NULL,
  domain_of_use TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para proyectos de sitios web creados con AI
CREATE TABLE IF NOT EXISTS ai_site_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  site_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas
CREATE TRIGGER update_privateai_requests_updated_at
BEFORE UPDATE ON privateai_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_site_projects_updated_at
BEFORE UPDATE ON ai_site_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Crear o actualizar la tabla de perfiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  role_id INTEGER REFERENCES user_roles(id) DEFAULT (SELECT id FROM user_roles WHERE name = 'user'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role_id)
  VALUES (NEW.id, (SELECT id FROM user_roles WHERE name = 'user'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear usuario administrador (reemplazar con valores reales en producción)
-- Nota: Esto debe ejecutarse manualmente o a través de la API de Supabase
-- ya que implica crear un usuario en auth.users 