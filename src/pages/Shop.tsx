import { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Shop() {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.rating - a.rating;
    });

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold">The <span className="text-primary">Collection</span></h1>
          <p className="opacity-50">Curated essentials for your modern lifestyle.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-lg border border-primary/10 focus:outline-none focus:border-primary w-full sm:w-64 bg-bg-base"
            />
          </div>
          <div className="flex items-center gap-2 border border-primary/10 px-4 py-2 rounded-lg bg-bg-base">
            <SlidersHorizontal className="w-4 h-4 opacity-30" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!selectedCategory ? 'bg-primary text-white' : 'border border-primary/10 opacity-60 hover:opacity-100'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedCategory === cat ? 'bg-primary text-white' : 'border border-primary/10 opacity-60 hover:opacity-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <p className="text-xl text-white/40">No products found matching your criteria.</p>
          <button 
            onClick={() => { setSearch(''); setSelectedCategory(null); }}
            className="btn-outline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
