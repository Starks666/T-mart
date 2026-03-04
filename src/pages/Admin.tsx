import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Package, Users, ShoppingCart, TrendingUp, ArrowUpRight, Plus, Search, X, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { CATEGORIES } from '../data/mockData';

export default function Admin() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const stats = [
    { label: 'Total Revenue', value: '৳124,592', change: '+12.5%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Active Orders', value: '42', change: '+3', icon: ShoppingCart, color: 'text-primary' },
    { label: 'Total Products', value: products.length.toString(), change: '0', icon: Package, color: 'text-secondary' },
    { label: 'New Customers', value: '1,204', change: '+18%', icon: Users, color: 'text-accent' },
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
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
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
        {/* Products Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
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
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover group-hover/item:scale-105 transition-transform" referrerPolicy="no-referrer" />
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
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-display font-bold text-xl">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { user: 'Alex Rivera', action: 'purchased Aether Pods Pro', time: '2 mins ago' },
              { user: 'Sarah Chen', action: 'joined as a new member', time: '15 mins ago' },
              { user: 'Mike Ross', action: 'left a 5-star review', time: '1 hour ago' },
              { user: 'Elena Gilbert', action: 'purchased Quantum Core', time: '3 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-bold">{activity.user}</span> <span className="opacity-50">{activity.action}</span></p>
                  <p className="text-[10px] uppercase tracking-widest opacity-30">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full btn-outline py-3 text-xs">View All Activity</button>
        </div>
      </div>

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
              className="relative w-full max-w-md glass-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-bold">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative group flex-shrink-0">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-xl object-cover border-2 border-primary/20"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                    >
                      <Upload className="w-4 h-4 mb-0.5" />
                      <p className="text-[8px] font-bold uppercase">Upload</p>
                    </button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Image URL</label>
                    <input 
                      required
                      type="text" 
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg glass text-xs focus:outline-none focus:border-primary"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Quantum Watch"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Price (৳)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:border-primary bg-bg-base"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:border-primary h-20 resize-none"
                    placeholder="Describe the future..."
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-3 text-base mt-2">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
