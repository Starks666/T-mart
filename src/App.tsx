import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import TopBanner from './components/TopBanner';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import { motion } from 'motion/react';
import { Anchor } from 'lucide-react';

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Router>
        <div className="min-h-screen flex flex-col">
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '1rem',
              }
            }}
          />
          <TopBanner />
          <Navbar />
          <CartDrawer />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              {/* Placeholder routes for remaining features */}
              <Route path="/profile" element={
                <div className="pt-40 text-center">
                  <h1 className="text-4xl font-display font-bold mb-4">User Profile</h1>
                  <p className="text-white/50">Mock authentication system coming soon.</p>
                </div>
              } />
              <Route path="/about" element={
                <div className="pt-40 text-center flex flex-col items-center">
                  <h1 className="text-4xl font-display font-bold mb-4 flex items-center gap-3 text-red-600">
                    <Anchor className="w-8 h-8" /> About T mart
                  </h1>
                  <p className="text-black/50">Redefining the boundaries of technology and design.</p>
                </div>
              } />
            </Routes>
          </main>

          <footer className="py-20 border-t border-primary/10 bg-card-base">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Anchor className="w-6 h-6 text-primary" />
                  <span className="text-2xl font-display font-bold tracking-tight text-primary">T mart</span>
                </div>
                <p className="opacity-40 text-sm leading-relaxed">
                  Curated essentials for the modern lifestyle. Quality meets simplicity.
                </p>
              </div>
              
              <div>
                <h4 className="font-display font-bold mb-6 uppercase tracking-widest text-xs">Shop</h4>
                <ul className="space-y-4 text-sm opacity-50">
                  <li><Link to="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
                  <li><Link to="/" className="hover:text-primary transition-colors">Featured</Link></li>
                  <li><Link to="/shop" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                  <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
                <ul className="space-y-4 text-sm opacity-50">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
                <ul className="space-y-4 text-sm opacity-50">
                  <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Warranty</a></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-30 uppercase tracking-widest font-bold">
              <p>© 2026 T mart. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-primary transition-opacity">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-opacity">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </StoreProvider>
  </ThemeProvider>
);
}
