import { Link } from 'react-router-dom';
import {
  Factory, Camera, BookOpen, ArrowRight, CheckCircle2,
  Shield, Award, Search, Layers, FlaskConical, FileText,
  ChevronRight, Star, AlertCircle, TrendingUp, Users
} from 'lucide-react';

const stats = [
  { label: 'BIS Standards Covered', value: '22,000+' },
  { label: 'Products Assessed', value: '1,40,000+' },
  { label: 'Manufacturers Onboarded', value: '18,500+' },
  { label: 'Active Licences', value: '35,000+' },
];

const features = [
  {
    icon: Search,
    title: 'AI Standards Discovery',
    description: 'Describe your product in plain language. Our AI identifies the applicable BIS Indian Standard, mandatory status, and certification scheme.',
    path: '/standards-discovery',
    badge: 'AI-Powered',
  },
  {
    icon: Shield,
    title: 'Evidence-Backed Answers',
    description: 'Every answer is grounded in official BIS documents with clause-level citations. Toggle between technical and simple explanations.',
    path: '/evidence-assistant',
    badge: 'RAG',
  },
  {
    icon: TrendingUp,
    title: 'Certification Journey',
    description: 'A personalised step-by-step roadmap from product identification to BIS licence grant, with cost and timeline estimates.',
    path: '/certification-journey',
    badge: 'Roadmap',
  },
  {
    icon: Factory,
    title: 'Factory Readiness Advisor',
    description: 'Assess your manufacturing unit against BIS inspection criteria. Identify gaps before the BIS officer visits your factory.',
    path: '/factory-readiness',
    badge: 'Checklist',
  },
  {
    icon: Camera,
    title: 'Snap & Verify',
    description: 'Upload a product image and verify the BIS mark authenticity in seconds. Check CM/L number, manufacturer, and product scope.',
    path: '/snap-verify',
    badge: 'Vision AI',
  },
  {
    icon: FlaskConical,
    title: 'Laboratory Finder',
    description: 'Find BIS-recognised laboratories by product, standard, test type, or location. View NABL accreditation and turnaround time.',
    path: '/laboratory-finder',
    badge: 'Directory',
  },
  {
    icon: Layers,
    title: 'Demo Compliance Analysis',
    description: 'A complete end-to-end hackathon demonstration workflow for a manufacturer compliance journey.',
    path: '/compliance-analysis',
    badge: 'Demo',
  },
];

const userCards = [
  {
    title: 'Complete BIS Certification Guidance',
    icon: Factory,
    color: 'bg-white border-blue-200 hover:border-blue-500 shadow-sm',
    iconColor: 'text-blue-600',
    badge: 'Manufacturer',
    description: 'Find applicable standards, identify certification requirements, check factory readiness and prepare for approval.',
    cta: 'Start Assessment',
    path: '/dashboard',
  },
  {
    title: 'Verify BIS Mark Authenticity',
    icon: Shield,
    color: 'bg-white border-green-200 hover:border-green-500 shadow-sm',
    iconColor: 'text-green-600',
    badge: 'Consumer',
    description: 'Upload a product image and verify CM/L, ISI, CRS and BIS-related information.',
    cta: 'Snap & Verify',
    path: '/snap-verify',
  },
  {
    title: 'Ask Manak AI',
    icon: BookOpen,
    color: 'bg-white border-amber-200 hover:border-amber-500 shadow-sm',
    iconColor: 'text-amber-600',
    badge: 'Knowledge Explorer',
    description: 'Get source-backed explanations of standards, clauses, testing requirements and procedures.',
    cta: 'Explore Standards',
    path: '/evidence-assistant',
  },
];

const journeySteps = [
  { step: '01', label: 'Describe Product', icon: FileText },
  { step: '02', label: 'AI Identifies Standard', icon: Search },
  { step: '03', label: 'Check QCO Status', icon: AlertCircle },
  { step: '04', label: 'Certification Roadmap', icon: Layers },
  { step: '05', label: 'Factory Readiness', icon: Factory },
  { step: '06', label: 'Find Lab & Apply', icon: Award },
];

const recentUpdates = [
  { date: '15 Sep 2025', title: 'QCO for Ceiling Fans (Amendment) — Effective 01 Jan 2026', type: 'QCO', urgent: true },
  { date: '10 Sep 2025', title: 'IS 302-2-15:2025 (Electric Kettles) — Second Revision Published', type: 'Standard', urgent: false },
  { date: '05 Sep 2025', title: 'BIS Lab Recognition Extended — National Test House Western Region', type: 'Lab', urgent: false },
  { date: '28 Aug 2025', title: 'Scheme-I Fee Revision — Effective 01 Oct 2025', type: 'Fee', urgent: true },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#0f172a] text-white border-b border-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                AI-Powered · Government Grade · Multilingual
              </div>
              <h1 className="font-heading text-[48px] lg:text-[56px] font-bold leading-[1.1] mb-6 text-white">
                Manak: Your AI Compliance Assistant
              </h1>
              <p className="text-[#DCE6F2] text-[16px] lg:text-[18px] leading-relaxed mb-8 max-w-xl">
                Discover standards, understand certification requirements, verify BIS marks, assess factory readiness, and prepare your compliance journey with trusted BIS intelligence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-[#0f172a] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Start Compliance Journey
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/snap-verify"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  Verify BIS Product
                </Link>
              </div>
            </div>

            {/* Hero visual — Professional Mockup */}
            <div className="hidden lg:flex flex-col items-center">
              <div className="bg-[#020617] border border-white/10 shadow-xl rounded-xl p-6 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 gov-stripe" />
                <div className="text-sm text-white mb-6 font-bold flex items-center gap-2">
                   <Layers className="w-4 h-4 text-blue-300" /> Compliance Pipeline
                </div>
                
                <div className="space-y-4 relative">
                  {/* Connector Line */}
                  <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-white/10" />
                  
                  {[
                    { label: 'Product Input', desc: 'Electric Kettle · 1500W', icon: Factory, color: 'text-blue-300', bg: 'bg-blue-500/10' },
                    { label: 'AI Analysis', desc: 'Processing parameters...', icon: Search, color: 'text-purple-300', bg: 'bg-purple-500/10' },
                    { label: 'BIS Standard Match', desc: 'IS 302-2-15:2025 identified', icon: Shield, color: 'text-green-300', bg: 'bg-green-500/10' },
                    { label: 'Compliance Blueprint', desc: 'Ready for certification', icon: FileText, color: 'text-amber-300', bg: 'bg-amber-500/10' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5 shadow-sm ${item.bg}`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-3">
                          <div className="text-white text-sm font-bold">{item.label}</div>
                          <div className="text-blue-200 text-xs mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile stats */}
      <section className="lg:hidden bg-[#020617] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-heading">{s.value}</div>
                <div className="text-xs text-blue-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User type cards */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#0f172a] mb-2">Who Uses Manak?</h2>
            <p className="text-gray-500 text-sm">Choose your role to get started with the right tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className={`border-2 rounded-xl p-6 ${card.color} card-hover`}>
                  <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{card.badge}</div>
                  <h3 className="font-heading font-bold text-[28px] text-[#0f172a] mb-2 leading-tight">{card.title}</h3>
                  <p className="text-[#334155] text-base leading-relaxed mb-6">{card.description}</p>
                  <Link
                    to={card.path}
                    className="inline-flex items-center justify-center w-full gap-2 bg-[#F5F7FA] border border-gray-200 text-[#0f172a] font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {card.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works journey */}
      <section className="bg-[#F5F7FA] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#0f172a] mb-2">End-to-End Compliance Journey</h2>
            <p className="text-gray-500 text-sm">Our AI guides you through every step of the BIS certification process.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {journeySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm min-w-[110px] text-center">
                    <div className="text-xs text-[#0f172a]/60 font-mono font-semibold">{step.step}</div>
                    <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-700">{step.label}</div>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0f172a] mb-1">Platform Features</h2>
              <p className="text-gray-500 text-sm">Comprehensive tools for every stage of BIS compliance.</p>
            </div>
            <Link to="/dashboard" className="text-sm text-[#0f172a] font-semibold hover:underline flex items-center gap-1">
              View All Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.path}
                  className="group border border-gray-200 rounded-xl p-5 bg-white hover:border-[#0f172a]/30 hover:shadow-md transition-all card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#F0F4F8] rounded-lg flex items-center justify-center group-hover:bg-[#0f172a] transition-colors">
                      <Icon className="w-5 h-5 text-[#0f172a] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs bg-blue-50 text-[#0f172a] font-medium px-2 py-0.5 rounded-full border border-blue-100">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent updates */}
      <section className="bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-[#0f172a]">Recent BIS Updates</h2>
            <a href="#" className="text-sm text-[#0f172a] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentUpdates.map((update) => (
              <div key={update.title} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                <div className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded ${
                  update.type === 'QCO' ? 'bg-red-100 text-red-700' :
                  update.type === 'Standard' ? 'bg-blue-100 text-blue-700' :
                  update.type === 'Lab' ? 'bg-green-100 text-green-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {update.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 leading-snug">{update.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{update.date}</div>
                </div>
                {update.urgent && (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Users className="w-10 h-10 text-amber-300 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold mb-3">Ready to Start Your Compliance Journey?</h2>
          <p className="text-blue-200 mb-6 max-w-xl mx-auto">
            Join thousands of manufacturers who use Manak to navigate the certification process with confidence.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-[#0f172a] font-semibold px-8 py-3 rounded hover:bg-blue-50 transition-colors"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
