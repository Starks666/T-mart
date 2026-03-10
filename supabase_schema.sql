-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image TEXT,
  images TEXT[],
  category TEXT,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  specs JSONB,
  productReviews JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  userId TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  customer JSONB NOT NULL,
  payment JSONB NOT NULL,
  refundRequest JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (for users)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Note: In a real app, use Supabase Auth and don't store passwords here
  role TEXT DEFAULT 'user',
  avatar TEXT,
  joinedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
-- For this demo, we'll allow all access, but in production, you'd restrict this.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Trigger to ensure only the authorized email can be an admin
CREATE OR REPLACE FUNCTION check_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Replace 'your-admin-email@example.com' with your actual admin email
  IF NEW.role = 'admin' AND NEW.email != 'your-admin-email@example.com' THEN
    RAISE EXCEPTION 'Only the authorized administrator email can have the admin role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_admin ON profiles;
CREATE TRIGGER ensure_single_admin
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION check_admin_email();

CREATE POLICY "Allow public access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow all access to products for demo" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to orders for demo" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all access to profiles for demo" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications for demo" ON notifications FOR ALL USING (true);
