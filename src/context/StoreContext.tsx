import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Order, User, Review, Question, Notification } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';
import { supabaseService } from '../services/supabaseService';
import toast from 'react-hot-toast';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  addQuestion: (productId: string, question: Omit<Question, 'id' | 'createdAt'>) => void;
  orders: Order[];
  placeOrder: (customerData: any, paymentData?: any) => void;
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  signup: (user: Omit<User, 'id' | 'role' | 'joinedAt'>) => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  requestRefund: (orderId: string, refundData: { reason: string; bankDetails: string }) => void;
  completeRefund: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  answerQuestion: (productId: string, questionId: string, answer: string) => void;
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tmart_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('tmart_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load data from Supabase...');
        // Add a timeout to the initial load
        const dataPromise = Promise.all([
          supabaseService.getProducts(),
          supabaseService.getOrders(),
          supabaseService.getUsers()
        ]);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase timeout')), 10000)
        );

        const [dbProducts, dbOrders, dbUsers] = await Promise.race([dataPromise, timeoutPromise]) as any;
        console.log('Data loaded successfully');

        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          // If DB is empty, seed it with initial products (non-blocking)
          console.log('Seeding database...');
          Promise.all(INITIAL_PRODUCTS.map(p => supabaseService.upsertProduct(p)))
            .catch(err => console.error('Failed to seed products:', err));
          setProducts(INITIAL_PRODUCTS);
        }

        if (dbOrders) setOrders(dbOrders);
        
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        } else {
          // No users in DB, system is fresh
          setUsers([]);
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Safety timeout to ensure app always loads
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('tmart_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('tmart_cart', JSON.stringify(cart));
  }, [cart]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tmart_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tmart_current_user');
    }
  }, [currentUser]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('tmart_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      toast.success(`Added ${product.name} to cart`);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast.error('Removed from cart');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      images: (productData as any).images || [productData.image],
      specs: (productData as any).specs || {
        "Status": "New Arrival",
        "Warranty": "1 Year",
        "Shipping": "Free"
      },
      featured: true
    };
    
    try {
      await supabaseService.upsertProduct(newProduct);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product added to database');
    } catch (error) {
      console.error('Failed to add product to Supabase:', error);
      toast.error('Failed to save to database. Please check your connection.');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await supabaseService.upsertProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Failed to update product in Supabase:', error);
      toast.error('Failed to sync with database');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await supabaseService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.error('Product deleted');
    } catch (error) {
      console.error('Failed to delete product from Supabase:', error);
      toast.error('Failed to delete from database');
    }
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updatedReviews = [...(product.productReviews || []), newReview];
    const newAvgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
    
    const updatedProduct = {
      ...product,
      productReviews: updatedReviews,
      rating: Number(newAvgRating.toFixed(1)),
      reviews: updatedReviews.length
    };

    try {
      await supabaseService.upsertProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Failed to save review to Supabase:', error);
      toast.error('Failed to save review to database');
    }
  };

  const addQuestion = async (productId: string, questionData: Omit<Question, 'id' | 'createdAt'>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newQuestion: Question = {
      ...questionData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    const updatedProduct = {
      ...product,
      questions: [...(product.questions || []), newQuestion]
    };

    try {
      await supabaseService.upsertProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      toast.success('Question submitted successfully');
    } catch (error) {
      console.error('Failed to save question to Supabase:', error);
      toast.error('Failed to save question to database');
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('tmart_cart');
  };

  const placeOrder = async (customerData: any, paymentData?: any) => {
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: currentUser?.id,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customer: customerData,
      payment: paymentData || { method: 'cod', status: 'pending' }
    };

    try {
      await supabaseService.createOrder(newOrder);
      
      // Decrease stock in Supabase
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await supabaseService.upsertProduct({
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Failed to place order in Supabase:', error);
      toast.error('Failed to sync order with database');
    }
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    }
    toast.error('Invalid email or password');
    return false;
  };

  const signup = async (userData: Omit<User, 'id' | 'role' | 'joinedAt'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: 'user', // Default role is always user
      joinedAt: new Date().toISOString()
    };
    
    try {
      await supabaseService.createProfile(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Failed to save user to Supabase:', error);
      toast.error('Failed to save account to database');
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      await supabaseService.resetPassword(email, newPassword);
      setUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
      toast.success('Password reset successfully!');
      return true;
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Failed to reset password. Please check your email.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { 
      ...currentUser, 
      ...updates
    };

    try {
      await supabaseService.updateProfile(currentUser.id, updatedUser);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      toast.success('Profile updated');
    } catch (error) {
      console.error('Failed to update profile in Supabase:', error);
      toast.error('Failed to update profile in database');
    }
  };

  const updateOrderStatus = async (orderId: string, status: any) => {
    try {
      await supabaseService.updateOrder(orderId, { status });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      toast.success(`Order ${status}`);
    } catch (error) {
      console.error('Failed to update order status in Supabase:', error);
      toast.error('Failed to update status in database');
    }
  };

  const requestRefund = async (orderId: string, refundData: { reason: string; bankDetails: string }) => {
    const refundRequest = { 
      ...refundData, 
      status: 'pending' as const, 
      createdAt: new Date().toISOString() 
    };
    
    try {
      await supabaseService.updateOrder(orderId, { refundRequest });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, refundRequest } : order
      ));
      toast.success('Refund request submitted');
    } catch (error) {
      console.error('Failed to request refund in Supabase:', error);
      toast.error('Failed to save refund request to database');
    }
  };

  const completeRefund = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.refundRequest) return;

    const updatedRefundRequest = { ...order.refundRequest, status: 'completed' };
    
    try {
      await supabaseService.updateOrder(orderId, { refundRequest: updatedRefundRequest });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { 
          ...order, 
          refundRequest: updatedRefundRequest 
        } : order
      ));
      toast.success('Refund completed');
    } catch (error) {
      console.error('Failed to complete refund in Supabase:', error);
      toast.error('Failed to update refund status in database');
    }
  };

  const cancelOrder = async (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    try {
      await supabaseService.updateOrder(orderId, { status: 'cancelled' });
      
      // Return stock if cancelled
      for (const item of orderToCancel.items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await supabaseService.upsertProduct({
            ...product,
            stock: product.stock + item.quantity
          });
        }
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      // Update local products state too
      setProducts(pPrev => pPrev.map(p => {
        const orderItem = orderToCancel.items.find(item => item.id === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock + orderItem.quantity };
        }
        return p;
      }));
      
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order in Supabase:', error);
      toast.error('Failed to cancel order in database');
    }
  };

  const answerQuestion = async (productId: string, questionId: string, answer: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let targetUserId = '';
    const updatedQuestions = product.questions?.map(q => {
      if (q.id === questionId) {
        targetUserId = q.userId;
        return { ...q, answer };
      }
      return q;
    });

    const updatedProduct = {
      ...product,
      questions: updatedQuestions
    };

    try {
      await supabaseService.upsertProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));

      if (targetUserId) {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          userId: targetUserId,
          title: 'New Answer to Your Question',
          message: `An admin has replied to your question about ${product.name}.`,
          link: `/product/${productId}?tab=questions`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        await supabaseService.createNotification(newNotification);
        setNotifications(prev => [newNotification, ...prev]);
      }

      toast.success('Answer submitted');
    } catch (error) {
      console.error('Failed to answer question in Supabase:', error);
      toast.error('Failed to save answer to database');
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = currentUser?.role === 'admin';

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await supabaseService.updateProfile(userId, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, role } : null);
      }
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role in database');
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addProduct,
      updateProduct,
      deleteProduct,
      addReview,
      addQuestion,
      orders,
      placeOrder,
      users,
      currentUser,
      login,
      signup,
      resetPassword,
      logout,
      updateCurrentUser,
      updateUserRole,
      updateOrderStatus,
      requestRefund,
      completeRefund,
      cancelOrder,
      answerQuestion,
      notifications,
      markNotificationAsRead,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      isAdmin,
      isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
