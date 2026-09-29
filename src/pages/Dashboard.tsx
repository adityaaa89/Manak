import { Link, useLocation } from 'react-router-dom';
import {
  Search, Shield, TrendingUp, Factory, FlaskConical,
  FileText, Map, BookOpen, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, LayoutDashboard
} from 'lucide-react';

const sidebarLinks = [
  { icon: Search, label: 'Standards Discovery', path: '/standards-discovery' },
  { icon: BookOpen, label: 'Evidence Assistant', path: '/evidence-assistant' },
  { icon: TrendingUp, label: 'Certification Journey', path: '/certification-journey' },
  { icon: Factory, label: 'Factory Readiness', path: '/factory-readiness' },
  { icon: FlaskConical, label: 'Testing Requirements', path: '/factory-readiness#testing' },
  { icon: Map, label: 'Laboratory Finder', path: '/laboratory-finder' },
  { icon: FileText, label: 'Compliance Blueprint', path: '/compliance-blueprint' },
];

const journeyStages = [
  { id: 1, label: 'Product Identification', status: 'completed' as const },
  { id: 2, label: 'Standard Discovery', status: 'completed' as const },
  { id: 3, label: 'Certification Scheme', status: 'active' as const },
  { id: 4, label: 'Factory Readiness', status: 'pending' as const },
  { id: 5, label: 'Testing', status: 'pending' as const },
  { id: 6, label: 'Application', status: 'pending' as const },
  { id: 7, label: 'Certification', status: 'pending' as const },
];

const quickActions = [
  { label: 'Start Standards Discovery', path: '/standards-discovery', icon: Search, color: 'bg-blue-600' },
  { label: 'Check Factory Readiness', path: '/factory-readiness', icon: Factory, color: 'bg-green-600' },
  { label: 'Verify BIS Mark', path: '/snap-verify', icon: Shield, color: 'bg-amber-600' },
  { label: 'Generate Blueprint', path: '/compliance-blueprint', icon: FileText, color: 'bg-purple-600' },
];

export default function Dashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
              <div className="bg-[#0f172a] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-semibold">My Workspace</span>
                </div>
              </div>
              <nav className="p-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                        isActive
                          ? 'bg-[#0f172a] text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-[#0f172a]">Your BIS Compliance Journey</h1>
              <p className="text-sm text-gray-500 mt-1">Track your progress from product identification to BIS certification.</p>
            </div>

            {/* Progress timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-4">Certification Progress</div>
              <div className="flex items-start gap-0">
                {journeyStages.map((stage, i) => (
                  <div key={stage.id} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        stage.status === 'completed' ? 'bg-green-500' :
                        stage.status === 'active' ? 'bg-[#0f172a] ring-2 ring-[#0f172a] ring-offset-2' :
                        'bg-gray-200'
                      }`}>
                        {stage.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : stage.status === 'active' ? (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      {i < journeyStages.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          stage.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className={`text-xs mt-2 text-center leading-tight max-w-[70px] ${
                      stage.status === 'completed' ? 'text-green-700 font-medium' :
                      stage.status === 'active' ? 'text-[#0f172a] font-bold' :
                      'text-gray-400'
                    }`}>
                      {stage.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current product card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current Product</div>
                    <h2 className="font-heading text-xl font-bold text-gray-900">Electric Kettle</h2>
                    <div className="text-sm text-gray-500">Stainless Steel · 1.7L · 1500W · 230V AC</div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Analysis Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Applicable Standard', value: 'IS 302-2-15:2025' },
                    { label: 'Certification', value: 'Mandatory' },
                    { label: 'Scheme', value: 'Scheme-I' },
                    { label: 'QCO Status', value: 'Mandatory Now' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <div className={`text-sm font-semibold ${
                        item.value === 'Mandatory' || item.value === 'Mandatory Now'
                          ? 'text-red-600'
                          : item.value === 'Scheme-I'
                          ? 'text-[#0f172a]'
                          : 'text-gray-900'
                      }`}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/certification-journey"
                    className="inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/factory-readiness"
                    className="inline-flex items-center gap-1.5 text-xs border border-[#0f172a] text-[#0f172a] px-3 py-2 rounded font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Check Factory Readiness
                  </Link>
                </div>
              </div>

              {/* Readiness score */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Factory Readiness</div>
                <div className="relative w-32 h-32 mb-3">
                  <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none" stroke="#0f172a" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.72)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading text-2xl font-bold text-[#0f172a]">72%</span>
                    <span className="text-xs text-gray-500">Ready</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">3 critical gaps identified</div>
                <Link to="/factory-readiness" className="text-xs text-[#0f172a] font-semibold hover:underline flex items-center gap-1">
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-amber-900 mb-1">Action Required Before Proceeding</div>
                  <div className="text-sm text-amber-800 space-y-1">
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Calibration certificates for 3 instruments — expired, renewal required</div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Internal test records are incomplete (need 6 months of systematic records)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-2">
              <div className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      to={action.path}
                      className={`${action.color} text-white rounded-xl p-4 flex flex-col items-start gap-2 hover:opacity-90 transition-opacity card-hover`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold leading-snug">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
