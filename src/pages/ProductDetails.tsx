import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ArrowLeft, Shield, Truck, RefreshCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { useState, useEffect } from 'react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, products } = useStore();
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pt-40 text-center space-y-4">
        <h2 className="text-2xl">Product not found</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden border border-primary/10 bg-bg-base"
          >
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {(product.images || [product.image]).map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 ${activeImage === img ? 'border-primary' : 'border-primary/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                {product.category}
              </span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight">{product.name}</h1>
            <p className="text-3xl font-display font-bold text-primary">{formatPrice(product.price)}</p>
            <p className="opacity-60 leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={() => addToCart(product)}
              className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3"
            >
              Add to Bag
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, label: "Quality Guaranteed" },
                { icon: Truck, label: "Safe Shipping" },
                { icon: RefreshCcw, label: "Easy Returns" }
              ].map((item, i) => (
                <div key={i} className="border border-primary/10 rounded-xl p-4 flex flex-col items-center gap-2 text-center bg-bg-base">
                  <item.icon className="w-5 h-5 opacity-40" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-primary/10">
            <h3 className="font-display font-semibold text-xl">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg flex flex-col gap-1 border border-primary/10 bg-bg-base">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
