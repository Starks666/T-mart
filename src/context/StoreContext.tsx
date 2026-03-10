import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Order, User, Review, Question, Notification } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';
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
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tmart_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tmart_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tmart_users');
    return saved ? JSON.parse(saved) : [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com',
        password: 'admin',
        role: 'admin',
        joinedAt: new Date().toISOString()
      }
    ];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tmart_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('tmart_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem('tmart_products', JSON.stringify(products));
  }, [products]);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem('tmart_orders', JSON.stringify(orders));
  }, [orders]);

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

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('tmart_users', JSON.stringify(users));
  }, [users]);

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

  const addProduct = (productData: Omit<Product, 'id'>) => {
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
    setProducts(prev => [newProduct, ...prev]);
    toast.success('Product added successfully');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast.success('Product updated successfully');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.error('Product deleted');
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newReview: Review = {
          ...reviewData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        const updatedReviews = [...(p.productReviews || []), newReview];
        const newAvgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
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

  const addQuestion = (productId: string, questionData: Omit<Question, 'id' | 'createdAt'>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newQuestion: Question = {
          ...questionData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        return {
          ...p,
          questions: [...(p.questions || []), newQuestion]
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

  const placeOrder = (customerData: any, paymentData?: any) => {
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

    // Decrease stock
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    toast.success('Order placed successfully!');
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const updatedUser = (adminEmail && user.email === adminEmail) ? { ...user, role: 'admin' as const } : user;
      setCurrentUser(updatedUser);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    }
    toast.error('Invalid email or password');
    return false;
  };

  const signup = (userData: Omit<User, 'id' | 'role' | 'joinedAt'>) => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: (adminEmail && userData.email === adminEmail) ? 'admin' : 'user',
      joinedAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    toast.success('Account created successfully!');
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const updatedUser = { 
      ...currentUser, 
      ...updates,
      role: (adminEmail && (updates.email === adminEmail || currentUser.email === adminEmail)) ? 'admin' : currentUser.role
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    toast.success('Profile updated');
  };

  const updateOrderStatus = (orderId: string, status: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    toast.success(`Order ${status}`);
  };

  const requestRefund = (orderId: string, refundData: { reason: string; bankDetails: string }) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        refundRequest: { 
          ...refundData, 
          status: 'pending', 
          createdAt: new Date().toISOString() 
        } 
      } : order
    ));
    toast.success('Refund request submitted');
  };

  const completeRefund = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId && order.refundRequest ? { 
        ...order, 
        refundRequest: { ...order.refundRequest, status: 'completed' } 
      } : order
    ));
    toast.success('Refund completed');
  };

  const cancelOrder = (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    // Return stock if cancelled
    setProducts(pPrev => pPrev.map(p => {
      const orderItem = orderToCancel.items.find(item => item.id === p.id);
      if (orderItem) {
        return { ...p, stock: p.stock + orderItem.quantity };
      }
      return p;
    }));

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    
    toast.success('Order cancelled successfully');
  };

  const answerQuestion = (productId: string, questionId: string, answer: string) => {
    let targetUserId = '';
    let productName = '';

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        productName = p.name;
        return {
          ...p,
          questions: p.questions?.map(q => {
            if (q.id === questionId) {
              targetUserId = q.userId;
              return { ...q, answer };
            }
            return q;
          })
        };
      }
      return p;
    }));

    if (targetUserId) {
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        title: 'New Answer to Your Question',
        message: `An admin has replied to your question about ${productName}.`,
        link: `/product/${productId}?tab=questions`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    toast.success('Answer submitted');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = currentUser?.role === 'admin' || (currentUser?.email && import.meta.env.VITE_ADMIN_EMAIL && currentUser.email === import.meta.env.VITE_ADMIN_EMAIL);

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
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      isAdmin
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
