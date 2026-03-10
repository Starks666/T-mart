import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 md:pt-32 overflow-hidden bg-bg-base">
      {/* Background Trident */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Anchor className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] text-red-600/5 -rotate-12" />
      </div>

      {/* New Collection Button - Top Left */}
      <div className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 z-20">
        <MotionLink
          to="/shop"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(166, 93, 104, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/10 bg-primary/5 transition-colors"
        >
          <Sparkles className="w-2.5 h-2.5 text-primary" />
          <span className="text-[10px] font-semibold tracking-wider uppercase opacity-50">New Collection</span>
        </MotionLink>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-8xl font-display font-bold tracking-tight mb-6 md:mb-8 leading-[1.1]"
        >
          Simple. Elegant. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/70 to-primary">Timeless.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-xl opacity-60 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed flex items-center justify-center gap-2"
        >
          <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary inline" />
          <span className="text-primary font-bold">T mart</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
        >
          <MotionLink 
            to="/shop" 
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "#a65d68",
              boxShadow: "0 10px 30px -10px rgba(166, 93, 104, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 group px-8 md:px-10 py-3 md:py-4 transition-all duration-300 text-sm md:text-base"
          >
            Shop Now
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </MotionLink>
          
          <MotionLink 
            to="/about" 
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(166, 93, 104, 0.1)",
              borderColor: "rgba(166, 93, 104, 0.5)"
            }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline px-8 md:px-10 py-3 md:py-4 transition-all duration-300 text-sm md:text-base"
          >
            Our Story
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}

