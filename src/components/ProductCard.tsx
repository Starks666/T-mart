import { motion } from 'motion/react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card group flex flex-col h-full overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          )}
        </Link>
        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => addToCart(product)}
            className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-sm bg-bg-base/90 text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`} className="group/title">
          <h3 className="text-base md:text-lg font-display font-semibold mb-1 group-hover/title:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs md:text-sm opacity-40 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-base md:text-lg font-bold">{formatPrice(product.price)}</span>
          <button 
            onClick={() => addToCart(product)}
            className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-60 transition-opacity"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
