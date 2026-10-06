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
  CheckCircle2,
  LayoutDashboard,
  Building,
  Mail,
  Users,
  Award,
  HelpCircle
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function LandingPage({ 
  onStartExploring, 
  onSelectCampus, 
  onOpenAuth, 
  user, 
  onOpenDrawer, 
  onNavigateLandlord 
}) {
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

  // Team roster with 2x2 photo slot ready (set photo to image URL or leave null)
  const teamMembers = [
    {
      name: 'Cortez, Roan P.',
      role: 'Full-Stack Developer & Lead Architect',
      photo: null,
      highlight: true,
    },
    {
      name: 'Senin, Ivan M.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Subang, Reymart N.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Duey, John Paul P.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Villacorta, Ian James R.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Oblero, Aldrin C.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Nerizon, Sebastian U.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
    {
      name: 'Ventanilla, Andrei Demitri T.',
      role: 'Capstone Researcher & Contributor',
      photo: null,
      highlight: false,
    },
  ];

  const advisers = [
    'Engilbert Comadre',
    'Ariel Almonte',
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200">
      
      {/* Embedded Clean Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xs sticky top-0 z-20 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">FABH</span>
            <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase -mt-0.5">Dagupan City</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartExploring}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Explore Map
          </button>

          {/* Context-Aware Navbar Actions */}
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={onOpenDrawer}
                className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold max-w-[100px] truncate">{user.name}</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {user.role}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-lg shadow-sm border border-transparent dark:border-slate-700 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* Main Responsive Body */}
      <main className="max-w-7xl mx-auto px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center gap-12 w-full">
        
        {/* Two-Column Top Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading + Copy + Action */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Dagupan City Student Housing & Decision System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Find your ideal boarding house near campus with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                data-driven confidence.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
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

              {/* Dynamic Secondary Action */}
              {user ? (
                user.role === 'landlord' ? (
                  <button
                    type="button"
                    onClick={onNavigateLandlord}
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-semibold text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    <Building className="w-4 h-4" />
                    Landlord Portal
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenDrawer}
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Account Dashboard
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Register Account
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic / Card */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
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
                <p className="text-sm font-semibold mt-0.5 text-slate-200">Arellano • Perez Blvd • Tapuac • Lingayen Rd</p>
              </div>
            </div>
          </div>

        </div>

        {/* Campus Quick-Action Pills */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 text-left transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 block transition">
                  {camp.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  {camp.area}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3 transition-colors duration-200">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 border border-emerald-100 dark:border-emerald-900/40">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Street-Level Commute</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real road geometry and walk-time estimates powered by free OSRM routing.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3 transition-colors duration-200">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 border border-blue-100 dark:border-blue-900/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">TOPSIS Ranking AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-criteria quantitative algorithm balancing price, distance, and amenities.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3 transition-colors duration-200">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 border border-amber-100 dark:border-amber-900/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Admin Verified</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Inspection of government IDs and property permits prior to landlord listing approval.</p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NEW: Capstone Research Team & Project Creators Section   */}
        {/* ======================================================== */}
        <section className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" />
                <span>Capstone Project Development Team</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Meet the Researchers & Creators
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                PHINMA University of Pangasinan • College of Information Technology Education
              </p>
            </div>

            {/* Advisers Badge Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 sm:min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Capstone Advisers</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 font-medium">
                {advisers.map((adv) => (
                  <li key={adv} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2x2 Member Grid (Cards ready for photo replacement) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center group ${
                  member.highlight
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* 2x2 Square Photo Slot */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-3 shrink-0 relative">
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-slate-600 dark:text-slate-300">
                      {member.name.split(',')[0].slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  {member.highlight && (
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Fullstack Lead" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {member.name}
                </h3>
                <span className={`text-[10px] mt-1 font-semibold leading-tight ${
                  member.highlight ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* NEW: Contact Us & Technical Inquiries Card              */}
        {/* ======================================================== */}
        <section className="w-full bg-linear-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need Help or Have Concerns?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
              Have questions, feedback, or need support?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Reach out directly to our lead developer and research team for system accreditation inquiries, technical bug reports, or landlord accreditation support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="mailto:ropa.cortez.up@phinmaed.com?subject=FABH%20Platform%20Support%20Inquiry"
              className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-3 rounded-xl font-bold text-xs shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 text-emerald-700" />
              ropa.cortez.up@phinmaed.com
            </a>
          </div>
        </section>

      </main>

      {/* Modern Enriched Bottom Footer */}
      <footer className="py-5 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200 text-center space-y-1">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          FABH: Web-Based Boarding House Finder & Decision Platform for Dagupan City
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          College of Information Technology Education • PHINMA University of Pangasinan • Capstone Project 2026
        </p>
      </footer>

    </div>
  );
}