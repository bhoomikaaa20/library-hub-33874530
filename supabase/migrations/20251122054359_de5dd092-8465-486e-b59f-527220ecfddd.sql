-- Create profiles table for students
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'librarian');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  borrowed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Policies for books - everyone can view
CREATE POLICY "Anyone can view books"
  ON public.books FOR SELECT
  TO authenticated
  USING (true);

-- Only librarians can manage books
CREATE POLICY "Librarians can insert books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Librarians can update books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Librarians can delete books"
  ON public.books FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

-- Create borrow status enum
CREATE TYPE public.borrow_status AS ENUM (
  'pendingBorrow',
  'approvedBorrow',
  'rejectedBorrow',
  'pendingReturn',
  'returned'
);

-- Create borrow_records table
CREATE TABLE public.borrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  borrow_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  status borrow_status NOT NULL DEFAULT 'pendingBorrow',
  fine DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;

-- Policies for borrow_records
CREATE POLICY "Users can view their own records"
  ON public.borrow_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create borrow requests"
  ON public.borrow_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON public.borrow_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Librarians can view all records"
  ON public.borrow_records FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Librarians can update all records"
  ON public.borrow_records FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_borrow_records_updated_at
  BEFORE UPDATE ON public.borrow_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, student_id, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'student_id',
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();