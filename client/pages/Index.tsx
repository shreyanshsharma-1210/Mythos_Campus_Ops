import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Map,
  Activity,
  Briefcase,
  Zap,
  Scroll,
  ArrowRight,
  ClipboardList,
  Wrench,
  Search,
  GraduationCap
} from "lucide-react";

export default function Index() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const features = [
    {
      title: "Grievance Portal",
      sub: "Smart Resolution",
      desc: "File and track complaints directly to department heads with real-time status updates and priority escalation.",
      icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
      color: "border-purple-200 bg-purple-50"
    },
    {
      title: "Maintenance Tracker",
      sub: "Facility Ops",
      desc: "Report broken equipment or facility issues in hostels and academic blocks for quick assignment and repair.",
      icon: <Wrench className="w-6 h-6 text-blue-600" />,
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "Lost & Found",
      sub: "Campus Hub",
      desc: "Quickly report lost items or log found belongings in a centralized database accessible to all students.",
      icon: <Search className="w-6 h-6 text-amber-600" />,
      color: "border-amber-200 bg-amber-50"
    },
    {
      title: "Anti-Ragging Vault",
      sub: "Security First",
      desc: "Submit confidential reports regarding harassment or ragging directly to the disciplinary committee.",
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
      color: "border-red-200 bg-red-50"
    },
    {
      title: "Attendance Intel",
      sub: "Analytics",
      desc: "Monitor your attendance percentages across all courses with predictive alerts before falling short.",
      icon: <Activity className="w-6 h-6 text-cyan-600" />,
      color: "border-cyan-200 bg-cyan-50"
    },
    {
      title: "Canteen Predictor",
      sub: "Smart Dining",
      desc: "Check real-time crowd levels and popular menu items at campus eateries to avoid long queues.",
      icon: <Zap className="w-6 h-6 text-pink-600" />,
      color: "border-pink-200 bg-pink-50"
    },
    {
      title: "Scholarship Finder",
      sub: "Financial Aid",
      desc: "Discover and apply for matching university and external scholarships based on your academic profile.",
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      color: "border-indigo-200 bg-indigo-50"
    },
    {
      title: "Policy Navigator",
      sub: "Rulebook AI",
      desc: "Easily search and understand university guidelines, grading policies, and academic regulations.",
      icon: <Scroll className="w-6 h-6 text-yellow-600" />,
      color: "border-yellow-200 bg-yellow-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-slate-900/20 backdrop-blur-md border-b border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors ${scrollY > 50 ? 'text-slate-900' : 'text-white'}`}>CampusOPS</span>
          </div>

          <div className={`hidden md:flex items-center gap-8 font-medium text-sm transition-colors ${scrollY > 50 ? 'text-slate-600' : 'text-white/80'}`}>
            <button onClick={() => scrollToSection('features')} className={`hover:${scrollY > 50 ? 'text-blue-600' : 'text-white'} transition-colors`}>Features</button>
            <button onClick={() => scrollToSection('security')} className={`hover:${scrollY > 50 ? 'text-blue-600' : 'text-white'} transition-colors`}>Security</button>
            <button onClick={() => scrollToSection('contact')} className={`hover:${scrollY > 50 ? 'text-blue-600' : 'text-white'} transition-colors`}>Contact</button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className={`hidden sm:block text-sm font-medium transition-colors ${scrollY > 50 ? 'text-slate-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
              Sign In
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 shadow-md shadow-blue-600/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Video Background Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <video 
            src="/hero-video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-12 z-10 text-left px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              System Active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
              Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">OPS</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 font-light drop-shadow-md leading-relaxed max-w-xl">
              The Next Generation of Intelligent Campus Management.
            </p>
            
            <div className="pt-2 flex items-center gap-4">
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-6 text-base font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                  Access Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Original Hero Section (Moved Below) */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 -z-10" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              CampusOPS Version 2.0 Live
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Smarter Operations.<br/>
              <span className="text-blue-600">Better Campus</span><br/>
              Experience.
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
              Streamline your university life. Manage grievances, track maintenance, find scholarships, and stay informed with intelligent campus services.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-8 rounded-xl text-base group">
                  Access Portal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => scrollToSection('features')}
                className="h-14 px-8 rounded-xl text-base bg-white border-slate-200 hover:bg-slate-50"
              >
                Explore Modules
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Abstract visual representation of dashboard instead of placeholder image */}
            <div className="relative w-full aspect-square max-w-[600px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl transform rotate-3 scale-105 opacity-50" />
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="p-8 flex-1 flex flex-col gap-6">
                  <div className="flex gap-6">
                    <div className="w-1/3 h-32 bg-blue-50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 mb-4" />
                      <div>
                        <div className="w-12 h-2 bg-blue-200 rounded-full mb-2" />
                        <div className="w-24 h-2 bg-slate-200 rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1 h-32 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                      <div className="flex items-end h-full gap-2 pt-8">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                          <div key={i} className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                    <div className="w-32 h-4 bg-slate-200 rounded-full mb-6" />
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="flex-1">
                            <div className="w-full h-2 bg-slate-200 rounded-full mb-2" />
                            <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">System Secure</div>
                    <div className="text-xs text-slate-500">All checks passed</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Core Campus Modules
            </h2>
            <p className="text-lg text-slate-600">
              Integrated tools designed to make campus life seamless, secure, and efficient for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                  {item.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-red-400 text-sm font-medium mb-8">
                <ShieldCheck className="w-4 h-4" />
                Campus Safety First
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Uncompromising <br/>
                <span className="text-red-400">Anti-Ragging Protection</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Your safety is our top priority. Our advanced reporting systems ensure anonymous, secure, and instant communication with campus authorities for immediate action against any policy violations.
              </p>
              <ul className="space-y-4">
                {[
                  "Anonymous Incident Reporting",
                  "Real-time Alert Dispatch",
                  "Secure Evidence Uploads",
                  "Direct Committee Access"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
               <div className="aspect-square rounded-full border border-slate-800 relative flex items-center justify-center max-w-[400px] mx-auto">
                  <div className="absolute inset-8 rounded-full border border-slate-700" />
                  <div className="absolute inset-16 rounded-full border border-slate-600" />
                  <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center z-10 border border-slate-700 shadow-2xl shadow-red-500/20">
                     <ShieldCheck className="w-16 h-16 text-red-400" />
                  </div>
                  
                  {/* Orbits */}
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-0 left-1/2 w-4 h-4 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8"
                  >
                    <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                  </motion.div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer Section */}
      <section id="contact" className="py-24 bg-white border-t border-slate-100 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to upgrade your campus?</h2>
          <p className="text-xl text-slate-600 mb-10">
            Join thousands of students and administrators already using Campus Ops to simplify their daily workflows.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-10 rounded-xl text-lg shadow-xl shadow-blue-600/20">
              Get Started Now
            </Button>
          </Link>
          
          <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <div>© 2026 Campus Ops. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-slate-800 transition-colors"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: scrollY > 500 ? 1 : 0,
          scale: scrollY > 500 ? 1 : 0
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowRight className="w-5 h-5 -rotate-90" />
      </motion.button>
    </div>
  );
}
