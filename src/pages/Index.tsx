import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Library } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'student') {
        navigate('/student/books');
      } else if (role === 'librarian') {
        navigate('/librarian/books');
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-medium">
              <BookOpen className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Library Management System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive solution for managing library operations, book borrowing, and student records
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="shadow-soft">
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Library className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Book Management</CardTitle>
              <CardDescription>
                Comprehensive system to manage your library's entire book collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Add, edit, and delete books</li>
                <li>• Track stock and availability</li>
                <li>• Monitor borrowed books</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-2">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Easy-to-use interface for students to browse and borrow books
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Browse available books</li>
                <li>• Submit borrow requests</li>
                <li>• Track borrowing history</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Request Management</CardTitle>
              <CardDescription>
                Streamlined approval system for borrowing and return requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Approve/reject requests</li>
                <li>• Calculate late fines</li>
                <li>• View activity logs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
