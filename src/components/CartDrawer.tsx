import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-base z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-semibold">Shopping Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-primary/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className="opacity-50">Your cart is empty</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="btn-outline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-primary/5 border border-primary/10">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link 
                        to={`/product/${item.id}`} 
                        onClick={() => setIsCartOpen(false)}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-medium">{item.name}</h3>
                      </Link>
                      <p className="text-sm opacity-50">{item.category}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 bg-primary/10 rounded-full px-3 py-1.5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-primary transition-colors active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-primary transition-colors active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1 opacity-30 hover:opacity-100 hover:text-red-500 transition-all text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-primary/10 space-y-4 bg-bg-base">
                <div className="space-y-2">
                  <div className="flex justify-between opacity-60">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between opacity-60">
                    <span>Shipping</span>
                    <span className="opacity-100">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-xl font-display font-bold pt-2">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
                <Link 
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary w-full py-4 text-lg text-center block"
                >
                  Checkout Now
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
