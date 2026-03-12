import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(''); // For demo purposes
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useStore();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 50)}...`);
      }

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error(`Server returned an invalid response format`);
      }

      if (data.success) {
        setSentCode(data.debugCode);
        setStep(2);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to send code');
      }
    } catch (error: any) {
      console.error('Send Code Error:', error);
      toast.error(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentCode) {
      setStep(3);
      toast.success('Code verified successfully!');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await resetPassword(email, newPassword);
    setIsSubmitting(false);
    if (success) {
      navigate('/login');
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
            {step === 1 && <Mail className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
            {step === 2 && <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
            {step === 3 && <KeyRound className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify Code"}
            {step === 3 && "New Password"}
          </h1>
          <p className="text-white/40 text-xs md:text-sm">
            {step === 1 && "Enter your email to receive a code"}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && "Create a strong new password"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendCode} 
              className="space-y-4 md:space-y-6"
            >
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors group text-sm md:text-base disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Code'}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyCode} 
              className="space-y-4 md:space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 ml-1">Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/20" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-colors text-center tracking-[1em] font-mono text-lg md:text-xl"
                    placeholder="000000"
                  />
                </div>
                <p className="text-[10px] text-primary/60 text-center mt-2">
                  Debug Hint: The code is {sentCode}
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors group text-sm md:text-base"
              >
                Verify Code
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-white/40 text-xs hover:text-white transition-colors"
              >
                Change Email
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleResetPassword} 
              className="space-y-4 md:space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-12 focus:outline-none focus:border-primary/50 transition-colors text-sm md:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors group text-sm md:text-base disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting...' : 'Update Password'}
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-white/40 text-xs md:text-sm">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
