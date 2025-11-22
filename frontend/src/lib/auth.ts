import api from '@/lib/api';

export type UserRole = 'student' | 'librarian';

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  studentId?: string
) {
  try {
    const { token, user } = await api.post('/auth/register', { name, email, password, role, studentId });
    localStorage.setItem('token', token);
    return { data: { user }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function signIn(identifier: string, password: string) {
  try {
    const { token, user } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', token);
    return { data: { user }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function signOut() {
  localStorage.removeItem('token');
  return { error: null };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  // Role is included in the user object from backend
  return null; // Will be handled by AuthContext
}

export async function getCurrentUser() {
  try {
    const user = await api.get('/auth/me');
    return user;
  } catch (error) {
    return null;
  }
}
