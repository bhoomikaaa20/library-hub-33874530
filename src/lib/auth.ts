import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'student' | 'librarian';

export async function signUp(
  email: string,
  password: string,
  name: string,
  studentId: string,
  phone: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        student_id: studentId,
        phone,
      },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  return { data, error };
}

export async function signIn(identifier: string, password: string) {
  // Try to sign in - identifier could be email or student_id
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
