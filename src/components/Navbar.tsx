import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, User, Menu, Anchor, Sun, Moon, Bell, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const { cartCount, setIsCartOpen, currentUser, notifications, markNotificationAsRead } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    setIsNotificationsOpen(false);
    navigate(notification.link);
  };

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

          {currentUser && (
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-bg-base text-white">
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

          <Link to={currentUser ? "/profile" : "/login"} className="flex items-center gap-2 p-1.5 hover:bg-primary/10 rounded-full transition-colors hidden sm:flex">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-primary/20" />
            ) : (
              <User className="w-5 h-5 ml-1.5" />
            )}
            <span className="text-xs font-bold pr-2 ml-1">
              {currentUser ? currentUser.name.split(' ')[0] : 'Login / Sign up'}
            </span>
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
