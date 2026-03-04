import { motion } from 'motion/react';
import { ShoppingCart, Search, User, Menu, Anchor, Sun, Moon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-10 left-0 right-0 z-40 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass rounded-full px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Anchor className="w-6 h-6 text-primary" />
          <span className="text-2xl font-display font-bold tracking-tight text-primary">T mart</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-70">
          <Link to="/" className="hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/shop" className="hover:opacity-100 transition-opacity">Shop</Link>
          <Link to="/categories" className="hover:opacity-100 transition-opacity">Categories</Link>
          <Link to="/about" className="hover:opacity-100 transition-opacity">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-primary" />}
          </button>

          <Link to="/profile" className="p-2 hover:bg-primary/10 rounded-full transition-colors hidden sm:block">
            <User className="w-5 h-5" />
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-5 h-5 bg-primary text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-bg-base text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          <button className="md:hidden p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
