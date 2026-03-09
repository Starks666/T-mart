import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Order, User, Review, Question, Notification } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  addQuestion: (productId: string, question: Omit<Question, 'id' | 'createdAt'>) => Promise<void>;
  orders: Order[];
  placeOrder: (customerData: any, paymentData?: any) => Promise<void>;
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (user: Omit<User, 'id' | 'role' | 'joinedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  requestRefund: (orderId: string, refundData: { reason: string; bankDetails: string }) => Promise<void>;
  completeRefund: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  answerQuestion: (productId: string, questionId: string, answer: string) => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log('Starting data fetch...');
      
      const fetchPromise = (async () => {
        try {
          // Fetch Session
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Session fetched:', !!session);
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setCurrentUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                avatar: profile.avatar,
                joinedAt: profile.joined_at
              });
            }
          }

          // Fetch Products
          console.log('Fetching products...');
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (productsError) throw productsError;
          
          if (productsData && productsData.length > 0) {
            setProducts(productsData.map(p => ({
              ...p,
              productReviews: p.product_reviews,
              featured: p.featured || false
            })));
          } else {
            console.log('No products in DB, using mock data');
            setProducts(INITIAL_PRODUCTS);
          }

          // Fetch Orders (if logged in)
          if (session?.user) {
            const { data: ordersData } = await supabase
              .from('orders')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (ordersData) {
              setOrders(ordersData.map(o => ({
                ...o,
                createdAt: o.created_at,
                refundRequest: o.refund_request
              })));
            }

            // Fetch Notifications
            const { data: notificationsData } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false });
            
            if (notificationsData) {
              setNotifications(notificationsData.map(n => ({
                ...n,
                userId: n.user_id,
                isRead: n.is_read,
                createdAt: n.created_at
              })));
            }
          }

          // Fetch all users for admin
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*');
          
          if (profilesData) {
            setUsers(profilesData.map(p => ({
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              avatar: p.avatar,
              joinedAt: p.joined_at
            })));
          }
        } catch (err) {
          console.error('Inner fetch error:', err);
          throw err;
        }
      })();

      // 5 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fetch timeout')), 5000)
      );

      try {
        await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Data fetch completed successfully');
      } catch (error) {
        console.error('Error fetching data or timeout:', error);
        // Fallback to initial products if fetch fails or times out
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar: profile.avatar,
            joinedAt: profile.joined_at
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setOrders([]);
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
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

  const addToCart = (product: Product, quantity: number = 1) => {
    let isNewItem = false;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      isNewItem = true;
      return [...prev, { ...product, quantity }];
    });
    
    if (isNewItem) {
      toast.success(`Added ${product.name} to cart`);
    }
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
    const newId = Math.random().toString(36).substr(2, 9);
    const newProduct = {
      id: newId,
      name: productData.name,
      price: productData.price,
      category: productData.category,
      description: productData.description,
      image: productData.image,
      images: (productData as any).images || [productData.image],
      stock: productData.stock,
      rating: 4.5,
      reviews: 0,
      featured: true,
      specs: (productData as any).specs || {
        "Status": "New Arrival",
        "Warranty": "1 Year",
        "Shipping": "Free"
      },
      product_reviews: [],
      questions: []
    };

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      toast.error('Failed to add product');
      console.error(error);
      return;
    }

    setProducts(prev => [{ ...newProduct, productReviews: [] } as any, ...prev]);
    toast.success('Product added successfully');
  };

  const updateProduct = async (updatedProduct: Product) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        description: updatedProduct.description,
        image: updatedProduct.image,
        images: updatedProduct.images,
        stock: updatedProduct.stock,
        featured: updatedProduct.featured,
        specs: updatedProduct.specs
      })
      .eq('id', updatedProduct.id);

    if (error) {
      toast.error('Failed to update product');
      return;
    }

    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast.success('Product updated successfully');
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast.error('Failed to delete product');
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.error('Product deleted');
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
    
    const { error } = await supabase
      .from('products')
      .update({
        product_reviews: updatedReviews,
        rating: Number(newAvgRating.toFixed(1)),
        reviews: updatedReviews.length
      })
      .eq('id', productId);

    if (error) {
      toast.error('Failed to submit review');
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          productReviews: updatedReviews,
          rating: Number(newAvgRating.toFixed(1)),
          reviews: updatedReviews.length
        };
      }
      return p;
    }));
    toast.success('Review submitted successfully');
  };

  const addQuestion = async (productId: string, questionData: Omit<Question, 'id' | 'createdAt'>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newQuestion: Question = {
      ...questionData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    const updatedQuestions = [...(product.questions || []), newQuestion];

    const { error } = await supabase
      .from('products')
      .update({ questions: updatedQuestions })
      .eq('id', productId);

    if (error) {
      toast.error('Failed to submit question');
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          questions: updatedQuestions
        };
      }
      return p;
    }));
    toast.success('Question submitted successfully');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('tmart_cart');
  };

  const placeOrder = async (customerData: any, paymentData?: any) => {
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.id,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customer: customerData,
      payment: paymentData || { method: 'cod', status: 'pending' }
    };

    const { error } = await supabase.from('orders').insert([{
      id: newOrder.id,
      user_id: newOrder.userId,
      items: newOrder.items,
      total: newOrder.total,
      status: newOrder.status,
      customer: newOrder.customer,
      payment: newOrder.payment,
      created_at: newOrder.createdAt
    }]);

    if (error) {
      toast.error('Failed to place order');
      return;
    }

    // Update stock in DB
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.id);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    // Toast is handled in Checkout.tsx or here
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success('Welcome back!');
    return true;
  };

  const signup = async (userData: Omit<User, 'id' | 'role' | 'joinedAt'>) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: 'user'
      }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    toast.success('Account created successfully!');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        avatar: updates.avatar
      })
      .eq('id', currentUser.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    toast.success('Profile updated');
  };

  const updateOrderStatus = async (orderId: string, status: any) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    toast.success(`Order ${status}`);
  };

  const requestRefund = async (orderId: string, refundData: { reason: string; bankDetails: string }) => {
    const refundRequest = { 
      ...refundData, 
      status: 'pending', 
      createdAt: new Date().toISOString() 
    };

    const { error } = await supabase
      .from('orders')
      .update({ refund_request: refundRequest })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to submit refund request');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, refundRequest: refundRequest as any } : order
    ));
    toast.success('Refund request submitted');
  };

  const completeRefund = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.refundRequest) return;

    const updatedRefundRequest = { ...order.refundRequest, status: 'completed' };

    const { error } = await supabase
      .from('orders')
      .update({ refund_request: updatedRefundRequest })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to complete refund');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        refundRequest: updatedRefundRequest as any 
      } : order
    ));
    toast.success('Refund completed');
  };

  const cancelOrder = async (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to cancel order');
      return;
    }

    // Return stock
    for (const item of orderToCancel.items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock + item.quantity })
          .eq('id', item.id);
      }
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    
    toast.success('Order cancelled successfully');
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

    const { error } = await supabase
      .from('products')
      .update({ questions: updatedQuestions })
      .eq('id', productId);

    if (error) {
      toast.error('Failed to submit answer');
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, questions: updatedQuestions };
      }
      return p;
    }));

    if (targetUserId) {
      const newNotification = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: targetUserId,
        title: 'New Answer to Your Question',
        message: `An admin has replied to your question about ${product.name}.`,
        link: `/product/${productId}?tab=questions`,
        is_read: false,
        created_at: new Date().toISOString()
      };

      await supabase.from('notifications').insert([newNotification]);
      
      setNotifications(prev => [{
        id: newNotification.id,
        userId: newNotification.user_id,
        title: newNotification.title,
        message: newNotification.message,
        link: newNotification.link,
        isRead: newNotification.is_read,
        createdAt: newNotification.created_at
      }, ...prev]);
    }

    toast.success('Answer submitted');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) return;

    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
      logout,
      updateCurrentUser,
      updateOrderStatus,
      requestRefund,
      completeRefund,
      cancelOrder,
      answerQuestion,
      notifications,
      markNotificationAsRead,
      isLoading,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
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
