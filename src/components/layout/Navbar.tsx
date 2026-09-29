import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import {
  Menu, X, ChevronDown, Globe, LogIn,
  Shield
} from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Standards', path: '/standards-discovery' },
  { label: 'AI Assistant', path: '/evidence-assistant' },
  { label: 'Journey', path: '/certification-journey' },
  { label: 'Readiness', path: '/factory-readiness' },
  { label: 'Verify', path: '/snap-verify' },
  { label: 'Labs', path: '/laboratory-finder' },
  { label: 'Blueprint', path: '/compliance-blueprint' },
];

const languages = ['English', 'हिन्दी', 'मराठी', 'தமிழ்', 'తెలుగు', 'বাংলা'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('English');
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Indian flag stripe */}
      <div className="gov-stripe w-full" />

      {/* Top utility bar */}
      <div className="bg-[#020617] text-white/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <span>Ministry of Commerce &amp; Industry, Government of India</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline">Bureau of Indian Standards (BIS)</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white transition-colors">Skip to Content</a>
            <span className="text-white/40">|</span>
            <a href="#" className="hover:text-white transition-colors">Screen Reader</a>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1">
              <span>A-</span>
              <span className="font-bold">A</span>
              <span className="text-base">A+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-[#0f172a] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src={logoImg} alt="Manak Logo" className="h-12 w-auto object-contain" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 xl:px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isActive(link.path)
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-100 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{activeLang}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-xl border border-gray-200 py-1 min-w-[140px] z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setActiveLang(lang); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-700 ${activeLang === lang ? 'text-[#0f172a] font-semibold bg-blue-50' : ''}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Login */}
              <Link
                to="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#0f172a] text-xs font-semibold rounded hover:bg-blue-50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#020617] border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm rounded transition-colors ${
                    isActive(link.path)
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-300" />
                <select
                  value={activeLang}
                  onChange={e => setActiveLang(e.target.value)}
                  className="bg-white text-gray-900 border border-gray-200 text-xs px-2 py-1 rounded appearance-none pr-6 outline-none shadow-sm"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
