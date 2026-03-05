import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';
import { CreditCard, Truck, CheckCircle2, ArrowRight, Wallet, Smartphone, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';

export default function Checkout() {
  const { cart, cartTotal, placeOrder, currentUser } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [customerData, setCustomerData] = useState({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    zipCode: ''
  });

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="pt-40 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Go to Shop</button>
      </div>
    );
  }

  const handlePayment = () => {
    if (paymentMethod !== 'cod' && paymentMethod !== 'card' && !transactionId) {
      toast.error('Please enter Transaction ID');
      return;
    }

    setIsProcessing(true);
    // Mock payment delay
    setTimeout(() => {
      setIsProcessing(false);
      const paymentData = {
        method: paymentMethod,
        transactionId: transactionId || undefined,
        status: paymentMethod === 'cod' ? 'pending' : 'paid'
      };
      placeOrder(customerData, paymentData);
      setStep(3);
      toast.success('Order placed successfully!');
    }, 2000);
  };

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'glass text-white/30'}`}>
              {s}
            </div>
            <span className={`text-sm font-bold uppercase tracking-widest hidden sm:block ${step >= s ? 'text-white' : 'text-white/30'}`}>
              {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Complete'}
            </span>
            {s < 3 && <div className={`w-12 h-px ${step > s ? 'bg-primary' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary" />
                Shipping Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={customerData.firstName}
                  onChange={e => setCustomerData({...customerData, firstName: e.target.value})}
                  className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={customerData.lastName}
                  onChange={e => setCustomerData({...customerData, lastName: e.target.value})}
                  className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={customerData.email}
                  onChange={e => setCustomerData({...customerData, email: e.target.value})}
                  className="col-span-2 glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
                <input 
                  type="text" 
                  placeholder="Address" 
                  value={customerData.address}
                  onChange={e => setCustomerData({...customerData, address: e.target.value})}
                  className="col-span-2 glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customerData.city}
                  onChange={e => setCustomerData({...customerData, city: e.target.value})}
                  className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
                <input 
                  type="text" 
                  placeholder="ZIP Code" 
                  value={customerData.zipCode}
                  onChange={e => setCustomerData({...customerData, zipCode: e.target.value})}
                  className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" 
                />
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                Continue to Payment
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-8">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                Select Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                  { id: 'bkash', label: 'bKash', icon: Smartphone, color: 'text-[#D12053]' },
                  { id: 'nagad', label: 'Nagad', icon: Smartphone, color: 'text-[#F7941D]' },
                  { id: 'rocket', label: 'Rocket', icon: Smartphone, color: 'text-[#8C3494]' },
                  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                      paymentMethod === method.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-white/5 ${method.color || 'text-primary'}`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{method.label}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">
                        {method.id === 'cod' ? 'Pay when you receive' : 'Instant Payment'}
                      </p>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="ml-auto w-4 h-4 rounded-full border-4 border-primary" />
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod !== 'cod' && paymentMethod !== 'card' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/20"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Payment Instructions</p>
                    <p className="text-sm opacity-80">
                      Please send <span className="text-primary font-bold">{formatPrice(cartTotal)}</span> to our {paymentMethod} merchant number: <span className="text-primary font-bold">017XXXXXXXX</span> and enter the Transaction ID below.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Transaction ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter TrxID" 
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      className="w-full glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary text-sm font-mono"
                    />
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'card' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/20"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Card Number" className="col-span-2 glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary text-sm" />
                    <input type="text" placeholder="MM/YY" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary text-sm" />
                    <input type="text" placeholder="CVC" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary text-sm" />
                  </div>
                </motion.div>
              )}

              <div className="space-y-4 pt-4">
                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,0,0.2)]"
                >
                  {isProcessing ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Confirm Order
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button onClick={() => setStep(1)} className="w-full text-center text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                  Back to Shipping
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center space-y-8">
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-display font-bold">Thank You!</h2>
                <p className="text-white/50 max-w-sm mx-auto">Your futuristic gear is on its way. We've received your order and are processing it now.</p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/profile')} className="btn-outline px-8 py-4">View Order</button>
                <button onClick={() => navigate('/')} className="btn-primary px-8 py-4">Return Home</button>
              </div>
            </motion.div>
          )}
        </div>

        {step !== 3 && (
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-display font-bold uppercase tracking-widest text-xs">Order Summary</h3>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-gradient">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
