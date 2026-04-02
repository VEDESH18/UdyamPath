import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../utils/firebase';

export default function AuthModal({ isOpen, onClose, defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
       setError("Please fill all fields");
       return;
    }
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email is already registered. Please log in.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
          // Ignore if user just closes the popup
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0f192b] border border-white/10 shadow-[0_0_50px_rgba(255,107,53,0.15)] rounded-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-poppins font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Start Your Journey'}
            </h2>
            <button onClick={onClose} className="text-muted hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleAuth} className="space-y-5">
              
              {error && (
                <div className="p-3 rounded-lg bg-accentRed/10 border border-accentRed/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accentRed flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-accentRed leading-tight">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold tracking-wider text-muted uppercase ml-1">Email <span className="text-accentRed">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    placeholder="founder@startup.in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold tracking-wider text-muted uppercase ml-1">Password <span className="text-accentRed">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary shadow-saffron-glow py-4 text-lg mt-2 flex justify-center items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : (isLogin ? 'Log In to Dashboard' : 'Create Free Account')}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-muted text-xs font-bold tracking-widest uppercase">Or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-surface border border-white/10 hover:bg-white/5 transition-colors py-3 rounded-xl flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-bold text-white">Continue with Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-muted text-sm">
                {isLogin ? "Don't have an account? " : "Already have an incubation pass? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-saffron font-bold hover:underline transition-all"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
          
          {/* Ornamental strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-saffron to-amber-500 absolute bottom-0 left-0"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
