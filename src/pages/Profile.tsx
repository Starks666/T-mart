import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, MapPin, LogOut, ShoppingBag, ChevronRight, Camera, X, AlertCircle, CreditCard } from 'lucide-react';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

const STATUS_STEPS = [
  { status: 'pending', label: 'Order Placed', value: 1 },
  { status: 'processing', label: 'Approved', value: 2 },
  { status: 'shipped', label: 'Shipped', value: 3 },
  { status: 'delivered', label: 'Delivered', value: 4 },
];

export default function Profile() {
  const { currentUser, orders, logout, updateCurrentUser, requestRefund, cancelOrder } = useStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-40 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-display font-bold mb-4">Access Denied</h1>
        <p className="text-white/50 mb-8">Please sign in to view your profile and orders.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary-dark transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updateCurrentUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const userOrders = orders.filter(o => o.userId === currentUser.id);

  const getStatusData = (currentStatus: string) => {
    if (currentStatus === 'rejected') return [];
    
    const currentIndex = STATUS_STEPS.findIndex(s => s.status === currentStatus);
    return STATUS_STEPS.map((step, index) => ({
      name: step.label,
      value: index <= currentIndex ? step.value : null,
      active: index <= currentIndex
    }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Approved';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'rejected': return 'Sorry out of stock';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400';
      case 'processing': return 'bg-emerald-500/10 text-emerald-400';
      case 'shipped': return 'bg-blue-500/10 text-blue-400';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400';
      case 'rejected': return 'bg-red-500/10 text-red-400';
      case 'cancelled': return 'bg-white/10 text-white/50';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/20 bg-card-base">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20">
                    <Package className="w-10 h-10" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">My Account</h1>
              <p className="text-white/40">Welcome back, {currentUser.name}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex items-center gap-2 text-red-500 font-bold hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Info */}
          <div className="space-y-8">
            <div className="bg-card-base border border-primary/10 rounded-3xl p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs opacity-30 uppercase font-bold tracking-tighter mb-1">Full Name</p>
                  <p className="font-medium">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-xs opacity-30 uppercase font-bold tracking-tighter mb-1">Email Address</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-xs opacity-30 uppercase font-bold tracking-tighter mb-1">Member Since</p>
                  <p className="font-medium">{new Date(currentUser.joinedAt || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Account Status</h3>
              <p className="text-sm leading-relaxed opacity-70">
                Your account is active and verified. You have placed {userOrders.length} orders with us.
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-display font-bold">Order History</h3>
              <span className="text-xs font-bold uppercase tracking-widest opacity-30">{userOrders.length} Orders</span>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-card-base border border-dashed border-white/10 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-white/40 mb-6">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="text-primary font-bold hover:underline"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-card-base border border-primary/10 rounded-3xl p-6 hover:border-primary/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold mb-1">{order.id}</p>
                          <div className="flex items-center gap-4 text-xs opacity-40">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-primary mb-1">
                          {formatPrice(order.total)}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full border-2 border-card-base overflow-hidden bg-white/5">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-card-base bg-white/5 flex items-center justify-center text-[10px] font-bold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card-base border border-primary/20 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto"
            >
              <div className="p-4 md:p-8 border-b border-primary/10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold">Order Details</h2>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto space-y-6 md:space-y-8 custom-scrollbar">
                {/* Status Chart */}
                {selectedOrder.status !== 'rejected' && selectedOrder.status !== 'cancelled' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Order Status Timeline</h4>
                    </div>
                    <div className="h-32 md:h-40 w-full bg-white/5 rounded-2xl md:rounded-3xl p-4 border border-primary/10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getStatusData(selectedOrder.status)}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#00FF00', fontSize: '10px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#00FF00" 
                            strokeWidth={2} 
                            dot={{ r: 3, fill: '#00FF00', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#00FF00' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {(selectedOrder.status === 'rejected' || selectedOrder.status === 'cancelled') && (
                  <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl ${selectedOrder.status === 'rejected' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'} border flex items-center gap-3 md:gap-4`}>
                    <AlertCircle className={`w-6 h-6 md:w-8 md:h-8 ${selectedOrder.status === 'rejected' ? 'text-red-500' : 'text-white/30'} flex-shrink-0`} />
                    <div className="flex-1">
                      <p className={`text-sm md:text-base font-bold ${selectedOrder.status === 'rejected' ? 'text-red-500' : 'text-white'}`}>
                        {selectedOrder.status === 'rejected' ? 'Sorry, Out of Stock' : 'Order Cancelled'}
                      </p>
                      <p className="text-[10px] md:text-sm opacity-60">
                        {selectedOrder.status === 'rejected' 
                          ? "We couldn't fulfill this order. You are eligible for a full refund."
                          : "You have cancelled this order. You can request a refund if payment was made."}
                      </p>
                    </div>
                    {!selectedOrder.refundRequest && (
                      <button 
                        onClick={() => setShowRefundForm(true)}
                        className="bg-primary text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm hover:bg-primary-dark transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                )}

                {selectedOrder.refundRequest && (
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 md:gap-4">
                    <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-bold text-emerald-400">Refund Requested</p>
                      <p className="text-[10px] md:text-sm opacity-60">Status: {selectedOrder.refundRequest.status}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 md:gap-6">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border border-primary/10 bg-white/5 flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 md:space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm md:text-base font-bold">{item.name}</h4>
                          <p className="text-sm md:text-base font-bold text-primary">{formatPrice(item.price)}</p>
                        </div>
                        <p className="text-[10px] md:text-xs opacity-50 leading-relaxed line-clamp-2">{item.description}</p>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-30">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 md:pt-8 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2 md:mb-4">Shipping Address</h4>
                    <div className="text-xs md:text-sm space-y-1 opacity-70">
                      <p>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                      <p>{selectedOrder.customer.address}</p>
                      <p>{selectedOrder.customer.city}, {selectedOrder.customer.zipCode}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2 md:mb-4">Order Summary</h4>
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="opacity-50">Subtotal</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="opacity-50">Shipping</span>
                        <span className="text-emerald-400">Free</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm pt-2 border-t border-white/5">
                        <span className="opacity-50 uppercase text-[8px] md:text-[10px] font-bold">Payment Method</span>
                        <span className="uppercase text-[8px] md:text-[10px] font-bold text-primary">{selectedOrder.payment?.method || 'cod'}</span>
                      </div>
                      {selectedOrder.payment?.transactionId && (
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="opacity-50 uppercase text-[8px] md:text-[10px] font-bold">TrxID</span>
                          <span className="text-[8px] md:text-[10px] font-mono opacity-80">{selectedOrder.payment.transactionId}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base md:text-lg pt-2 border-t border-white/5">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-8 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-500' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-500' :
                    selectedOrder.status === 'rejected' ? 'bg-red-500' :
                    selectedOrder.status === 'cancelled' ? 'bg-white/20' :
                    'bg-amber-500'
                  } animate-pulse`} />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Status: {getStatusLabel(selectedOrder.status)}</span>
                </div>
                  <div className="flex gap-3">
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button 
                      onClick={async () => {
                        if (selectedOrder.payment?.method === 'cod') {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            await cancelOrder(selectedOrder.id);
                            setSelectedOrder(null);
                          }
                        } else {
                          // Paid - show refund form
                          setShowRefundForm(true);
                        }
                      }}
                      className="btn-outline border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white py-2 md:py-3 px-6 md:px-8 text-xs md:text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="btn-primary py-2 md:py-3 px-6 md:px-8 text-xs md:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refund Form Modal */}
      <AnimatePresence>
        {showRefundForm && selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRefundForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card-base border border-primary/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-display font-bold">Refund Request</h3>
                <p className="text-xs md:text-sm opacity-50">Please provide your details for the refund of {formatPrice(selectedOrder.total)}</p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Reason for Refund</label>
                  <textarea 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="e.g. Order rejected by admin"
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:border-primary h-20 md:h-24 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-30">Bank / Payment Details</label>
                  <input 
                    type="text"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="Account Number, Bank Name, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button 
                    onClick={() => setShowRefundForm(false)}
                    className="flex-1 btn-outline py-3 md:py-4 text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (!refundReason || !bankDetails) return;
                      // If order is not cancelled yet, cancel it first
                      if (selectedOrder.status !== 'cancelled') {
                        await cancelOrder(selectedOrder.id);
                      }
                      await requestRefund(selectedOrder.id, { reason: refundReason, bankDetails });
                      setShowRefundForm(false);
                      setSelectedOrder(null);
                      setRefundReason('');
                      setBankDetails('');
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
    </div>
  );
}
