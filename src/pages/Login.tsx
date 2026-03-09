import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card-base border border-primary/10 rounded-3xl p-6 md:p-12"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
            <LogIn className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Welcome Back</h1>
          <p className="text-white/40 text-xs md:text-sm">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/20" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-colors text-sm md:text-base"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/20" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-colors text-sm md:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors group text-sm md:text-base"
          >
            Sign In
            <LogIn className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-white/40 text-xs md:text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
