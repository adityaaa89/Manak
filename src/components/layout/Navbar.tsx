import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
const logoImg = "data:image/png;base64,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";
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
              <img src={logoImg} alt="Manak Logo" className="h-12 w-auto object-contain rounded-lg" />
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

