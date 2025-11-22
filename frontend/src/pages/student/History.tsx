import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function StudentHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ['borrowRecords', user?.id],
    queryFn: async () => {
      const response = await api.get('/borrow/user');
      return response.data;
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await api.put(`/borrow/${recordId}/status`, { status: 'pendingReturn' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowRecords'] });
      toast({
        title: 'Return requested',
        description: 'Your return request has been sent to the librarian.',
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Borrowed' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      returned: { variant: 'outline', label: 'Returned' },
    };

    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
        <h1 className="text-3xl font-bold">Borrowing History</h1>
        <p className="text-muted-foreground">Track your borrowed books and returns</p>
      </div>

      {records && records.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.books.title}</TableCell>
                  <TableCell>
                    {record.borrow_date ? format(new Date(record.borrow_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.due_date ? format(new Date(record.due_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.return_date ? format(new Date(record.return_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    {record.fine > 0 ? `$${Number(record.fine).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {record.status === 'approvedBorrow' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => returnMutation.mutate(record.id)}
                        disabled={returnMutation.isPending}
                      >
                        Request Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No borrowing history</h3>
          <p className="text-muted-foreground">Start borrowing books to see your history here</p>
        </div>
      )}
    </div>
  );
}
