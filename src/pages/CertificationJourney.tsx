import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, Clock, Circle, AlertTriangle,
  ChevronDown, ChevronUp, FileText, ArrowRight, IndianRupee, Calendar
} from 'lucide-react';
import { qcoAPI, testingAPI } from '../services/api';

type StageStatus = 'completed' | 'active' | 'pending';

const statusConfig: Record<StageStatus, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  completed: { color: 'text-green-600', bg: 'bg-green-500', label: 'Completed', icon: CheckCircle2 },
  active: { color: 'text-[#0f172a]', bg: 'bg-[#0f172a]', label: 'In Progress', icon: Clock },
  pending: { color: 'text-gray-400', bg: 'bg-gray-300', label: 'Pending', icon: Circle },
};

function StageCard({ stage, isLast }: { stage: any; isLast: boolean }) {
  const [expanded, setExpanded] = useState(stage.status === 'active');
  const config = statusConfig[stage.status as StageStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${config.bg} ${stage.status === 'active' ? 'ring-4 ring-[#0f172a]/20' : ''}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${stage.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} style={{ minHeight: '32px' }} />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 border rounded-xl overflow-hidden ${stage.status === 'active' ? 'border-[#0f172a] shadow-md' : 'border-gray-200'}`}>
        <div
          className={`flex items-center justify-between px-4 py-3 cursor-pointer ${stage.status === 'active' ? 'bg-[#0f172a] text-white' : 'bg-white'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${stage.status === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              Step {stage.id}
            </span>
            <span className={`font-heading font-semibold ${stage.status === 'active' ? 'text-white' : 'text-gray-900'}`}>
              {stage.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${
              stage.status === 'completed' ? 'text-green-600' :
              stage.status === 'active' ? 'text-white' : 'text-gray-400'
            }`}>
              {config.label}
            </span>
            {expanded ? (
              <ChevronUp className={`w-4 h-4 ${stage.status === 'active' ? 'text-white' : 'text-gray-400'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${stage.status === 'active' ? 'text-white' : 'text-gray-400'}`} />
            )}
          </div>
        </div>

        {expanded && (
          <div className="p-4 bg-white">
            <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Actions</div>
                <ul className="space-y-1.5">
                  {stage.actions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${stage.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents Required</div>
                <ul className="space-y-1.5">
                  {stage.documents.map((doc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#0f172a]/50" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Est. Duration</div>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {stage.duration}
                </div>
                {stage.blockers && stage.blockers.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Blockers</div>
                    {stage.blockers.map((b: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificationJourney() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const qcoRes = await qcoAPI.checkQCO(1);
        const testRes = await testingAPI.getTestingRequirements(1);

        const dynamicData = {
          product: "AI Identified Product",
          standard: testRes.standard_number || "IS-XXX",
          scheme: "Scheme-I",
          currentStage: 3,
          stages: [
            {
              id: 1,
              title: "Product Identification",
              status: "completed",
              description: "Product profile analyzed and categorized successfully.",
              actions: ["Describe product parameters", "Identify category"],
              documents: [],
              duration: "Instant",
              blockers: []
            },
            {
              id: 2,
              title: "Standard Confirmation",
              status: "completed",
              description: `The correct Indian Standard has been identified as ${testRes.standard_number}.`,
              actions: ["Review standard scope", "Confirm product match"],
              documents: [],
              duration: "Instant",
              blockers: []
            },
            {
              id: 3,
              title: "QCO Verification",
              status: "active",
              description: `Quality Control Order Status: ${qcoRes.status}. Effective Date: ${qcoRes.effective_date || 'N/A'}. Reason: ${qcoRes.reason}`,
              actions: ["Verify QCO Gazette notification", "Check exemption rules"],
              documents: ["QCO Notification Document"],
              duration: "1 day",
              blockers: qcoRes.status === 'Mandatory' ? ['Strict compliance deadline active'] : []
            },
            {
              id: 4,
              title: "Testing Requirements",
              status: "pending",
              description: `The standard requires ${testRes.tests.length} distinct type tests to be conducted.`,
              actions: testRes.tests.map(t => t.test_name).slice(0, 5),
              documents: ["Internal Test Records", "Calibration Certificates"],
              duration: "2-4 weeks",
              blockers: []
            },
            {
              id: 5,
              title: "Factory Preparation",
              status: "pending",
              description: "Ensure factory layout, machinery, and quality control personnel meet BIS Scheme-I requirements.",
              actions: ["Appoint Quality Control Personnel", "Set up in-house lab"],
              documents: ["Quality Control Manual", "Factory Registration"],
              duration: "4-6 weeks",
              blockers: ["Waiting for equipment calibration"]
            },
            {
              id: 6,
              title: "Lab Testing & BIS Application",
              status: "pending",
              description: "Submit product samples to a BIS-recognized laboratory, followed by formal application submission.",
              actions: ["Generate test request", "Submit Form BIS-I"],
              documents: ["Test Report", "Application Form"],
              duration: "3-5 weeks",
              blockers: []
            }
          ],
          costGuidance: {
            applicationFee: '₹1,000',
            inspectionFee: '₹7,000',
            testingEstimate: '₹25,000 - ₹45,000',
            markingFee: '₹15,000 / year',
            totalEstimate: '₹48,000 - ₹68,000',
            note: 'Costs are estimated and vary by exact testing laboratory rates.'
          },
          timeline: {
            total: '10-15 Weeks',
            milestones: [
               { week: 'Week 1', label: 'Standard Mapped' },
               { week: 'Week 4', label: 'Factory Ready' },
               { week: 'Week 8', label: 'Tests Passed' },
               { week: 'Week 12', label: 'Licence Granted' }
            ]
          }
        };

        setData(dynamicData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load journey data.');
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

  if (error || !data) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen p-8 text-center text-red-600">
        Error loading certification journey: {error}
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Certification Journey</span>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Your Personalised BIS Certification Roadmap</h1>
          <p className="text-blue-200">Step-by-step guidance from product identification to licence grant.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Context bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          {[
            { label: 'Product', value: data.product },
            { label: 'Standard', value: data.standard },
            { label: 'Scheme', value: data.scheme },
            { label: 'Current Stage', value: `Step ${data.currentStage} of ${data.stages.length}` },
          ].map((item) => (
            <div key={item.label} className="min-w-[120px]">
              <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
          <div className="ml-auto">
            <Link
              to="/compliance-blueprint"
              className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Blueprint <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="text-sm font-semibold text-gray-700 mb-4">Certification Stages</div>
            <div className="pb-4">
              {data.stages.map((stage: any, i: number) => (
                <StageCard key={stage.id} stage={stage} isLast={i === data.stages.length - 1} />
              ))}
            </div>
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            {/* Cost guidance */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-[#020617] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-sm font-semibold">Cost Guidance</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Application Fee', value: data.costGuidance.applicationFee },
                  { label: 'Inspection Fee', value: data.costGuidance.inspectionFee },
                  { label: 'Testing Estimate', value: data.costGuidance.testingEstimate },
                  { label: 'Marking Fee', value: data.costGuidance.markingFee },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Total Estimate</span>
                    <span className="text-sm font-bold text-[#0f172a]">{data.costGuidance.totalEstimate}</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <p className="text-xs text-amber-700">{data.costGuidance.note}</p>
                </div>
              </div>
            </div>

            {/* Timeline card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-[#020617] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Timeline Overview</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-3">Estimated total: <span className="font-semibold text-gray-800">{data.timeline.total}</span></div>
                <div className="space-y-3">
                  {data.timeline.milestones.map((m: any, i: number) => (
                    <div className="flex items-start gap-3" key={i}>
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${i < 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="text-xs font-mono text-gray-400">{m.week}</div>
                        <div className="text-sm text-gray-700">{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Tools</div>
              <div className="space-y-2">
                {[
                  { label: 'Check Factory Readiness', path: '/factory-readiness' },
                  { label: 'Find Testing Laboratory', path: '/laboratory-finder' },
                  { label: 'Ask AI Assistant', path: '/evidence-assistant' },
                  { label: 'Generate Blueprint', path: '/compliance-blueprint' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center justify-between text-sm text-[#0f172a] hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    {link.label}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
