/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Map as MapIcon, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Send,
  Sparkles,
  Zap,
  User,
  Shield,
  GraduationCap,
  History,
  Info,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Knowledge {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  content: string;
  imageUrl: string;
}

interface Consultation {
  id: string;
  name: string;
  question: string;
  category: string;
  status: 'pending' | 'answered';
  aiResponse?: string;
  expertAnswer?: string;
  expertName?: string;
  timestamp: string;
}

export default function App() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: '',
    category: 'Regulasi'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Semua');
  const [role, setRole] = useState<'user' | 'relawan' | 'admin'>('user');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [view, setView] = useState<'home' | 'knowledge' | 'consultation'>('home');
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setView('home');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', question: '', category: 'Regulasi' });
        fetchConsultations();
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultations');
      const data = await response.json();
      if (Array.isArray(data)) setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const response = await fetch('/api/knowledge');
      const data = await response.json();
      if (Array.isArray(data)) setKnowledge(data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchKnowledge();
  }, []);

  const categories = ['Semua', 'Regulasi', 'Teknis Tata Ruang', 'Kearifan Lokal'];
  const filteredConsultations = consultations.filter(c => {
    const categoryMatch = activeTab === 'Semua' || c.category === activeTab;
    return categoryMatch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={() => setView('home')} className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-brand-green-mid rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-green-mid/20 group-hover:rotate-6 transition-transform">
               <Leaf size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Tataruang<span className="text-brand-green-mid">.In</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <div className="flex bg-brand-slate-100 rounded-2xl p-1.5 gap-1">
              {(['user', 'relawan', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${role === r ? 'bg-white text-brand-green-mid shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button onClick={() => setView('knowledge')} className={`text-sm font-bold transition-colors ${view === 'knowledge' ? 'text-brand-green-mid' : 'text-slate-500 hover:text-brand-green-mid'}`}>Ensiklopedi</button>
            <button onClick={() => setView('consultation')} className={`text-sm font-bold transition-colors ${view === 'consultation' ? 'text-brand-green-mid' : 'text-slate-500 hover:text-brand-green-mid'}`}>Diskusi Publik</button>
            <button 
              onClick={scrollToForm}
              className="bg-brand-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Mulai Wicara
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <section className="pt-48 pb-24 px-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-[800px] bg-brand-green-mid/5 -z-10 rounded-bl-[200px] blur-3xl"></div>
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-brand-green-light border border-brand-green-mid/10 px-4 py-2 rounded-full mb-8">
                      <Sparkles size={14} className="text-brand-green-mid" />
                      <span className="badge-modern !bg-transparent border-none p-0 text-[10px]">Kearifan Lokal Nusantara & Pembangunan Berkelanjutan</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-extrabold text-brand-slate-900 leading-[1] mb-8 tracking-tighter">
                      Konsultasi Ruang <br /> 
                      <span className="text-brand-green-mid">Masa Depan.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-lg leading-relaxed mb-12 font-medium">
                      Platform partisipatif untuk merancang permukiman yang harmonis dengan alam, mengadopsi nilai luhur Nusantara melalui teknologi digital.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                       <button onClick={scrollToForm} className="btn-modern flex items-center gap-2">
                          Mulai Konsultasi Gratis <ArrowRight size={18} />
                       </button>
                       <button onClick={() => setView('knowledge')} className="px-8 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all border border-slate-100 flex items-center gap-2">
                          Buka Ensiklopedi <BookOpen size={16} />
                       </button>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative"
                  >
                     <div className="w-full aspect-square bg-brand-green-mid rounded-[4rem] overflow-hidden shadow-2xl rotate-3">
                        <img 
                          src="/src/assets/images/nusantara_nature_hero_1779174508766.png" 
                          alt="Nusantara" 
                          className="w-full h-full object-cover -rotate-3 scale-110"
                        />
                     </div>
                     <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-6">
                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-brand-green-light flex items-center justify-center"><User size={12} className="text-brand-green-mid"/></div>)}
                        </div>
                        <div>
                          <span className="block font-extrabold text-xl line-clamp-1">Aktif Partisipatif</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ribuan Aspirasi Terkelola</span>
                        </div>
                     </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Features Info */}
            <section className="py-24 px-6 border-y border-slate-50">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                   <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                         <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-bold">Terpercaya</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Konsultasi Anda ditangani oleh relawan ahli dan divalidasi oleh pakar tata ruang profesional.</p>
                   </div>
                   <div className="space-y-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                         <Zap size={24} />
                      </div>
                      <h3 className="text-xl font-bold">Smart Recommendation (AI)</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Dapatkan respon instan berbasis kearifan lokal Nusantara menggunakan teknologi kecerdasan buatan Gemini.</p>
                   </div>
                   <div className="space-y-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                         <GraduationCap size={24} />
                      </div>
                      <h3 className="text-xl font-bold">Ensiklopedi Budaya</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Pelajari bagaimana nenek moyang kita mengelola alam melalui ensiklopedi tata ruang yang komprehensif.</p>
                   </div>
                </div>

                <div className="bg-brand-slate-50 rounded-[3rem] p-12 border border-slate-100 flex flex-col items-center text-center">
                   <div className="badge-modern mb-4">Fitur Simulasi Multi-User</div>
                   <h3 className="text-2xl font-extrabold mb-4">Uji Peran Anda dalam Ekosistem.</h3>
                   <p className="text-slate-500 text-sm mb-8 max-w-lg">Pilih peran Anda untuk melihat bagaimana Tataruang.In melayani berbagai lapisan masyarakat.</p>
                   <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => {setRole('user'); setView('consultation')}}
                        className={`px-8 py-4 rounded-2xl text-xs font-bold transition-all border ${role === 'user' ? 'bg-brand-slate-900 text-white border-brand-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-green-mid'}`}
                      >
                         <span className="flex items-center gap-2 italic"><User size={14} /> Masyarakat Umum</span>
                      </button>
                      <button 
                        onClick={() => {setRole('relawan'); setView('consultation')}}
                        className={`px-8 py-4 rounded-2xl text-xs font-bold transition-all border ${role === 'relawan' ? 'bg-brand-green-mid text-white border-brand-green-mid shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-green-mid'}`}
                      >
                         <span className="flex items-center gap-2"><GraduationCap size={14} /> Relawan Ahli</span>
                      </button>
                      <button 
                        onClick={() => {setRole('admin'); setView('consultation')}}
                        className={`px-8 py-4 rounded-2xl text-xs font-bold transition-all border ${role === 'admin' ? 'bg-orange-500 text-white border-orange-500 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-green-mid'}`}
                      >
                         <span className="flex items-center gap-2"><Shield size={14} /> Administrator</span>
                      </button>
                   </div>
                </div>
              </div>
            </section>

            {/* Form Section */}
            <section id="konsultasi" ref={formRef} className="py-40 px-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-brand-slate-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green-mid/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                   
                   <div className="relative z-10">
                      <h2 className="text-5xl font-extrabold text-white mb-6 text-center tracking-tight">Ajukan Wicara.</h2>
                      <p className="text-brand-green-100/60 mb-16 text-center text-lg">Konsultasikan kebutuhan tata ruang Anda secara gratis dan dapatkan rekomendasi berbasis kearifan lokal.</p>

                      {submitSuccess ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/5">
                            <AnimatePresence mode="wait">
                              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="space-y-8">
                                <div className="w-20 h-20 bg-brand-green-mid rounded-full mx-auto flex items-center justify-center text-white mb-6">
                                  <Send size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-white">Aspirasi Terkirim!</h3>
                                <p className="text-white/60 max-w-sm mx-auto">Tim kami dan AI sedang menyiapkan rekomendasi terbaik untuk Anda.</p>
                                <div className="flex gap-4 justify-center">
                                   <button onClick={() => {setSubmitSuccess(false); setView('consultation')}} className="btn-modern !bg-white !text-slate-900">Lihat Diskusi</button>
                                   <button onClick={() => setSubmitSuccess(false)} className="px-8 py-4 rounded-xl font-bold text-white/60 hover:text-white transition-colors">Tanya Lagi</button>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">Nama Lengkap</label>
                                <input 
                                  required name="name" value={formData.name} onChange={handleInputChange}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-green-mid/50 outline-none transition-all placeholder:text-white/20"
                                  placeholder="Contoh: Sabit Nur Kamal"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">Email Kontak</label>
                                <input 
                                  required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-green-mid/50 outline-none transition-all placeholder:text-white/20"
                                  placeholder="email@anda.com"
                                />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">Fokus Konsultasi</label>
                             <div className="relative">
                               <select 
                                name="category" value={formData.category} onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-green-mid/50 outline-none transition-all appearance-none cursor-pointer"
                               >
                                  {categories.slice(1).map(c => <option key={c} value={c} className="bg-brand-slate-900">{c}</option>)}
                               </select>
                               <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">Detail Permasalahan / Rencana</label>
                             <textarea 
                              required name="question" value={formData.question} onChange={handleInputChange}
                              rows={6}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-green-mid/50 outline-none transition-all placeholder:text-white/20 resize-none"
                              placeholder="Ceritakan permasalahan tata daerah Anda, atau rencana pembangunan permukiman Anda..."
                             />
                          </div>
                          <button 
                            disabled={isSubmitting}
                            className="w-full btn-modern !bg-white !text-brand-slate-900 hover:!bg-brand-green-mid hover:!text-white flex items-center justify-center gap-3 py-6"
                          >
                            {isSubmitting ? 'Menganalisis Aspirasi...' : 'Dapatkan Rekomendasi Sekarang'}
                            {!isSubmitting && <Sparkles size={18} />}
                          </button>
                        </form>
                      )}
                   </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'knowledge' && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-20 px-6 max-w-7xl mx-auto"
          >
            <div className="mb-16">
              <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Ensiklopedi Tata Ruang.</h2>
              <p className="text-slate-500 max-w-2xl font-medium">Dokumentasi kearifan lokal Nusantara dalam pengelolaan ruang dan harmoni alam yang diwariskan secara turun temurun.</p>
            </div>

            {selectedKnowledge ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="lg:col-span-2 space-y-10">
                    <button onClick={() => setSelectedKnowledge(null)} className="flex items-center gap-2 text-brand-green-mid font-bold text-sm mb-4">
                       <ArrowRight className="rotate-180" size={16} /> Kembali
                    </button>
                    <div className="w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
                       <img src={selectedKnowledge.imageUrl} className="w-full h-full object-cover" alt={selectedKnowledge.title} />
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <span className="badge-modern">{selectedKnowledge.category}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedKnowledge.region}</span>
                       </div>
                       <h3 className="text-5xl font-extrabold tracking-tight">{selectedKnowledge.title}</h3>
                       <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
                          {selectedKnowledge.content.split('\n').map((p, i) => <p key={i} className="mb-6">{p}</p>)}
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="bg-brand-slate-50 p-8 rounded-[2rem] border border-slate-100">
                       <h4 className="font-bold mb-4">Bagikan Pengetahuan</h4>
                       <p className="text-xs text-slate-500 mb-6 leading-relaxed">Bantu kami mempertahankan dan menyebarkan kearifan lokal ini untuk masa depan yang lebih baik.</p>
                       <button className="w-full py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all">Salin Tautan</button>
                    </div>
                    <div className="bg-brand-green-mid/5 p-8 rounded-[2rem] border border-brand-green-mid/10">
                       <Info className="text-brand-green-mid mb-4" />
                       <h4 className="font-bold mb-2">Tahukah Anda?</h4>
                       <p className="text-xs text-brand-green-dark/60 leading-relaxed font-medium">Prinsip berkelanjutan kearifan lokal seringkali lebih efektif dibanding metode modern dalam mitigasi banjir.</p>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {knowledge.map((item) => (
                  <motion.div 
                    whileHover={{ y: -10 }}
                    key={item.id}
                    onClick={() => setSelectedKnowledge(item)}
                    className="card-modern overflow-hidden group cursor-pointer"
                  >
                    <div className="h-56 overflow-hidden">
                       <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                    </div>
                    <div className="p-10">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-green-mid">{item.category}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.region}</span>
                       </div>
                       <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-green-mid transition-colors">{item.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === 'consultation' && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-20 px-6 max-w-7xl mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                 <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Diskusi Publik.</h2>
                 <p className="text-slate-500 font-medium">Transparansi aspirasi warga dan solusi cerdas dari para pakar relawan Nusantara.</p>
              </div>
              <div className="flex gap-2">
                {categories.map((cat) => (
                   <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-8 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-brand-green-mid text-white shadow-lg shadow-brand-green-mid/20' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                   >
                     {cat}
                   </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredConsultations.map((c) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={c.id}
                  className="card-modern p-10 flex flex-col h-full bg-white"
                >
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                           <User size={18} />
                        </div>
                        <div>
                           <span className="block font-bold text-sm tracking-tight">{c.name}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                     </div>
                     <span className="badge-modern">{c.category}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-brand-slate-900 mb-8 leading-snug">
                    "{c.question}"
                  </h3>

                  <div className="space-y-6">
                    {/* AI Response Section */}
                    {c.aiResponse && (
                      <div className="p-6 bg-brand-green-light rounded-3xl border border-brand-green-mid/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green-mid/5 -mr-16 -mt-16 rounded-full blur-xl"></div>
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <Zap size={14} className="text-brand-green-mid" />
                          <span className="text-[10px] font-extrabold text-brand-green-mid uppercase tracking-widest">Rekomendasi Cerdas AI</span>
                        </div>
                        <div className="text-sm text-brand-green-dark/80 leading-relaxed relative z-10 prose prose-sm max-w-none">
                           <ReactMarkdown>{c.aiResponse}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Expert Answer Section */}
                    {c.status === 'answered' ? (
                      <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                         <div className="flex items-center gap-2 mb-3">
                            <GraduationCap size={14} className="text-blue-600" />
                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Jawaban Pakar: {c.expertName}</span>
                         </div>
                         <p className="text-sm text-slate-600 leading-relaxed font-medium">{c.expertAnswer}</p>
                      </div>
                    ) : (
                      (role === 'relawan' || role === 'admin') && (
                        <div className="pt-4">
                           {answeringId === c.id ? (
                             <div className="space-y-4">
                                <textarea 
                                 value={answerText}
                                 onChange={(e) => setAnswerText(e.target.value)}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-brand-green-mid/20 transition-all h-32 outline-none"
                                 placeholder="Tulis jawaban validasi pakar..."
                                />
                                <div className="flex gap-2">
                                   <button 
                                    onClick={async () => {
                                      const resp = await fetch('/api/answer', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ consultationId: c.id, answer: answerText, volunteerName: role === 'admin' ? 'Administrator' : 'Pakar Volunteer' })
                                      });
                                      if (resp.ok) { setAnsweringId(null); setAnswerText(''); fetchConsultations(); }
                                    }}
                                    className="bg-brand-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all"
                                   >
                                     Kirim Jawaban
                                   </button>
                                   <button onClick={() => setAnsweringId(null)} className="text-slate-400 text-xs font-bold hover:text-slate-600 px-4">Batal</button>
                                </div>
                             </div>
                           ) : (
                             <button 
                               onClick={() => setAnsweringId(c.id)}
                               className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:border-brand-green-mid hover:text-brand-green-mid transition-all flex items-center justify-center gap-2"
                             >
                                <MessageSquare size={14} /> Berikan Validasi Pakar
                             </button>
                           )}
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green-mid rounded-lg flex items-center justify-center text-white">
               <Leaf size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Tataruang<span className="text-brand-green-mid">.In</span></span>
          </div>
          <div className="flex gap-10 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
             <a href="#" className="hover:text-brand-green-mid transition-colors">Instagram</a>
             <a href="#" className="hover:text-brand-green-mid transition-colors">Linkedin</a>
             <a href="#" className="hover:text-brand-green-mid transition-colors">Twitter</a>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">© 2026 Tataruang.In — Harmoni Nusantara untuk Permukiman Berkelanjutan</p>
        </div>
      </footer>
    </div>
  );
}
