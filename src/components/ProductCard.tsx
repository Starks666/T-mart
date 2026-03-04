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
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <Link 
            to={`/product/${product.id}`}
            className="p-3 bg-bg-base rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => addToCart(product)}
            className="p-3 bg-bg-base rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
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

      <div className="p-6 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`} className="group/title">
          <h3 className="text-lg font-display font-semibold mb-1 group-hover/title:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm opacity-40 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <button 
            onClick={() => addToCart(product)}
            className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-60 transition-opacity"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </motion.div>
  );
}
