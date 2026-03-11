import { motion, AnimatePresence } from 'motion/react';
import { Home, ShoppingBag, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useState, useEffect } from 'react';

export default function MobileNav() {
  const location = useLocation();
  const { cartCount, setIsCartOpen, currentUser } = useStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // If we are within 50px of the bottom, hide the menu
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
    { icon: User, label: 'Profile', path: currentUser ? '/profile' : '/login' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl border border-primary/10"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-[6px] font-bold flex items-center justify-center rounded-full text-white border border-bg-base">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-tighter">Cart</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
