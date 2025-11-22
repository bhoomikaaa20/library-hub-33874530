-- Create function to increment borrowed count
CREATE OR REPLACE FUNCTION public.increment_borrowed_count(book_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.books
  SET borrowed_count = borrowed_count + 1
  WHERE id = book_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create function to decrement borrowed count
CREATE OR REPLACE FUNCTION public.decrement_borrowed_count(book_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.books
  SET borrowed_count = GREATEST(borrowed_count - 1, 0)
  WHERE id = book_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;