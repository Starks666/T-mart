import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Anchor, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const MotionLink = motion.create(Link);

export default function Hero() {
  const { products } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Cycle through all products for the "New Arrivals" feature
  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products.length]);

  const currentProduct = products[currentIndex] || products[0];

  if (!currentProduct) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 overflow-hidden bg-bg-base">
      {/* Featured Products Callout in Top Right */}
      <div className="absolute top-40 right-6 md:right-12 z-20 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 w-64 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">New Arrival</h4>
            <div className="flex gap-1">
              {products.slice(0, 5).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-3' : 'bg-primary/10'}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="relative h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Link to={`/product/${currentProduct.id}`} className="flex items-center gap-3 group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold group-hover:text-primary transition-colors line-clamp-1 underline-offset-4 group-hover:underline">{currentProduct.name}</p>
                    <p className="text-[10px] opacity-40 mb-1">{formatPrice(currentProduct.price)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-2 h-2 text-primary fill-primary" />
                      <span className="text-[8px] font-bold opacity-60">{currentProduct.rating}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <Link to="/shop" className="block text-center text-[10px] font-bold uppercase tracking-widest border-t border-primary/10 pt-4 hover:text-primary transition-colors">
            View All Collection
          </Link>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <MotionLink
          to="/shop"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(166, 93, 104, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10 bg-primary/5 mb-8 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase opacity-50">New Collection Available</span>
        </MotionLink>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1]"
        >
          Simple. Elegant. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/70 to-primary">Timeless.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto mb-12 leading-relaxed flex items-center justify-center gap-2"
        >
          <Anchor className="w-5 h-5 text-primary inline" />
          <span className="text-primary font-bold">T mart</span> brings you a curated selection of premium essentials designed for the modern home and lifestyle.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <MotionLink 
            to="/shop" 
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "#a65d68",
              boxShadow: "0 10px 30px -10px rgba(166, 93, 104, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 group px-10 transition-all duration-300"
          >
            Shop Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MotionLink>
          
          <MotionLink 
            to="/about" 
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(166, 93, 104, 0.1)",
              borderColor: "rgba(166, 93, 104, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline px-10 transition-all duration-300"
          >
            Our Story
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}

