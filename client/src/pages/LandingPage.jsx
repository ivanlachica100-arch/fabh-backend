import React from 'react';
import heroImg from '../assets/hero.png';
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  GraduationCap, 
  Footprints,
  LogIn,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage({ onStartExploring, onSelectCampus, onOpenAuth }) {
  const campuses = [
    {
      id: 'upang',
      name: 'PHINMA UPang',
      area: 'Downtown / Arellano',
    },
    {
      id: 'uc',
      name: 'Univ. of Luzon (UL)',
      area: 'Perez Boulevard',
    },
    {
      id: 'psu',
      name: 'PSU Dagupan',
      area: 'Guilig / Lingayen Rd',
    },
    {
      id: 'dcu',
      name: 'DCU / PIMSAT',
      area: 'Tapuac District',
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Embedded Clean Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-xs sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900">FABH</span>
            <span className="text-[10px] block text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">Dagupan City</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartExploring}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Explore Map
          </button>
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In / Register
          </button>
        </div>
      </header>

      {/* Main Responsive Body - Fill Available Viewport Space */}
      <main className="max-w-7xl mx-auto px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center gap-8 w-full">
        
        {/* Two-Column Top Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading + Copy + Action */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300/60 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dagupan City Student Housing & Decision System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Find your ideal boarding house near campus with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                data-driven confidence.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Calculate actual street walking commutes, compare monthly rent allowances, and rank verified boarding houses near your Dagupan university using algorithmic scoring.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartExploring}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Launch Interactive Map
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm px-5 py-3 rounded-xl transition cursor-pointer"
              >
                Register Account
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic / Card */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group">
              <img 
                src={heroImg} 
                alt="Dagupan Student Boarding Houses" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Campus Proximity
                </span>
                <p className="text-sm font-semibold mt-0.5">Arellano • Perez Blvd • Tapuac • Lingayen Rd</p>
              </div>
            </div>
          </div>

        </div>

        {/* Campus Quick-Action Pills */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Filter By Campus Landmark
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {campuses.map((camp) => (
              <button
                key={camp.id}
                type="button"
                onClick={() => {
                  if (onSelectCampus) onSelectCampus(camp.id);
                  onStartExploring();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block transition">
                  {camp.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                  {camp.area}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5 shrink-0">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Street-Level Commute</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real road geometry and walk-time estimates powered by free OSRM routing.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">TOPSIS Ranking AI</h3>
              <p className="text-xs text-slate-500 mt-0.5">Multi-criteria quantitative algorithm balancing price, distance, and amenities.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 mt-0.5 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admin Verified</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspection of government IDs and property permits prior to landlord listing approval.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Minimal Bottom Bar */}
      <footer className="py-3 px-6 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        FABH Platform • Capstone Research Project • PHINMA University of Pangasinan
      </footer>

    </div>
  );
}