import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Loader2, MessageSquareText, Mic, MicOff, Volume2, VolumeX, MessageSquare, ImagePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { chatWithCoach } from '../services/aiService';
import useOpenAI from '../hooks/useOpenAI';
import useSarvam from '../hooks/useSarvam';
import ReactMarkdown from 'react-markdown';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' }
];

const PRE_PROMPTS = [
  "How can I better understand my local competition in India?",
  "What are some low-cost marketing strategies for rural areas?",
  "Help me calculate my unit economics.",
  "Show me some government schemes for MSMEs."
];

export default function AICoach() {
  const { state, updateState } = useAppContext();
  const { streamText } = useOpenAI();
  const { generateSpeech } = useSarvam();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentLang = LANGUAGES.find(l => l.code === state.language) || LANGUAGES[0];

  // Implement Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = state.language === 'en' ? 'en-IN' : state.language === 'hi' ? 'hi-IN' : state.language === 'te' ? 'te-IN' : 'ta-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev.trim() + ' ' + transcript).trim());
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.error("Speech detection error:", e);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [state.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const speakText = async (text) => {
    if (!voiceEnabled) return;
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (err) {
      console.warn("Speech synthesis failed:", err);
    }
  };

  // Global open listener
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-udyampath-coach', handleOpen);
    return () => window.removeEventListener('open-udyampath-coach', handleOpen);
  }, []);

  // Intro message (reset when language changes)
  useEffect(() => {
    if (isOpen && state.user) {
      const langName = currentLang.name;
      setMessages([{
        role: 'ai',
        content: `Namaste ${state.user.name.split(' ')[0]}! I'm Udyam Guru, your personal startup mentor. I know you're worried about ${state.user.fear?.toLowerCase()} — that's one of the most common challenges for first-time founders in India. I'll speak to you in ${langName}. What's on your mind today?`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, messages.length, state.idea, state.user]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    
    if ((!textToSend.trim() && !selectedImage) || isTyping) return;

    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const newMessages = [...messages, { role: 'user', content: textToSend, image: imageToSend }];
    setMessages(newMessages);
    setIsTyping(true);

    const historyText = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
    const lowerText = textToSend.toLowerCase();

    let triggerContext = '';
    if (lowerText.includes('quit') || lowerText.includes('give up') || lowerText.includes('chod')) {
      triggerContext = 'CRITICAL: Validate their feeling first. 90% of founders feel this. Give ONE extremely simple action for TODAY only.';
    } else if (lowerText.includes('scheme') || lowerText.includes('government') || lowerText.includes('funding')) {
      triggerContext = 'CRITICAL: Mention they can check the Founder Hub panel for personalized govt schemes. Give brief framing.';
    }

    const langMap = { te: 'Telugu', hi: 'Hindi', ta: 'Tamil', en: 'English' };
    const langName = langMap[state.language] || 'English';

    const prompt = `System: You are Udyam Guru, a warm experienced Indian startup mentor. Speak like a supportive elder brother. 
Founder: ${state.user?.name}. Their idea: "${state.idea}". Their biggest fear: "${state.user?.fear}".
Rules: 
- Use simple language, relatable Indian examples (chai, cricket, kirana stores, auto-rickshaw).  
- Keep responses under 120 words unless they ask for more.
- Never say "I am an AI". 
- Always give India-specific, actionable advice.
- ALWAYS end with one specific question or action step.
- Respond ENTIRELY in ${langName}. Do not mix languages unless user does so.

${triggerContext ? `Special context: ${triggerContext}` : ''}

Recent conversation:
${historyText}

user: ${textToSend}
ai:`;

    // Add empty AI bubble to stream into
    setMessages(prev => [...prev, { role: 'ai', content: '', timestamp: new Date().toISOString() }]);

    let finalResponse = '';
    try {
      finalResponse = await streamText(prompt, (chunkText) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: chunkText };
          return updated;
        });
      });
    } catch (err) {
      console.error(err);
      finalResponse = 'My network dropped for a moment. Please try again!';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', content: finalResponse, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsTyping(false);
      // Auto-speak the AI response
      if (finalResponse && voiceEnabled) {
        setTimeout(() => speakText(finalResponse), 400);
      }
    }
  };

  const handleLanguageChange = (langCode) => {
    updateState({ language: langCode });
    // Clear messages to restart in new language
    setMessages([]);
  };

  const starterChips = [
    'How do I validate my idea?',
    'I feel like giving up',
    'What govt schemes apply to me?',
    'How do I find my first customer?',
    'What did I get wrong in my module?'
  ];

  if (!state.user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-[#FF6B35] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(255,107,53,0.4)] hover:scale-110 active:scale-95 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Slide-out Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#16213e] border-l-2 border-[#1a1a2e] z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b-2 border-white/5 flex items-center justify-between bg-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center border border-[#FF6B35]/50">
              <Bot className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-lg leading-tight">Udyam Guru</h3>
              <p className="text-[#0f9b58] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f9b58] animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)} 
              className={`p-2 rounded-xl transition-all ${voiceEnabled ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-white/5 text-white/50'}`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#1a1a2e]/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user' 
                  ? 'bg-[#FF6B35] text-white rounded-tr-none' 
                  : 'bg-[#202f36] text-white/90 border border-white/10 rounded-tl-none'
              }`}>
                 {msg.image?.previewUrl && (
                   <img src={msg.image.previewUrl} alt="uploaded" className="max-w-full rounded-lg mb-3 shadow-sm border border-black/10" />
                 )}
                 <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                   {msg.content}
                 </ReactMarkdown>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#202f36] border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pre-prompts & Image Preview Area */}
        <div className="bg-[#1a1a2e] px-4 pt-3 border-t-2 border-white/5">
          {/* Pre-prompts - show mainly when less messages */}
          {messages.length <= 3 && !selectedImage && (
            <div className="flex flex-wrap gap-2 mb-3">
              {PRE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(null, prompt)}
                  disabled={isTyping}
                  className="text-[11px] bg-white/5 border border-white/10 text-white/70 px-3 py-1.5 rounded-full hover:bg-[#FF6B35]/20 hover:text-[#FF6B35] transition-colors text-left disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block mb-3">
              <img src={selectedImage.previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-white/20 shadow-lg" />
              <button 
                onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value='' }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 pt-0 bg-[#1a1a2e] pb-6">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              className="absolute left-2 p-2 rounded-xl text-white/50 hover:text-[#FF6B35] transition-colors z-10 disabled:opacity-50 hover:bg-white/5"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleListening}
              disabled={isTyping}
              className={`absolute left-10 p-2 rounded-xl transition-all z-10 disabled:opacity-50 ${isListening ? 'text-accentRed bg-accentRed/10 animate-pulse ring-2 ring-accentRed' : 'text-white/50 hover:bg-white/5'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask anything..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-20 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all text-sm"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="absolute right-2 p-2 rounded-xl text-[#FF6B35] disabled:text-white/20 transition-colors"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
