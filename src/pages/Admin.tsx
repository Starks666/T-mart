import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Package, Users, ShoppingCart, TrendingUp, ArrowUpRight, Plus, Search, X, Upload, MessageSquare, Reply, AlertCircle, CreditCard, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { CATEGORIES } from '../data/mockData';
import { Order, Product, Question } from '../types';

export default function Admin() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, completeRefund, answerQuestion, currentUser, isAdmin, users, updateUserRole } = useStore();
  
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'revenue' | 'orders' | 'customers' | 'refunds' | 'users'>('inventory');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ productId: string, question: Question } | null>(null);
  const [answerText, setAnswerText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const refundRequestsCount = orders.filter(o => o.refundRequest && o.refundRequest.status === 'pending').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  const allQuestions = products.flatMap(p => 
    (p.questions || []).map(q => ({ ...q, productId: p.id, productName: p.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: CATEGORIES[0],
    description: '',
    image: 'https://picsum.photos/seed/tech/800/800',
    stock: 0,
    rating: 4.5,
    reviews: 0
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: 0,
        category: CATEGORIES[0],
        description: '',
        image: `https://picsum.photos/seed/${Math.random()}/800/800`,
        stock: 0,
        rating: 4.5,
        reviews: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...formData, id: editingProduct.id });
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const uniqueCustomers = Array.from(new Set(orders.map(o => o.customer.email))).map(email => {
    return orders.find(o => o.customer.email === email)?.customer;
  });

  const stats = [
    { id: 'revenue', label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+12.5%', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'orders', label: 'Active Orders', value: orders.length.toString(), change: '+3', icon: ShoppingCart, color: 'text-primary' },
    { id: 'inventory', label: 'Total Products', value: products.length.toString(), change: '0', icon: Package, color: 'text-secondary' },
    { id: 'customers', label: 'New Customers', value: uniqueCustomers.length.toString(), change: '+18%', icon: Users, color: 'text-accent' },
    { id: 'users', label: 'Manage Roles', value: users.length.toString(), change: 'Admin Access', icon: Users, color: 'text-purple-400' },
    { id: 'refunds', label: 'Refunds/Cancels', value: (refundRequestsCount + cancelledOrdersCount).toString(), change: refundRequestsCount > 0 ? 'Action Required' : '0', icon: AlertCircle, color: 'text-red-400' },
  ];

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold">Admin <span className="text-gradient">Dashboard</span></h1>
          <p className="opacity-50">Manage your futuristic empire from one central hub.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveTab(stat.id as any)}
            className={`glass-card p-6 space-y-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              activeTab === stat.id ? 'ring-2 ring-primary bg-primary/5' : ''
            } ${stat.id === 'orders' && pendingOrdersCount > 0 ? 'animate-pulse ring-2 ring-red-500/50 bg-red-500/5' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.id === 'orders' && pendingOrdersCount > 0 ? 'text-red-500' : stat.color} relative`}>
                <stat.icon className="w-6 h-6" />
                {stat.id === 'orders' && pendingOrdersCount > 0 && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg"
                  >
                    {pendingOrdersCount}
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-30">{stat.label}</p>
              <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Content Area */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          {activeTab === 'inventory' && (
            <>
              <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                <h3 className="font-display font-bold text-xl">Inventory Management</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input type="text" placeholder="Search inventory..." className="pl-10 pr-4 py-2 rounded-full glass text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-center">Stock</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div 
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="flex items-center gap-3 cursor-pointer group/item"
                          >
                            {product.image && (
                              <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover group-hover/item:scale-105 transition-transform" referrerPolicy="no-referrer" />
                            )}
                            <span className="font-medium group-hover/item:text-primary transition-colors">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 opacity-50">{product.category}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.stock < 10 ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="text-primary hover:text-primary/80 transition-colors font-bold uppercase text-[10px] tracking-widest"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-400 hover:text-red-600 transition-colors font-bold uppercase text-[10px] tracking-widest"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="p-6 border-b border-primary/10">
                <h3 className="font-display font-bold text-xl">Active Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer group/row"
                      >
                        <td className="px-6 py-4 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-2 h-2 rounded-full bg-red-500"
                              />
                            )}
                            {order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                              {order.payment?.method === 'cod' ? 'COD' : order.payment?.method || 'COD'}
                            </span>
                            {order.payment?.method !== 'cod' && order.payment?.transactionId && (
                              <span className="text-[8px] font-mono opacity-40">
                                {order.payment.transactionId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 opacity-50">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                        </td>
                        <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                            {order.status !== 'pending' && (
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                order.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-500' :
                                order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {order.status}
                              </span>
                            )}
                            
                            {order.status === 'pending' && (
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                  className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'rejected')}
                                  className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {order.refundRequest && order.refundRequest.status === 'pending' && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-amber-500">Refund Requested</span>
                                <button 
                                  onClick={() => completeRefund(order.id)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                  Process Refund
                                </button>
                              </div>
                            )}

                            {order.refundRequest && order.refundRequest.status === 'completed' && (
                              <span className="text-[8px] font-bold uppercase tracking-tighter text-emerald-500">Refund Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center opacity-30">No active orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'revenue' && (
            <>
              <div className="p-6 border-b border-primary/10">
                <h3 className="font-display font-bold text-xl">Revenue Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4 text-center">Quantity Sold</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.from(new Set(orders.flatMap(o => o.items.map(i => i.id)))).map(id => {
                      const item = orders.flatMap(o => o.items).find(i => i.id === id);
                      const qty = orders.flatMap(o => o.items).filter(i => i.id === id).reduce((acc, i) => acc + i.quantity, 0);
                      return (
                        <tr key={id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-medium">{item?.name}</td>
                          <td className="px-6 py-4 text-center">{qty}</td>
                          <td className="px-6 py-4 text-right font-medium">{formatPrice((item?.price || 0) * qty)}</td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center opacity-30">No sales data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'customers' && (
            <>
              <div className="p-6 border-b border-primary/10">
                <h3 className="font-display font-bold text-xl">Customer Directory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {uniqueCustomers.sort((a, b) => {
                      const dateA = orders.find(o => o.customer.email === a?.email)?.createdAt || '';
                      const dateB = orders.find(o => o.customer.email === b?.email)?.createdAt || '';
                      return new Date(dateB).getTime() - new Date(dateA).getTime();
                    }).map((customer, i) => (
                      <tr key={i} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium">{customer?.firstName} {customer?.lastName}</p>
                          <p className="text-[10px] opacity-50">{customer?.email}</p>
                        </td>
                        <td className="px-6 py-4 opacity-50">{customer?.city}, {customer?.zipCode}</td>
                        <td className="px-6 py-4 opacity-50">
                          {new Date(orders.find(o => o.customer.email === customer?.email)?.createdAt || '').toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {uniqueCustomers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center opacity-30">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="p-6 border-b border-primary/10">
                <h3 className="font-display font-bold text-xl">User Role Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Current Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-[10px] opacity-50">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-white/10 text-white/50'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => updateUserRole(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border border-primary/20 transition-all ${
                                user.role === 'admin' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 text-primary'
                              }`}
                            >
                              Make Admin
                            </button>
                            <button 
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={user.role === 'user' || ['fahimfahim27122003@gmail.com', 'calvinstarks666@gmail.com'].includes(user.email)}
                              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border border-red-500/20 transition-all ${
                                user.role === 'user' || ['fahimfahim27122003@gmail.com', 'calvinstarks666@gmail.com'].includes(user.email) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-500/10 text-red-400'
                              }`}
                            >
                              Make User
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'refunds' && (
            <>
              <div className="p-6 border-b border-primary/10">
                <h3 className="font-display font-bold text-xl">Refunds & Cancellations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.filter(o => o.status === 'cancelled' || o.refundRequest).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                      <tr key={order.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                          <p className="text-[10px] opacity-50">{order.customer.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'cancelled' ? 'bg-white/10 text-white/50' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {order.status === 'cancelled' ? 'Cancellation' : 'Refund Request'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs opacity-60 max-w-[200px] truncate">
                            {order.refundRequest?.reason || 'Order cancelled by customer'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.refundRequest && order.refundRequest.status === 'pending' ? (
                            <button 
                              onClick={() => completeRefund(order.id)}
                              className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              Process Refund
                            </button>
                          ) : order.refundRequest?.status === 'completed' ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 opacity-50">Completed</span>
                          ) : (
                            <button 
                              onClick={() => setSelectedOrderForDetails(order)}
                              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.filter(o => o.status === 'cancelled' || o.refundRequest).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center opacity-30">No refund or cancellation requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Q/A Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl">Product Q/A</h3>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {allQuestions.map((q, i) => (
              <div key={i} className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{q.productName}</p>
                    <p className="text-xs font-bold">{q.userName}</p>
                  </div>
                  <p className="text-[8px] uppercase tracking-widest opacity-30">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm opacity-80 italic">"{q.text}"</p>
                
                {q.answer ? (
                  <div className="pl-4 border-l-2 border-primary/30 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Admin Reply</p>
                    <p className="text-sm opacity-60">{q.answer}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setReplyingTo({ productId: q.productId, question: q as any });
                      setAnswerText('');
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    Reply to Question
                  </button>
                )}
              </div>
            ))}
            {allQuestions.length === 0 && (
              <div className="py-12 text-center opacity-30">
                <p className="text-sm">No questions asked yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingTo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplyingTo(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-card p-6 md:p-8 space-y-4 md:space-y-6 mx-auto"
            >
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-display font-bold">Reply to Question</h3>
                <p className="text-xs md:text-sm opacity-50 italic">"{replyingTo.question.text}"</p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Your Answer</label>
                  <textarea 
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:border-primary h-24 md:h-32 resize-none"
                  />
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="flex-1 btn-outline py-3 md:py-4 text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!answerText) return;
                      answerQuestion(replyingTo.productId, replyingTo.question.id, answerText);
                      setReplyingTo(null);
                    }}
                    className="flex-1 btn-primary py-3 md:py-4 text-xs md:text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-4 md:p-6 space-y-3 md:space-y-4 mx-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-display font-bold">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative group flex-shrink-0">
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl object-cover border-2 border-primary/20"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                    >
                      <Upload className="w-3 h-3 md:w-4 md:h-4 mb-0.5" />
                      <p className="text-[6px] md:text-[8px] font-bold uppercase">Upload</p>
                    </button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Image URL</label>
                    <input 
                      required
                      type="text" 
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-[10px] md:text-xs focus:outline-none focus:border-primary"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-xs md:text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Quantum Watch"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Price (৳)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-xs md:text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-xs md:text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-xs md:text-sm focus:outline-none focus:border-primary bg-bg-base"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg glass text-xs md:text-sm focus:outline-none focus:border-primary h-16 md:h-20 resize-none"
                    placeholder="Describe the future..."
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2 md:py-3 text-sm md:text-base mt-1 md:mt-2">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrderForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderForDetails(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden mx-auto"
            >
              <div className="p-4 md:p-8 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold">Order Details</h3>
                  <p className="text-[10px] font-mono opacity-50 mt-1">{selectedOrderForDetails.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto space-y-6 md:space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Customer Info</h4>
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-bold">{selectedOrderForDetails.customer.firstName} {selectedOrderForDetails.customer.lastName}</p>
                      <p className="text-xs md:text-sm opacity-60">{selectedOrderForDetails.customer.email}</p>
                      <p className="text-xs md:text-sm opacity-60">{selectedOrderForDetails.customer.address}</p>
                      <p className="text-xs md:text-sm opacity-60">{selectedOrderForDetails.customer.city}, {selectedOrderForDetails.customer.zipCode}</p>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Payment Info</h4>
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-bold uppercase text-primary">
                        {selectedOrderForDetails.payment?.method === 'cod' ? 'Cash on Delivery' : selectedOrderForDetails.payment?.method}
                      </p>
                      {selectedOrderForDetails.payment?.transactionId && (
                        <p className="text-[10px] md:text-sm font-mono bg-white/5 p-2 rounded-lg border border-white/10 mt-2">
                          <span className="opacity-40 mr-2">TrxID:</span>
                          {selectedOrderForDetails.payment.transactionId}
                        </p>
                      )}
                      <p className="text-[10px] opacity-40 mt-2">Ordered on {new Date(selectedOrderForDetails.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Items Ordered ({selectedOrderForDetails.items.reduce((acc, i) => acc + i.quantity, 0)})</h4>
                  <div className="space-y-3 md:space-y-4">
                    {selectedOrderForDetails.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                        <img src={item.image} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <p className="font-bold text-xs md:text-sm">{item.name}</p>
                          <p className="text-[10px] opacity-40">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[10px] md:text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                          <p className="text-[10px] md:text-xs text-primary font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Current Status</p>
                    {selectedOrderForDetails.status !== 'pending' && (
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${
                        selectedOrderForDetails.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                        selectedOrderForDetails.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-500' :
                        selectedOrderForDetails.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {selectedOrderForDetails.status}
                      </span>
                    )}
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Total Amount</p>
                    <p className="text-2xl md:text-3xl font-display font-bold text-primary">{formatPrice(selectedOrderForDetails.total)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8 bg-primary/5 border-t border-primary/10 flex flex-wrap justify-end gap-3 md:gap-4">
                {selectedOrderForDetails.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        updateOrderStatus(selectedOrderForDetails.id, 'rejected');
                        setSelectedOrderForDetails(null);
                      }}
                      className="flex items-center gap-2 btn-outline border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm"
                    >
                      <X className="w-4 h-4" />
                      Reject Order
                    </button>
                    <button 
                      onClick={() => {
                        updateOrderStatus(selectedOrderForDetails.id, 'processing');
                        setSelectedOrderForDetails(null);
                      }}
                      className="flex items-center gap-2 btn-primary px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Accept Order
                    </button>
                  </>
                )}
                {selectedOrderForDetails.status !== 'pending' && (
                  <button 
                    onClick={() => setSelectedOrderForDetails(null)}
                    className="btn-primary px-6 md:px-8 py-2 md:py-3 text-xs md:text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
