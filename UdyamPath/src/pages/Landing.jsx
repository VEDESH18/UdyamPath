import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Award, Target, BookOpen, TrendingUp, Download } from 'lucide-react';
import AuthModal from '../components/AuthModal';

import { useAppContext } from '../context/AppContext';

// Background particle logic omitted for brevity in replacement snippet
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 1,
            speedY: (Math.random() - 0.5) * 1,
            color: Math.random() > 0.5 ? 'rgba(255, 107, 53, 0.4)' : 'rgba(255, 255, 255, 0.2)',
        });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
      });
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />;
};

const AnimatedCounter = ({ end, duration, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const ratio = Math.min(progress / duration, 1);
      
      // Ease out quad
      const easeOut = ratio * (2 - ratio);
      setCount(Math.floor(easeOut * end));
      
      if (ratio < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    requestAnimationFrame(animateCount);
  }, [end, duration]);

  // Indian number format (1,00,000)
  const formattedCount = count.toLocaleString('en-IN');
  return <span className="font-bold text-saffron">{prefix}{formattedCount}{suffix}</span>;
};

export default function Landing() {
  const navigate = useNavigate();
  const { authUser, state, authLoading } = useAppContext();

  const [showAuth, setShowAuth] = useState(false);
  const [authIsLogin, setAuthIsLogin] = useState(false);

  // Automatically redirect authenticated users after cloud hydration finishes
  useEffect(() => {
    if (authUser && !authLoading) {
       // Only redirect once Firebase has told us if they already have an idea saved
       if (state.idea && state.user && state.user.name) {
         navigate('/dashboard');
       } else {
         navigate('/onboarding');
       }
    }
  }, [authUser, authLoading, state.idea, state.user, navigate]);

  const openRegister = () => { setAuthIsLogin(false); setShowAuth(true); };
  const openLogin = () => { setAuthIsLogin(true); setShowAuth(true); };

  const problemCards = [
    { stat: "90%", desc: "of social initiatives fail due to poor execution", icon: Target },
    { stat: "85%", desc: "of young founders receive zero real mentorship", icon: BookOpen },
    { stat: "₹0", desc: "Premium stakeholder simulation training. Completely free.", icon: Award }
  ];

  const steps = [
    { title: "Validate Idea", desc: "Get an AI feasibility diagnostic" },
    { title: "Enter Simulation", desc: "Pitch to virtual investors & partners" },
    { title: "Adapt & Learn", desc: "Face dynamic real-world consequences" },
    { title: "Track Mastery", desc: "Download action-oriented playbooks" }
  ];

  return (
    <div className="relative min-h-screen bg-navy flex flex-col overflow-x-hidden pt-20">
      <ParticleBackground />
      
      {/* Absolute Header inside Landing for Login */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="font-poppins font-bold text-2xl text-white tracking-tight flex items-center gap-2">
           <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-saffron-glow">U</span>
           dyam<span className="text-saffron">Path</span>
        </div>
        <button onClick={openLogin} className="text-white hover:text-saffron font-bold px-6 py-2 transition-colors border border-transparent hover:border-saffron/30 rounded-full bg-surface/30 backdrop-blur-md">
           Log In
        </button>
      </div>

      {/* Auth Modal Portal */}
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultIsLogin={authIsLogin} />}

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center flex-1 justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-surface/50 border border-saffron/20 rounded-full px-6 py-2 mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(255,107,53,0.15)]"
        >
          <p className="text-muted text-sm md:text-base font-inter">
            <AnimatedCounter end={40000000} duration={2500} /> students. Less than 1% get real guidance.
          </p>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-poppins font-extrabold text-white leading-[1.1] mb-8 max-w-5xl tracking-tight"
        >
          The <span className="text-saffron bg-clip-text text-transparent bg-gradient-to-r from-saffron to-amber-400">Ultimate Startup Simulator</span>.<br />For Every Indian Founder.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted font-inter max-w-3xl mb-12"
        >
          Face real investors. Survive market crises. Master difficult decisions in your own language. 100% Free.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mt-4"
        >
          <button onClick={openRegister} className="btn-primary text-xl px-10 py-5 flex items-center justify-center gap-3 group shadow-saffron-glow hover:scale-[1.02] transition-transform">
            Launch Your Startup
            <TrendingUp className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* PROBLEM CARDS */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="glass-card p-8 hover-glow group"
              >
                <div className="w-14 h-14 rounded-full bg-saffron/10 flex items-center justify-center mb-6 group-hover:bg-saffron/20 transition-colors">
                  <Icon className="w-7 h-7 text-saffron" />
                </div>
                <h3 className="text-4xl font-poppins font-bold text-white mb-2">{card.stat}</h3>
                <p className="text-muted font-inter leading-relaxed">{card.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold text-white mb-4">How It Works</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">A completely personalized journey mimicking the high stakes of a real startup incubator.</p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-white/10 z-0">
             <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: '100%' }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="h-full bg-saffron origin-left"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-surface border-2 border-saffron flex items-center justify-center text-saffron font-bold text-xl mb-6 shadow-saffron-glow">
                  {idx + 1}
                </div>
                <h4 className="text-xl font-poppins font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 mt-12 py-8 text-center text-muted font-inter text-sm bg-surface/50">
        <p>Built for Bharat. Built with ❤️ at GDG on Campus CVR</p>
      </footer>
    </div>
  );
}
