import { motion, AnimatePresence } from 'motion/react';
import { Home, ShoppingBag, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useState, useEffect } from 'react';

export default function MobileNav() {
  const location = useLocation();
  const { cartCount, setIsCartOpen, currentUser } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Check if we are at the very bottom
      const isAtBottom = currentScrollY + clientHeight >= scrollHeight - 50;

      if (isAtBottom) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
    { icon: User, label: 'Profile', path: currentUser ? '/profile' : '/login' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="lg:hidden fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md glass rounded-3xl shadow-2xl border border-primary/10 flex items-center justify-around px-2 py-3"
        >
          {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
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
              className="relative flex flex-col items-center gap-1 flex-1 opacity-40 hover:opacity-100 transition-opacity"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-[7px] font-bold flex items-center justify-center rounded-full text-white border border-bg-base">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter">Cart</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
