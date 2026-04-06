import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  BarChart3,
  MousePointer2,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.jpg';

// Helper for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

/**
 * NAVBAR — "The Floating Island"
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-4xl transition-all duration-500 font-sans">
      <div className={cn(
        "flex items-center justify-between px-6 py-3 transition-all duration-500 rounded-[2rem] border",
        isScrolled
          ? "bg-[#F2F0E9]/60 backdrop-blur-xl border-[#1A1A1A]/10 shadow-lg py-2"
          : "bg-transparent border-transparent"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tighter text-[#2E4036] uppercase">Verdify</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Insights', 'Workflow', 'Solutions'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold text-[#1A1A1A]/60 hover:text-[#2E4036] transition-colors"
            >
              {item}
            </a>
          ))}
          <Link to="/track" className="text-sm font-semibold text-[#1A1A1A]/60 hover:text-[#2E4036] transition-colors">
            Track Event
          </Link>
        </div>

        <Link to="/contact">
          <button className="hidden sm:flex items-center gap-2 bg-[#2E4036] text-[#F2F0E9] px-5 py-2 rounded-full text-sm font-bold hover:scale-[1.03] transition-all duration-300 ease-magnetic active:scale-95 group overflow-hidden relative">
            <span className="relative z-10">Book a consultation</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-clay translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </Link>
      </div>
    </nav>
  );
};

/**
 * HERO SECTION — "The Opening Shot"
 */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });

      gsap.to(".hero-bg", {
        scale: 1.1,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center px-6 pt-24 pb-32">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Dark Misty Mountains"
          className="hero-bg w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-moss/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl text-center text-[#F2F0E9] flex flex-col items-center">
        {/* Pill Badge */}
        <div className="hero-reveal mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] md:text-xs font-mono tracking-widest uppercase font-bold text-[#F2F0E9]">
            <Sparkles className="w-3 h-3 text-clay" />
            Sustainability Intelligence v1.0
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-reveal text-5xl md:text-8xl font-black tracking-tight leading-[1.1] md:leading-[1] mb-6 flex flex-col items-center">
          <span className="block">Make Every Event</span>
          <span className="block italic font-serif text-clay text-6xl md:text-[10rem] mt-2 md:mt-4 py-2">Measurable.</span>
        </h1>

        {/* Subtext */}
        <p className="hero-reveal text-lg md:text-xl text-[#F2F0E9]/80 max-w-2xl mx-auto mb-12 font-medium font-sans text-balance">
          Turn every event into verifiable sustainability data and ESG-ready reports
        </p>

        {/* CTA Buttons */}
        <div className="hero-reveal flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md sm:max-w-none">
          <Link to="/track" className="w-full sm:w-auto">
            <button className="w-full h-full bg-clay text-[#1A1A1A] px-8 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 ease-magnetic shadow-2xl shadow-clay/20 flex items-center justify-center gap-3 active:scale-95 group relative overflow-hidden">
              <span className="relative z-10 font-black uppercase tracking-tight">Track Your First Event</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </Link>
          <button className="w-full sm:w-auto bg-white/5 border border-white/20 text-[#F2F0E9] px-8 py-4 rounded-full font-bold hover:bg-white/10 hover:scale-[1.03] transition-all duration-300 ease-magnetic flex items-center justify-center gap-3 active:scale-95 group backdrop-blur-sm">
            <span className="font-black uppercase tracking-tight">Learn More</span>
            <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * FEATURES — Interactive Functional Artifacts
 */
const Features = () => {
  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-[#F2F0E9]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 space-y-4 font-sans">
          <h2 className="text-4xl md:text-6xl font-black text-[#2E4036] tracking-tighter">How Verdify Works</h2>
          <p className="text-lg text-[#1A1A1A]/60 max-w-2xl font-medium">Measure event impact, track improvements, and generate ESG-ready reports.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1 — Event Score */}
          <EventScoreCard />

          {/* Card 2 — Progress Tracker */}
          <ProgressTrackerCard />

          {/* Card 3 — Report Ready */}
          <ReportReadyCard />
        </div>
      </div>
    </section>
  );
};

const EventScoreCard = () => {
  const [cards, setCards] = useState([
    { id: 1, label: "Venue Audit", score: 92, color: "bg-[#2E4036]" },
    { id: 2, label: "Catering Impact", score: 78, color: "bg-clay" },
    { id: 3, label: "Travel Footprint", score: 85, color: "bg-[#1A1A1A]" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const next = [...prev];
        const last = next.pop();
        next.unshift(last);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#F2F0E9] rounded-[2rem] border border-[#1A1A1A]/10 p-8 shadow-sm h-[500px] flex flex-col group hover:shadow-xl transition-shadow duration-500 overflow-hidden font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h3 className="text-xl font-black text-[#2E4036] uppercase tracking-tight">Event Score</h3>
          <p className="text-sm text-[#1A1A1A]/50 font-medium">A clear sustainability score for every event</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-clay/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#2E4036]" />
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={cn(
              "absolute w-full max-w-[240px] aspect-[4/5] rounded-3xl p-6 transition-all duration-700 ease-spring border border-white/20 shadow-2xl",
              card.color,
              i === 0 ? "scale-100 opacity-100 z-30 translate-y-0" :
                i === 1 ? "scale-90 opacity-60 z-20 translate-y-8 blur-[2px]" :
                  "scale-80 opacity-30 z-10 translate-y-16 blur-[4px]"
            )}
          >
            <div className="h-full flex flex-col justify-between text-[#F2F0E9]">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60 font-bold">Module 0{card.id}</span>
              <div className="space-y-1">
                <span className={cn("text-4xl font-black leading-none", card.color === 'bg-clay' ? "text-[#1A1A1A]" : "")}>{card.score}</span>
                <p className={cn("text-sm font-bold opacity-80", card.color === 'bg-clay' ? "text-[#1A1A1A]" : "")}>{card.label}</p>
              </div>
              <div className={cn("h-1.5 w-full rounded-full overflow-hidden", card.color === 'bg-clay' ? "bg-[#1A1A1A]/10" : "bg-white/20")}>
                <div className={cn("h-full transition-all duration-1000", card.color === 'bg-clay' ? "bg-[#1A1A1A]" : "bg-white")} style={{ width: `${card.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#1A1A1A]/40 font-medium mt-12 line-clamp-2">
        Understand your event’s impact instantly with clear, standardized metrics.
      </p>
    </div>
  );
};

const ProgressTrackerCard = () => {
  const [text, setText] = useState("");
  const messages = [
    "> Initializing Sustainability Audit...",
    "> Fetching energy consumption data of venue...",
    "> Analyzing catering supply chain emissions...",
    "> Calculating delegate travel footprint...",
    "> Benchmark matched: ISO 20121 compliant.",
    "> Real-time progress tracking enabled.",
    "> Saving progress to ESG disclosure vault.",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let charIdx = 0;
    let currentMsg = messages[msgIdx];

    const interval = setInterval(() => {
      if (charIdx <= currentMsg.length) {
        setText(currentMsg.substring(0, charIdx));
        charIdx++;
      } else {
        setTimeout(() => {
          setMsgIdx((prev) => (prev + 1) % messages.length);
          charIdx = 0;
        }, 1500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [msgIdx]);

  return (
    <div className="bg-[#F2F0E9] rounded-[2rem] border border-[#1A1A1A]/10 p-8 shadow-sm h-[500px] flex flex-col group hover:shadow-xl transition-shadow duration-500 font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-black text-[#2E4036] uppercase tracking-tight">Progress Tracker</h3>
          <p className="text-sm text-[#1A1A1A]/50 font-medium">See improvement across every event</p>
        </div>
        <Activity className="w-5 h-5 text-clay" />
      </div>

      <div className="flex-1 bg-[#2E4036]/5 rounded-2xl p-6 font-mono text-[11px] leading-relaxed text-[#2E4036] border border-[#2E4036]/10 relative overflow-hidden">
        <div className="space-y-2">
          {messages.slice(0, msgIdx).map((msg, i) => (
            <div key={i} className="opacity-40">{msg}</div>
          ))}
          <div className="flex gap-1">
            <span className="whitespace-pre-wrap">{text}</span>
            <span className="w-1.5 h-3 bg-clay animate-pulse" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F2F0E9]/10 pointer-events-none" />
      </div>

      <p className="text-xs text-[#1A1A1A]/40 font-medium mt-8">
        Identify inefficiencies and improve sustainability performance across every event.
      </p>
    </div>
  );
};

const ReportReadyCard = () => {
  const cursorRef = useRef(null);
  const gridRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ repeat: -1 });

      timeline.to(cursorRef.current, {
        x: 80,
        y: 120,
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      })
        .to(cursorRef.current, { scale: 0.8, duration: 0.2 })
        .call(() => setActiveDay(2)) // Wednesday
        .to(cursorRef.current, { scale: 1, duration: 0.2 })
        .to(cursorRef.current, {
          x: 220,
          y: 200,
          duration: 1,
          delay: 0.5,
          ease: "power2.inOut"
        })
        .to(cursorRef.current, { scale: 0.8, duration: 0.2 })
        .to(cursorRef.current, {
          opacity: 0,
          duration: 0.5,
          delay: 0.2
        })
        .call(() => {
          setActiveDay(null);
        });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[#F2F0E9] rounded-[2rem] border border-[#1A1A1A]/10 p-8 shadow-sm h-[500px] flex flex-col group hover:shadow-xl transition-shadow duration-500 relative font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h3 className="text-xl font-black text-[#2E4036] uppercase tracking-tight">Report Ready</h3>
          <p className="text-sm text-[#1A1A1A]/50 font-medium">GHG Protocol and GRI-aligned, every time</p>
        </div>
        <LayoutDashboard className="w-5 h-5 text-clay" />
      </div>

      <div ref={gridRef} className="flex-1 bg-[#2E4036]/5 rounded-2xl p-6 border border-[#2E4036]/10 relative overflow-hidden">
        <div className="grid grid-cols-7 gap-2 mb-8">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg border border-[#2E4036]/10 flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                activeDay === i ? "bg-clay text-[#1A1A1A] border-clay scale-110 shadow-lg shadow-clay/20" : "bg-white/50 text-[#2E4036]/40"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {['GHG Protocol', 'GRI-aligned', 'ESG Ready'].map((label, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-[#2E4036]/5">
              <span className="text-[10px] font-bold text-[#2E4036]">{label}</span>
              <div className="w-4 h-4 rounded-full border border-[#2E4036]/20 flex items-center justify-center">
                {activeDay !== null && i === 0 && <CheckCircle2 className="w-3 h-3 text-clay" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <div className={cn(
            "px-4 py-2 rounded-lg text-[10px] font-bold border border-[#2E4036]/20 transition-all duration-300",
            activeDay !== null ? "bg-clay text-[#1A1A1A] border-clay" : "bg-white/50 text-[#2E4036]/40"
          )}>
            Generate Report
          </div>
        </div>

        <div ref={cursorRef} className="absolute top-0 left-0 pointer-events-none opacity-0 z-50">
          <MousePointer2 className="w-6 h-6 text-clay fill-clay drop-shadow-lg" />
        </div>
      </div>

      <p className="text-xs text-[#1A1A1A]/40 font-medium mt-12">
        Turn your event data into ESG reports in seconds.
      </p>
    </div>
  );
};

/**
 * Insights — "The Manifesto"
 */
const Insights = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-manifesto", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="insights" ref={containerRef} className="py-48 px-6 md:px-12 bg-[#1A1A1A] text-[#F2F0E9] relative overflow-hidden font-sans">
      {/* Parallax Texture Backdrop */}
      <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80"
          alt="Texture"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-24">
        <div className="space-y-6">
          <p className="reveal-manifesto text-sm font-mono uppercase tracking-[0.3em] text-clay font-bold">The Manifesto</p>
          <div className="space-y-12">
            <p className="reveal-manifesto text-xl md:text-2xl text-[#F2F0E9]/40 max-w-2xl font-medium leading-relaxed">
              Events shouldn't be guesswork: <br />
              <span className="text-[#F2F0E9]">Most corporate events generate waste, emissions, and costs — but no clear data..</span>
            </p>
            <h2 className="reveal-manifesto text-5xl md:text-8xl font-black tracking-tighter leading-none">
              Verdify turns every event <br />
              <span className="font-serif italic text-clay">into measurable, actionable data.</span> <br />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-24 border-t border-white/10">
          {[
            { title: "Measure", desc: "Track emissions, waste, and resource usage across every event." },
            { title: "Improve", desc: "Identify inefficiencies and reduce environmental and operational waste." },
            { title: "Report", desc: "Turn event data into clear, ESG-ready reports for stakeholders." }
          ].map((item, i) => (
            <div key={i} className="reveal-manifesto space-y-4">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-sm text-[#F2F0E9]/50 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Workflow — "Sticky Stacking Archive"
 */
const Workflow = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.Workflow-card');

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: ".Workflow-section",
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const scale = 1 - (progress * 0.1);
            const opacity = 1 - (progress * 0.5);

            gsap.to(card, {
              scale: scale,
              opacity: opacity,
              duration: 0.1,
              overwrite: "auto"
            });
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" ref={containerRef} className="Workflow-section bg-[#1A1A1A] relative z-10">
      <WorkflowCard
        step="01"
        title="Collect Event Data"
        desc="Import your event logistics — catering, venue, travel, and materials — in one place."
        icon={<Database className="w-12 h-12 text-clay" />}
        animation={<RotatingMotif />}
      />
      <WorkflowCard
        step="02"
        title="Measure & Analyze Impact"
        desc="Calculate emissions, waste, and resource usage using standardized methodologies."
        icon={<BarChart3 className="w-12 h-12 text-clay" />}
        animation={<LaserScan />}
      />
      <WorkflowCard
        step="03"
        title="Generate ESG Reports"
        desc="Turn your event data into clear, structured reports for internal teams and stakeholders."
        icon={<Globe className="w-12 h-12 text-clay" />}
        animation={<ReportArtifact />}
      />
    </section>
  );
};

const WorkflowCard = ({ step, title, desc, icon, animation }) => {
  return (
    <div className="Workflow-card h-screen w-full flex items-center justify-center sticky top-0 bg-[#1A1A1A] font-sans">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="space-y-8">
          <span className="text-sm font-mono text-clay font-black tracking-[0.5em]"> STEP {step}</span>
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-[#F2F0E9] leading-none">{title}</h2>
            <p className="text-xl text-[#F2F0E9]/40 max-w-md font-medium">{desc}</p>
          </div>
          <div>{icon}</div>
        </div>
        <div className="aspect-square relative flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-[#2E4036]/10 rounded-[4rem] border border-white/10" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {animation}
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Animations for Workflow steps
const RotatingMotif = () => (
  <div className="w-full h-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
    <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 text-clay">
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="15 10" />
      <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
      <path d="M100 0 L100 200 M0 100 L200 100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="65" y="65" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="75" y="75" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 100 100)" />
    </svg>
  </div>
);

const LaserScan = () => (
  <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
    <div className="grid grid-cols-10 grid-rows-10 gap-4 opacity-20">
      {Array.from({ length: 100 }).map((_, i) => (
        <div key={i} className="w-1 h-1 bg-clay rounded-full" />
      ))}
    </div>
    <div className="absolute top-0 left-0 w-full h-[3px] bg-clay shadow-[0_0_20px_rgba(158,216,179,0.8)] animate-[scan_4s_ease-in-out_infinite]" />
    <style dangerouslySetInnerHTML={{
      __html: `
            @keyframes scan {
                0%, 100% { top: 10%; opacity: 0; }
                10%, 90% { opacity: 1; }
                50% { top: 90%; }
            }
        `}} />
  </div>
);

/**
 * REPORT ARTIFACT — "Verifiable Disclosure"
 */
const ReportArtifact = () => (
  <div className="w-full h-full flex items-center justify-center p-12 overflow-hidden">
    <div className="relative w-full h-full max-w-[280px] aspect-[3/4] bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden">
      {/* Document Lines */}
      <div className="space-y-4 animate-pulse-soft">
        <div className="h-4 w-3/4 bg-white/20 rounded-full" />
        <div className="h-2 w-full bg-white/10 rounded-full" />
        <div className="h-2 w-5/6 bg-white/10 rounded-full" />
        <div className="h-2 w-4/6 bg-white/10 rounded-full" />
        <div className="pt-8 space-y-4">
          <div className="h-2 w-full bg-white/5 rounded-full" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
          <div className="h-2 w-3/4 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Scanning Laser */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#9ED8B3] shadow-[0_0_15px_#9ED8B3] animate-scan" />

      {/* Validation Emblem */}
      <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full border border-[#9ED8B3]/40 flex items-center justify-center scale-75 opacity-80 backdrop-blur-sm">
        <div className="w-6 h-6 rounded-full bg-[#9ED8B3]/20 flex items-center justify-center animate-pulse">
          <CheckCircle2 className="text-[#9ED8B3] w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Solutions / Solutions
 */
const Solutions = () => {
  return (
    <section id="solutions" className="relative z-20 py-32 px-6 md:px-12 bg-[#F2F0E9] text-[#1A1A1A] font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-[#2E4036] tracking-tighter">Start With Your First Event</h2>
          <p className="text-xl text-[#1A1A1A]/70 font-medium">Turn your events into measurable ESG outcomes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Ongoing", price: "Ongoing Tracking", features: ["Multiple events tracked", "Dashboard + insights", "Continuous improvement tracking", "Priority Support"] },
            { name: "Pilot", price: "Pilot Program", features: ["1–2 events analyzed", "Full sustainability report", "Recommendations for improvement"], popular: true },
            { name: "Enterprise", price: "Enterprise Solution", features: ["Portfolio-level analytics", "ESG reporting integration", "Custom workflows & support"] }
          ].map((Solutions, i) => (
            <div
              key={i}
              className={cn(
                "p-12 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2",
                Solutions.popular
                  ? "bg-[#2E4036] text-[#F2F0E9] border-[#2E4036] shadow-2xl shadow-[#2E4036]/20 scale-105"
                  : "bg-white border-[#1A1A1A]/20 hover:border-[#2E4036]/40 shadow-sm"
              )}
            >
              <div className="space-y-8 h-full flex flex-col">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold uppercase tracking-widest">{Solutions.name}</h3>
                  <div className="text-4xl font-black">{Solutions.price}</div>
                </div>

                <ul className="space-y-4 flex-1">
                  {Solutions.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm opacity-90 font-bold">
                      <CheckCircle2 className={cn("w-4 h-4", Solutions.popular ? "text-clay" : "text-[#2E4036]")} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className={cn(
                  "w-full py-4 rounded-full font-bold transition-all duration-300 active:scale-95 group relative overflow-hidden",
                  Solutions.popular ? "bg-clay text-[#1A1A1A]" : "bg-[#2E4036] text-[#F2F0E9]"
                )}>
                  <span className="relative z-10 font-black tracking-tight uppercase">Select Tier</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * FOOTER
 */
const Footer = () => {
  return (
    <footer id="footer" className="relative z-20 bg-[#1A1A1A] text-[#F2F0E9] rounded-t-[4rem] px-6 md:px-12 pt-24 pb-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
        <div className="col-span-2 space-y-8">
          <span className="text-3xl font-extrabold tracking-tighter text-[#F2F0E9] uppercase">Verdify</span>
          <p className="text-[#F2F0E9]/40 max-w-sm font-bold">Sustainability Intelligence for the world&apos;s most impactful events. Every gram counted. Every report verified.</p>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full w-fit">
            <div className="w-2 h-2 rounded-full bg-clay animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-clay uppercase">SYSTEM OPERATIONAL</span>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold uppercase tracking-widest text-clay text-sm">Platform</h4>
          <ul className="space-y-4 text-sm text-[#F2F0E9]/40 font-bold">
            <li><a href="#features" className="hover:text-[#F2F0E9] transition-colors">Features</a></li>
            <li><a href="#Workflow" className="hover:text-[#F2F0E9] transition-colors">Workflow</a></li>
            <li><a href="#solutions" className="hover:text-[#F2F0E9] transition-colors">Solutions</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold uppercase tracking-widest text-clay text-sm">Corporate</h4>
          <ul className="space-y-4 text-sm text-[#F2F0E9]/40 font-bold">
            <li><a href="#" className="hover:text-[#F2F0E9] transition-colors">Manifesto</a></li>
            <li><a href="#" className="hover:text-[#F2F0E9] transition-colors">Compliance</a></li>
            <li><a href="#" className="hover:text-[#F2F0E9] transition-colors">Privacy Cloud</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-[#F2F0E9]/20 tracking-widest font-black">
        <p>&copy; 2026 VERDIFY INTELLIGENCE CLOUD. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8 uppercase">
          <a href="#" className="hover:text-clay transition-colors">Terms of Workflow</a>
          <a href="#" className="hover:text-clay transition-colors">Disclosure Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Features />
      <Insights />
      <Workflow />
      <Solutions />
      <Footer />
    </div>
  );
}
