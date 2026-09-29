import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white print:hidden">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Manak Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-4">
              An AI-powered platform to help MSMEs, manufacturers, consumers, and students navigate BIS standards and certification requirements.
            </p>
            <div className="flex items-center gap-3">
              {/* Social icons */}
              {['X', 'in', 'YT', 'FB'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-xs font-bold transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* About column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-blue-300">About</h3>
            <ul className="space-y-2.5 text-sm text-blue-200">
              {[
                { label: 'About BIS', href: '#' },
                { label: 'About this Platform', href: '#' },
                { label: 'Standards Development', href: '#' },
                { label: 'BIS Vision & Mission', href: '#' },
                { label: 'Annual Report', href: '#' },
                { label: 'Disclaimer', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white transition-colors flex items-center gap-1 group">
                    {item.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-blue-300">Services</h3>
            <ul className="space-y-2.5 text-sm text-blue-200">
              {[
                { label: 'Standards Discovery', path: '/standards-discovery' },
                { label: 'Certification Journey', path: '/certification-journey' },
                { label: 'Factory Readiness', path: '/factory-readiness' },
                { label: 'Snap & Verify', path: '/snap-verify' },
                { label: 'Laboratory Finder', path: '/laboratory-finder' },
                { label: 'Compliance Blueprint', path: '/compliance-blueprint' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Contact column */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-blue-300">Help & Contact</h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">User Guide</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Report an Issue</a>
              </li>
              <li className="pt-2">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">BIS Helpline</div>
                    <div>1800-11-4899 (Toll Free)</div>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <a href="mailto:headbis@bis.gov.in" className="hover:text-white transition-colors">headbis@bis.gov.in</a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110 002</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-300">
            <div>
              © 2025 Bureau of Indian Standards, Ministry of Commerce &amp; Industry, Government of India. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-white/30">|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <span className="text-white/30">|</span>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
              <span className="text-white/30">|</span>
              <span>Last Updated: 27 Sep 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom flag stripe */}
      <div className="gov-stripe w-full" />
    </footer>
  );
}
