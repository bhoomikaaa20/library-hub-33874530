import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen } from 'lucide-react';
import { signUp, signIn } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'student' | 'librarian';
type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [role, setRole] = useState<UserRole>('student');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Student signup form
  const [studentSignup, setStudentSignup] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    password: '',
  });

  // Student signin form
  const [studentSignin, setStudentSignin] = useState({
    studentId: '',
    password: '',
  });

  // Librarian signin form
  const [librarianSignin, setLibrarianSignin] = useState({
    librarianId: '',
    password: '',
  });

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(
        studentSignup.name,
        studentSignup.email,
        studentSignup.password,
        'student',
        studentSignup.studentId,
        studentSignup.phone
      );

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: 'You can now sign in with your credentials.',
      });

      setMode('signin');
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, use studentId as email until backend supports studentId login
      const { error } = await signIn(studentSignin.studentId, studentSignin.password);

      if (error) throw new Error(error);

      navigate('/student');
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLibrarianSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Hardcoded librarian credentials check
      if (librarianSignin.librarianId === 'LIB001' && librarianSignin.password === 'admin123') {
        // For now, use hardcoded email for librarian
        const { error } = await signIn('librarian@library.com', 'librarian123');

        if (error) {
          // If account doesn't exist, create it using the auth API
          const { error: signupError } = await signUp(
            'Head Librarian',
            'librarian@library.com',
            'librarian123',
            'librarian'
          );

          if (signupError) throw new Error(signupError);

          // Try signing in again
          const { error: retryError } = await signIn('librarian@library.com', 'librarian123');
          if (retryError) throw new Error(retryError);
        }

        navigate('/librarian');
      } else {
        throw new Error('Invalid librarian credentials');
      }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-primary rounded-full">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Library Management</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Role Selector */}
          <div className="space-y-3">
            <Label>Select Role</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="librarian" id="librarian" />
                <Label htmlFor="librarian" className="cursor-pointer">Librarian</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Student Forms */}
          {role === 'student' && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleStudentSignin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      value={studentSignin.studentId}
                      onChange={(e) => setStudentSignin({ ...studentSignin, studentId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={studentSignin.password}
                      onChange={(e) => setStudentSignin({ ...studentSignin, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleStudentSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={studentSignup.name}
                      onChange={(e) => setStudentSignup({ ...studentSignup, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-student-id">Student ID</Label>
                    <Input
                      id="signup-student-id"
                      value={studentSignup.studentId}
                      onChange={(e) => setStudentSignup({ ...studentSignup, studentId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={studentSignup.email}
                      onChange={(e) => setStudentSignup({ ...studentSignup, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={studentSignup.phone}
                      onChange={(e) => setStudentSignup({ ...studentSignup, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={studentSignup.password}
                      onChange={(e) => setStudentSignup({ ...studentSignup, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Librarian Form */}
          {role === 'librarian' && (
            <form onSubmit={handleLibrarianSignin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="librarian-id">Librarian ID</Label>
                <Input
                  id="librarian-id"
                  value={librarianSignin.librarianId}
                  onChange={(e) => setLibrarianSignin({ ...librarianSignin, librarianId: e.target.value })}
                  placeholder="LIB001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lib-password">Password</Label>
                <Input
                  id="lib-password"
                  type="password"
                  value={librarianSignin.password}
                  onChange={(e) => setLibrarianSignin({ ...librarianSignin, password: e.target.value })}
                  placeholder="admin123"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
