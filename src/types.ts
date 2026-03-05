export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  text: string;
  answer?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  featured?: boolean;
  specs: Record<string, string>;
  productReviews?: Review[];
  questions?: Question[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  joinedAt?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'rejected' | 'cancelled';
  refundRequest?: {
    reason: string;
    bankDetails: string;
    status: 'pending' | 'completed';
    createdAt: string;
  };
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  payment?: {
    method: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
    transactionId?: string;
    status: 'pending' | 'paid';
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export type Category = 'Audio' | 'Computing' | 'Wearables' | 'Smart Home';
