import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Factory, FlaskConical, ArrowRight
} from 'lucide-react';
import { readinessAPI, testingAPI, FactoryAssessResponse, TestingRequirementsResponse } from '../services/api';

type ItemStatus = 'pass' | 'fail' | 'warning';

const itemStatusConfig: Record<ItemStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  pass: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  fail: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const gapSeverityConfig: Record<string, { label: string; bg: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-100 text-red-700 border-red-200', border: 'border-l-red-500' },
  high: { label: 'High', bg: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
  medium: { label: 'Medium', bg: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-l-blue-400' },
};

function SectionCard({ section }: { section: any }) {
  const [expanded, setExpanded] = useState(true);
  const passCount = section.items.filter((i: any) => i.status === 'pass').length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-heading font-semibold text-gray-900 text-sm">{section.name || section.title}</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${section.score >= 80 ? 'bg-green-500' : section.score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                style={{ width: `${section.score}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${section.score >= 80 ? 'text-green-600' : section.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {section.score}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{passCount}/{section.items.length} items</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-2">
          {section.items.map((item: any, idx: number) => {
            const statusKey = (item.status || 'warning').toLowerCase() as ItemStatus;
            const config = itemStatusConfig[statusKey] || itemStatusConfig.warning;
            const Icon = config.icon;
            return (
              <div key={item.id || idx} className={`flex items-start gap-3 p-2.5 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">{item.label || item.requirement}</div>
                  {item.note && (
                    <div className={`text-xs mt-0.5 ${config.color}`}>{item.note}</div>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${config.color} bg-white/80`}>
                  {statusKey}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FactoryReadiness() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'testing' | 'sti'>('overview');
  const [readinessData, setReadinessData] = useState<FactoryAssessResponse | null>(null);
  const [testingData, setTestingData] = useState<TestingRequirementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const payload = {
          standard_id: 1,
          responses: {}
        };
        const [assessRes, testRes] = await Promise.all([
          readinessAPI.assessFactoryReadiness(payload),
          testingAPI.getTestingRequirements(1)
        ]);
        setReadinessData(assessRes);
        setTestingData(testRes);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch factory readiness data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-1" />
          <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-2" />
          <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-3" />
        </div>
      </div>
    );
  }

  if (error || !readinessData || !testingData) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen p-8 text-center text-red-600">
        Error loading factory readiness: {error}
      </div>
    );
  }

  const inhouseTests = testingData.tests.filter(t => t.type !== 'Outsource');
  const outsourceTests = testingData.tests.filter(t => t.type === 'Outsource');

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Factory Readiness</span>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Check Factory Readiness</h1>
          <p className="text-blue-200">Assess your manufacturing unit against BIS inspection criteria and identify gaps before certification.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Factory },
            { id: 'requirements', label: 'Requirements', icon: CheckCircle2 },
            { id: 'testing', label: 'Testing', icon: FlaskConical },
            { id: 'sti', label: 'STI Classification', icon: AlertTriangle },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-[#0f172a] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <svg className="w-36 h-36 progress-ring" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle
                      cx="70" cy="70" r="60"
                      fill="none"
                      stroke={readinessData.overall_score >= 80 ? '#059669' : readinessData.overall_score >= 60 ? '#D97706' : '#DC2626'}
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - readinessData.overall_score / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading text-3xl font-bold text-gray-900">{readinessData.overall_score}%</span>
                    <span className="text-xs text-gray-500 font-medium">Ready</span>
                  </div>
                </div>
                <div className="font-heading font-semibold text-gray-900 mb-1">Certification Ready</div>
                <div className="text-xs text-gray-500 mb-4">Based on BIS Scheme-I requirements</div>
                
                <Link
                  to="/compliance-blueprint"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Blueprint <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Critical Gaps — Action Required
                </div>
                {readinessData.critical_gaps.length === 0 ? (
                  <div className="text-sm text-green-700 bg-green-50 p-4 rounded-lg">
                    No critical gaps identified! You are highly prepared.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {readinessData.critical_gaps.map((gap, i) => {
                      const severityKey = (gap.severity || 'medium').toLowerCase();
                      const config = gapSeverityConfig[severityKey] || gapSeverityConfig.medium;
                      return (
                        <div key={i} className={`border-l-4 ${config.border} bg-[#F5F7FA] rounded-r-lg px-4 py-3`}>
                          <div className="flex items-start gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${config.bg} flex-shrink-0`}>
                              {config.label}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{gap.requirement}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{gap.recommended_action}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-4">
            {readinessData.sections.map((section, idx) => (
              <SectionCard key={idx} section={section} />
            ))}
          </div>
        )}

        {activeTab === 'testing' && (
          <div id="testing" className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F7FA] border-b border-gray-200">
                      {['Test Name', 'Clause', 'Equipment', 'Type'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {testingData.tests.map((test, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{test.test_name}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{test.clause || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{test.equipment || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                            {test.type || 'Routine'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sti' && (
          <div id="sti" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 border-t-4 border-t-red-500">
              <h3 className="font-heading font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Required In-House
              </h3>
              <p className="text-sm text-gray-600 mb-4">You must maintain testing facilities for these tests inside your factory premises.</p>
              <div className="space-y-3">
                {inhouseTests.length === 0 ? (
                  <div className="text-sm text-gray-500">No specific in-house tests mandated.</div>
                ) : (
                  inhouseTests.map((t, i) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <div className="font-medium text-red-900 text-sm mb-1">{t.test_name}</div>
                      <div className="text-xs text-red-700">Clause: {t.clause || '-'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 border-t-4 border-t-blue-500">
              <h3 className="font-heading font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Can Outsource
              </h3>
              <p className="text-sm text-gray-600 mb-4">You can use BIS-recognized external laboratories for these tests.</p>
              <div className="space-y-3">
                {outsourceTests.length === 0 ? (
                  <div className="text-sm text-gray-500">No tests identified for outsourcing.</div>
                ) : (
                  outsourceTests.map((t, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="font-medium text-blue-900 text-sm mb-1">{t.test_name}</div>
                      <div className="text-xs text-blue-700">Clause: {t.clause || '-'}</div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/laboratory-finder" className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline">
                Find a recognized lab →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
