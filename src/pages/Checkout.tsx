import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';
import { CreditCard, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="pt-40 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Go to Shop</button>
      </div>
    );
  }

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock payment delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      clearCart();
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
                <input type="text" placeholder="First Name" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Last Name" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
                <input type="email" placeholder="Email Address" className="col-span-2 glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Address" className="col-span-2 glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
                <input type="text" placeholder="City" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
                <input type="text" placeholder="ZIP Code" className="glass px-6 py-3 rounded-xl focus:outline-none focus:border-primary" />
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                Continue to Payment
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <div className="glass p-6 rounded-2xl border-primary/50 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-white/40">Expires 12/28</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-primary" />
                </div>
                <button className="btn-outline w-full py-4 text-sm">+ Add New Card</button>
              </div>
              <button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(cartTotal)}`}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-sm text-white/40 hover:text-white transition-colors">Back to Shipping</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">Order Confirmed!</h2>
                <p className="text-white/50">Your futuristic gear is on its way. Check your email for details.</p>
              </div>
              <div className="pt-6">
                <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
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
