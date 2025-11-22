import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { BookOpen, FileText, Inbox, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Librarian Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <NavLink
                to="/librarian/books"
                className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
                activeClassName="bg-muted font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Books
                </span>
              </NavLink>

              <NavLink
                to="/librarian/details"
                className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
                activeClassName="bg-muted font-medium"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </span>
              </NavLink>

              <NavLink
                to="/librarian/requests"
                className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
                activeClassName="bg-muted font-medium"
              >
                <span className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  Requests
                </span>
              </NavLink>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
