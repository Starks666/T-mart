import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, User, Menu, Anchor, Sun, Moon, Bell, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const { cartCount, setIsCartOpen, currentUser, notifications, markNotificationAsRead, isAdmin } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    setIsNotificationsOpen(false);
    navigate(notification.link);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'My Profile', path: currentUser ? '/profile' : '/login' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'About', path: '/about' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-10 md:top-12 left-0 right-0 z-40 px-4 md:px-6 py-2 md:py-4"
    >
      <div className="max-w-7xl mx-auto glass rounded-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <span className="text-lg md:text-xl font-display font-bold tracking-tight text-primary whitespace-nowrap">T mart</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium opacity-70">
          <Link to="/" className="hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/shop" className="hover:opacity-100 transition-opacity">Shop</Link>
          <Link to="/categories" className="hover:opacity-100 transition-opacity">Categories</Link>
          <Link to="/about" className="hover:opacity-100 transition-opacity">About</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden lg:flex p-1.5 md:p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="hidden lg:flex p-1.5 md:p-2 hover:bg-primary/10 rounded-full transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5 text-primary" />}
          </button>

          {currentUser && (
            <div className="relative hidden lg:block">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1.5 md:p-2 hover:bg-primary/10 rounded-full transition-colors relative"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-red-500 text-[6px] md:text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-bg-base text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-[-1]"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 glass-card p-4 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-primary">{unreadCount} New</span>
                        )}
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {userNotifications.length === 0 ? (
                          <p className="text-center py-8 text-xs opacity-30 italic">No notifications yet</p>
                        ) : (
                          userNotifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-3 rounded-xl transition-all border border-transparent hover:border-primary/20 ${n.isRead ? 'opacity-50 bg-white/5' : 'bg-primary/5 border-primary/10'}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{n.title}</p>
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
                              </div>
                              <p className="text-xs opacity-80 line-clamp-2">{n.message}</p>
                              <p className="text-[8px] opacity-30 mt-2 uppercase tracking-tighter">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <Link to={currentUser ? "/profile" : "/login"} className="hidden lg:flex items-center gap-1 md:gap-2 p-1 md:p-1.5 hover:bg-primary/10 rounded-full transition-colors">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-primary/20" />
            ) : (
              <User className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-1.5" />
            )}
            <span className="text-[10px] md:text-xs font-bold pr-1 md:pr-2 ml-0.5 md:ml-1">
              {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
            </span>
          </Link>
          
          <motion.button 
            key={cartCount}
            animate={cartCount > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 md:p-2 hover:bg-primary/10 rounded-full transition-colors hidden lg:flex"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-primary text-[8px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-bg-base text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
          
          <div className="relative md:hidden hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 hover:bg-primary/10 rounded-full transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 z-[-1] bg-black/5 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 glass p-3 shadow-2xl z-50 overflow-hidden rounded-3xl border border-primary/20"
                  >
                    <div className="flex flex-col gap-1">
                      {menuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center justify-between group"
                        >
                          <span className="group-hover:text-primary transition-colors">{item.label}</span>
                          <Anchor className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-primary" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
