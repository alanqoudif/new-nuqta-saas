export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

export interface PrivateAIRequest {
  id: string;
  user_id: string;
  usage_type: string;
  number_of_users: number;
  domain_of_use: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AISiteProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  site_data?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
} 