import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Globe, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Home() {
  const { products } = useStore();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <div className="space-y-32 pb-32">
      <Hero />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-bold">Featured <span className="text-gradient">Essentials</span></h2>
            <p className="text-black/50">Handpicked quality for your everyday life.</p>
          </div>
          <Link to="/shop" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black hover:text-primary transition-colors group">
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass-card p-12 md:p-20 relative overflow-hidden text-center border border-black/5">
          <div className="relative z-10 space-y-8">
            <h2 className="text-lg sm:text-3xl md:text-5xl font-display font-bold flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap">
              Join the <span className="text-red-600 flex items-center gap-1.5 md:gap-2"><Anchor className="w-5 h-5 md:w-10 md:h-10" /> T mart</span> Community
            </h2>
            <p className="text-black/60 max-w-xl mx-auto">
              Get updates on new arrivals, exclusive offers, and minimalist living tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 rounded-lg border border-black/10 focus:outline-none focus:border-black transition-colors"
              />
              <button className="btn-primary whitespace-nowrap">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
