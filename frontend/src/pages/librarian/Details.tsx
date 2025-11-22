import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function LibrarianDetails() {
  const { data: records, isLoading } = useQuery({
    queryKey: ['all-borrow-records'],
    queryFn: async () => {
      const response = await api.get('/borrow');
      return response.data;
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
        <h1 className="text-3xl font-bold">Borrowing Details</h1>
        <p className="text-muted-foreground">Complete activity log of all borrowing records</p>
      </div>

      {records && records.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Book Title</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: any) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.user?.name || '-'}</TableCell>
                  <TableCell>{record.user?.email || '-'}</TableCell>
                  <TableCell>{record.book?.title}</TableCell>
                  <TableCell>
                    {record.borrowDate ? format(new Date(record.borrowDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.dueDate ? format(new Date(record.dueDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.returnDate ? format(new Date(record.returnDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No records found</h3>
          <p className="text-muted-foreground">Borrowing activity will appear here</p>
        </div>
      )}
    </div>
  );
}
