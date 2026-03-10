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
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 translate-y-0 opacity-100 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => addToCart(product)}
            className="p-2 md:p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-sm bg-bg-base/90 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-3 md:p-6 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`} className="group/title">
          <h3 className="text-sm md:text-lg font-display font-semibold mb-1 group-hover/title:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] md:text-sm opacity-40 line-clamp-2 mb-2 md:mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm md:text-lg font-bold">{formatPrice(product.price)}</span>
          <button 
            onClick={() => addToCart(product)}
            className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-60 transition-opacity"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
