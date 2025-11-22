import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { Check, X, Loader2 } from 'lucide-react';

export default function LibrarianRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrow_records')
        .select(`
          *,
          books (
            id,
            title,
            author,
            stock,
            borrowed_count
          ),
          profiles (
            name,
            student_id
          )
        `)
        .in('status', ['pendingBorrow', 'pendingReturn'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleBorrowMutation = useMutation({
    mutationFn: async ({ recordId, bookId, accept }: { recordId: string; bookId: string; accept: boolean }) => {
      if (accept) {
        // Update record with approval
        const borrowDate = new Date();
        const dueDate = addDays(borrowDate, 14); // 2 weeks borrow period

        const { error: recordError } = await supabase
          .from('borrow_records')
          .update({
            status: 'approvedBorrow',
            borrow_date: borrowDate.toISOString(),
            due_date: dueDate.toISOString(),
          })
          .eq('id', recordId);

        if (recordError) throw recordError;

        // Increment borrowed count
        const { error: bookError } = await supabase.rpc('increment_borrowed_count', {
          book_id: bookId,
        });

        if (bookError) throw bookError;
      } else {
        // Reject request
        const { error } = await supabase
          .from('borrow_records')
          .update({ status: 'rejectedBorrow' })
          .eq('id', recordId);

        if (error) throw error;
      }
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
      if (accept) {
        const returnDate = new Date();
        const due = new Date(dueDate);
        const daysLate = differenceInDays(returnDate, due);
        const fine = daysLate > 0 ? daysLate * 1.0 : 0; // $1 per day fine

        // Update record
        const { error: recordError } = await supabase
          .from('borrow_records')
          .update({
            status: 'returned',
            return_date: returnDate.toISOString(),
            fine: fine,
          })
          .eq('id', recordId);

        if (recordError) throw recordError;

        // Decrement borrowed count
        const { error: bookError } = await supabase.rpc('decrement_borrowed_count', {
          book_id: bookId,
        });

        if (bookError) throw bookError;
      } else {
        // Reject return
        const { error } = await supabase
          .from('borrow_records')
          .update({ status: 'approvedBorrow' })
          .eq('id', recordId);

        if (error) throw error;
      }
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

  const borrowRequests = requests?.filter((r: any) => r.status === 'pendingBorrow') || [];
  const returnRequests = requests?.filter((r: any) => r.status === 'pendingReturn') || [];

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
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.profiles?.name}</TableCell>
                    <TableCell>{request.profiles?.student_id}</TableCell>
                    <TableCell>{request.books.title}</TableCell>
                    <TableCell>{format(new Date(request.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleBorrowMutation.mutate({
                              recordId: request.id,
                              bookId: request.books.id,
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
                              recordId: request.id,
                              bookId: request.books.id,
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
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.profiles?.name}</TableCell>
                    <TableCell>{request.profiles?.student_id}</TableCell>
                    <TableCell>{request.books.title}</TableCell>
                    <TableCell>{format(new Date(request.borrow_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <span
                        className={
                          new Date() > new Date(request.due_date)
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {format(new Date(request.due_date), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleReturnMutation.mutate({
                              recordId: request.id,
                              bookId: request.books.id,
                              dueDate: request.due_date,
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
                              recordId: request.id,
                              bookId: request.books.id,
                              dueDate: request.due_date,
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
