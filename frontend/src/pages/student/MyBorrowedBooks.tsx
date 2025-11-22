import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';

export default function MyBorrowedBooks() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: borrows, isLoading } = useQuery({
        queryKey: ['borrows', user.id],
        queryFn: async () => {
            const response = await api.get('/borrow/user');
            return response.data;
        },
    });

    const returnMutation = useMutation({
        mutationFn: async (borrowId: string) => {
            const response = await api.put(`/borrow/${borrowId}/return`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrows', user.id] });
            toast({
                title: 'Book returned',
                description: 'The book has been successfully returned.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Return failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Filter to show only approved borrows without returnDate
    const activeBorrows = borrows?.filter(borrow =>
        borrow.status === 'approved' && !borrow.returnDate
    ) || [];

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
                <h1 className="text-3xl font-bold">My Borrowed Books</h1>
                <p className="text-muted-foreground">View and manage your currently borrowed books</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBorrows.map((borrow) => (
                    <Card key={borrow._id} className="hover:shadow-medium transition-shadow">
                        <CardHeader>
                            <div className="aspect-[3/4] mb-4 bg-muted rounded-lg flex items-center justify-center">
                                {borrow.book?.image_url ? (
                                    <img
                                        src={borrow.book.image_url}
                                        alt={borrow.book.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                                )}
                            </div>
                            <CardTitle>{borrow.book?.title}</CardTitle>
                            <CardDescription>{borrow.book?.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Borrow Date:</span>
                                    <span className="text-sm">
                                        {new Date(borrow.borrowDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Due Date:</span>
                                    <span className="text-sm">
                                        {new Date(borrow.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                disabled={returnMutation.isPending}
                                onClick={() => returnMutation.mutate(borrow._id)}
                            >
                                {returnMutation.isPending ? 'Returning...' : 'Return Book'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {activeBorrows.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No borrowed books</h3>
                    <p className="text-muted-foreground">You don't have any books currently borrowed</p>
                </div>
            )}
        </div>
    );
}