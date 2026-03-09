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
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, completeRefund, answerQuestion } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'revenue' | 'orders' | 'customers' | 'refunds'>('inventory');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct({ ...formData, id: editingProduct.id });
    } else {
      await addProduct(formData);
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
    { id: 'revenue', label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+12.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'orders', label: 'Active Orders', value: orders.length.toString(), change: '+3', icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'inventory', label: 'Total Products', value: products.length.toString(), change: '0', icon: Package, color: 'text-secondary', bg: 'bg-secondary/10' },
    { id: 'customers', label: 'New Customers', value: uniqueCustomers.length.toString(), change: '+18%', icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'refunds', label: 'Refunds/Cancels', value: (refundRequestsCount + cancelledOrdersCount).toString(), change: refundRequestsCount > 0 ? 'Action Required' : '0', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold tracking-tight">Admin <span className="text-gradient">Dashboard</span></h1>
          <p className="opacity-50 text-sm max-w-md">Manage your boutique empire with precision and style. Monitor sales, inventory, and customer interactions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              className="pl-12 pr-6 py-3 rounded-full glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all" 
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveTab(stat.id as any)}
            className={`glass-card p-6 space-y-4 cursor-pointer transition-all duration-500 group ${
              activeTab === stat.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{stat.label}</p>
              <p className="text-2xl font-display font-bold mt-1 group-hover:text-primary transition-colors">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar/Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 px-4 mb-4">Management</p>
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrdersCount },
            { id: 'revenue', label: 'Revenue', icon: TrendingUp },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'refunds', label: 'Refunds', icon: AlertCircle, badge: refundRequestsCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-primary/10 text-text-base opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-primary'}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
              {tab.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white text-primary' : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-9 glass-card overflow-hidden min-h-[600px] flex flex-col">
          {activeTab === 'inventory' && (
            <>
              <div className="p-8 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-2xl">Inventory</h3>
                  <p className="text-xs opacity-40 mt-1">Manage your product catalog and stock levels.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input type="text" placeholder="Filter products..." className="pl-12 pr-6 py-2.5 rounded-full glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64" />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-8 py-5">Product</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5 text-center">Stock</th>
                      <th className="px-8 py-5">Price</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div 
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="flex items-center gap-4 cursor-pointer"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/10">
                              {product.image && (
                                <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold group-hover:text-primary transition-colors">{product.name}</p>
                              <p className="text-[10px] font-mono opacity-30 uppercase tracking-tighter">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-bold ${product.stock < 10 ? 'text-red-500' : 'text-text-base'}`}>
                              {product.stock}
                            </span>
                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-mono font-bold text-primary">{formatPrice(product.price)}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(product)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="Edit Product"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                            <button 
                              onClick={async () => {
                                if(confirm('Are you sure you want to delete this product?')) {
                                  await deleteProduct(product.id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              title="Delete Product"
                            >
                              <X className="w-4 h-4" />
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

          {activeTab === 'orders' && (
            <>
              <div className="p-8 border-b border-primary/10">
                <h3 className="font-display font-bold text-2xl">Orders</h3>
                <p className="text-xs opacity-40 mt-1">Track and manage customer orders and shipments.</p>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest opacity-30 border-b border-primary/5">
                      <th className="px-8 py-5">Order ID</th>
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Method</th>
                      <th className="px-8 py-5">Total</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              order.status === 'pending' ? 'bg-red-500 animate-pulse' : 
                              order.status === 'delivered' ? 'bg-emerald-500' : 'bg-primary'
                            }`} />
                            <span className="font-mono text-xs font-bold">{order.id}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-0.5">
                            <p className="font-bold">{order.customer.firstName} {order.customer.lastName}</p>
                            <p className="text-[10px] opacity-40">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 rounded-lg bg-primary/5">
                            {order.payment?.method === 'cod' ? 'COD' : order.payment?.method || 'COD'}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-mono font-bold">{formatPrice(order.total)}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'pending' ? 'bg-red-500/10 text-red-500' :
                              order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                              order.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-500' :
                              order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-white/10 text-white/50'
                            }`}>
                              {order.status}
                            </span>
                            
                            {order.status === 'pending' && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={async () => await updateOrderStatus(order.id, 'processing')}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={async () => await updateOrderStatus(order.id, 'rejected')}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Secondary Content: Q/A and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-2xl">Product Inquiries</h3>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allQuestions.slice(0, 4).map((q, i) => (
              <div key={i} className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{q.productName}</p>
                    <p className="text-sm font-bold">{q.userName}</p>
                  </div>
                  <p className="text-[10px] font-mono opacity-30">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm opacity-70 italic leading-relaxed">"{q.text}"</p>
                
                {q.answer ? (
                  <div className="pl-4 border-l-2 border-primary/30 py-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Admin Reply</p>
                    <p className="text-sm opacity-60 line-clamp-2">{q.answer}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setReplyingTo({ productId: q.productId, question: q as any });
                      setAnswerText('');
                    }}
                    className="w-full py-3 rounded-2xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    Reply to Question
                  </button>
                )}
              </div>
            ))}
          </div>
          {allQuestions.length > 4 && (
            <button className="w-full py-4 rounded-2xl border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:bg-primary/5 transition-all">
              View All Inquiries
            </button>
          )}
        </div>

        <div className="glass-card p-8 space-y-8">
          <h3 className="font-display font-bold text-2xl">Recent Activity</h3>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 4 && <div className="absolute left-4 top-10 bottom-0 w-px bg-primary/10" />}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  order.status === 'pending' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold">New Order <span className="text-primary">{order.id}</span></p>
                  <p className="text-[10px] opacity-40">{order.customer.firstName} placed an order for {formatPrice(order.total)}</p>
                  <p className="text-[8px] font-mono opacity-30">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
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
                    onClick={async () => {
                      if (!answerText) return;
                      await answerQuestion(replyingTo.productId, replyingTo.question.id, answerText);
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
