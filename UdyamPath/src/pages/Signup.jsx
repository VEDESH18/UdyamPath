import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Eye, EyeOff, Loader2, ArrowRight, Sprout, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#FF4B4B', '#FFC800', '#58CC02'];
  const strengthLabels = ['', 'Too short', 'Almost there', 'Strong 🔒'];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/onboarding');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Try logging in instead.'
        : err.code === 'auth/weak-password'
        ? 'Please use a stronger password (at least 6 characters).'
        : err.message || 'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#58CC02] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#58CC02] flex items-center justify-center shadow-[0_0_20px_rgba(88,204,2,0.4)]">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <span className="font-poppins font-black text-2xl text-white">UdyamPath</span>
          </div>
          <h1 className="text-3xl font-poppins font-black text-white mb-2">Start your journey 🚀</h1>
          <p className="text-white/50 text-sm">Free forever. No credit card. Built for Bharat.</p>
        </div>

        {/* Perks */}
        <div className="flex justify-center gap-6 mb-6">
          {['AI Validation', 'CEO Simulator', '4 Languages'].map(perk => (
            <div key={perk} className="flex items-center gap-1.5 text-xs text-white/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" />
              {perk}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/8 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          
          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-white/10 text-white font-bold hover:border-white/25 hover:bg-white/5 transition-all duration-200 mb-6 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/30 text-xs font-bold">OR</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red/10 border border-red/20 text-[#FF4B4B] text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="e.g., Gourav"
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min. 6 characters"
                  className="input-primary pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passwordStrength ? strengthColors[passwordStrength] : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: strengthColors[passwordStrength] }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Free Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-center text-white/25 text-xs">
              By signing up, you agree to our Terms of Service.
            </p>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#58CC02] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
