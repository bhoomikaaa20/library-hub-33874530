import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function LibrarianDetails() {
  const { data: records, isLoading } = useQuery({
    queryKey: ['all-borrow-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrow_records')
        .select(`
          *,
          books (
            title,
            author
          ),
          profiles (
            name,
            student_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendingBorrow: { variant: 'secondary', label: 'Pending' },
      approvedBorrow: { variant: 'default', label: 'Borrowed' },
      rejectedBorrow: { variant: 'destructive', label: 'Rejected' },
      pendingReturn: { variant: 'secondary', label: 'Return Pending' },
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
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.profiles?.name || '-'}</TableCell>
                  <TableCell>{record.profiles?.student_id || '-'}</TableCell>
                  <TableCell>{record.books.title}</TableCell>
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
                    {record.fine > 0 ? (
                      <span className="text-destructive font-medium">
                        ${Number(record.fine).toFixed(2)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
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
