import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';

export default function StudentBooks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await api.get('/books');
      return response.data;
    },
  });

  const borrowMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await api.post('/borrow/request', {
        bookId: bookId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: 'Request submitted',
        description: 'Your borrow request has been sent to the librarian.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Books</h1>
        <p className="text-muted-foreground">Browse and borrow books from our collection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.map((book) => {
          const available = book.stock - book.borrowed_count;
          const canBorrow = available > 0;

          return (
            <Card key={book.id} className="hover:shadow-medium transition-shadow">
              <CardHeader>
                <div className="aspect-[3/4] mb-4 bg-muted rounded-lg flex items-center justify-center">
                  {book.image_url ? (
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {book.description || 'No description available'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {available} of {book.stock} available
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${canBorrow
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                      }`}
                  >
                    {canBorrow ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!canBorrow || borrowMutation.isPending}
                  onClick={() => borrowMutation.mutate(book.id)}
                >
                  {borrowMutation.isPending ? 'Requesting...' : 'Borrow Book'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {books?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No books available</h3>
          <p className="text-muted-foreground">Check back later for new additions</p>
        </div>
      )}
    </div>
  );
}
