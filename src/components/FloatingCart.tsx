import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function FloatingCart() {
  const { cartCount, setIsCartOpen, currentUser } = useStore();

  // Only show for users, not admins
  if (currentUser?.role === 'admin') return null;

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.button
          key={cartCount}
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0, transition: { scale: { type: "spring", stiffness: 300, damping: 10 } } }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-50 p-4 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-bg-base text-white">
            {cartCount}
          </span>
          <div className="absolute right-full mr-4 px-4 py-2 bg-bg-base text-primary text-xs font-bold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-primary/10 pointer-events-none">
            View Your Cart
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
