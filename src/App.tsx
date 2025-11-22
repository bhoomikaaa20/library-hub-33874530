import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/student/Dashboard";
import StudentBooks from "./pages/student/Books";
import StudentHistory from "./pages/student/History";
import LibrarianDashboard from "./pages/librarian/Dashboard";
import LibrarianBooks from "./pages/librarian/Books";
import LibrarianDetails from "./pages/librarian/Details";
import LibrarianRequests from "./pages/librarian/Requests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'student' | 'librarian' }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/student/books" replace />} />
              <Route path="books" element={<StudentBooks />} />
              <Route path="history" element={<StudentHistory />} />
            </Route>
            
            {/* Librarian Routes */}
            <Route path="/librarian" element={
              <ProtectedRoute requiredRole="librarian">
                <LibrarianDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/librarian/books" replace />} />
              <Route path="books" element={<LibrarianBooks />} />
              <Route path="details" element={<LibrarianDetails />} />
              <Route path="requests" element={<LibrarianRequests />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
