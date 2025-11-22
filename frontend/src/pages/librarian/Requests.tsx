import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { Check, X, Loader2 } from 'lucide-react';

export default function LibrarianRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const response = await api.get('/borrow');
      return response.data.filter((r: any) => ['pending', 'pendingReturn'].includes(r.status));
    },
  });

  const handleBorrowMutation = useMutation({
    mutationFn: async ({ recordId, bookId, accept }: { recordId: string; bookId: string; accept: boolean }) => {
      const status = accept ? 'approved' : 'rejected';
      const response = await api.put(`/borrow/${recordId}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['librarian-books'] });
      toast({
        title: variables.accept ? 'Request approved' : 'Request rejected',
        description: `The borrow request has been ${variables.accept ? 'approved' : 'rejected'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleReturnMutation = useMutation({
    mutationFn: async ({ recordId, bookId, dueDate, accept }: { recordId: string; bookId: string; dueDate: string; accept: boolean }) => {
      const status = accept ? 'returned' : 'rejected';
      const response = await api.put(`/borrow/${recordId}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['librarian-books'] });
      toast({
        title: variables.accept ? 'Return approved' : 'Return rejected',
        description: `The return request has been ${variables.accept ? 'approved' : 'rejected'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
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

  const borrowRequests = requests?.filter((r: any) => r.status === 'pending' && r.book) || [];
  const returnRequests = requests?.filter((r: any) => r.status === 'pendingReturn' && r.book) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Request Handler</h1>
        <p className="text-muted-foreground">Approve or reject borrowing and return requests</p>
      </div>

      {/* Borrow Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Borrow Requests</h2>
          <Badge variant="secondary">{borrowRequests.length} pending</Badge>
        </div>

        {borrowRequests.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRequests.map((request: any) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">{request.user?.name}</TableCell>
                    <TableCell>{request.user?.studentId}</TableCell>
                    <TableCell>{request.book.title}</TableCell>
                    <TableCell>{request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleBorrowMutation.mutate({
                              recordId: request._id,
                              bookId: request.book._id,
                              accept: true,
                            })
                          }
                          disabled={handleBorrowMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleBorrowMutation.mutate({
                              recordId: request._id,
                              bookId: request.book._id,
                              accept: false,
                            })
                          }
                          disabled={handleBorrowMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No pending borrow requests</p>
          </div>
        )}
      </div>

      {/* Return Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Return Requests</h2>
          <Badge variant="secondary">{returnRequests.length} pending</Badge>
        </div>

        {returnRequests.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnRequests.map((request: any) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">{request.user?.name}</TableCell>
                    <TableCell>{request.user?.studentId}</TableCell>
                    <TableCell>{request.book.title}</TableCell>
                    <TableCell>{format(new Date(request.borrowDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <span
                        className={
                          new Date() > new Date(request.dueDate)
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {format(new Date(request.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleReturnMutation.mutate({
                              recordId: request._id,
                              bookId: request.book._id,
                              dueDate: request.dueDate,
                              accept: true,
                            })
                          }
                          disabled={handleReturnMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleReturnMutation.mutate({
                              recordId: request._id,
                              bookId: request.book._id,
                              dueDate: request.dueDate,
                              accept: false,
                            })
                          }
                          disabled={handleReturnMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No pending return requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
