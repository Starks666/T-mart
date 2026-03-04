import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function TopBanner() {
  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-primary text-bg-base py-2 px-6 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] z-[60]"
    >
      <Sparkles className="w-3 h-3" />
      <span>Free shipping on all orders over ৳15,000</span>
      <Sparkles className="w-3 h-3" />
    </motion.div>
  );
}
