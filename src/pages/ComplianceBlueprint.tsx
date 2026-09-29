import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Download, FileText, CheckCircle2, XCircle,
  AlertTriangle, Clock, IndianRupee, FlaskConical, MapPin,
  Shield, Building2, Calendar, ExternalLink, Printer
} from 'lucide-react';
import { blueprintAPI, BlueprintGenerateResponse } from '../services/api';

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#0f172a] text-white px-4 py-2.5 text-sm font-semibold font-heading">
    {children}
  </div>
);

export default function ComplianceBlueprint() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [data, setData] = useState<BlueprintGenerateResponse | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      // By default passing product_id=1, standard_id=1 for demonstration
      const res = await blueprintAPI.generateBlueprint(1, 1, 'Mumbai');
      setData(res);
      setGenerated(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate blueprint.');
    } finally {
      setGenerating(false);
    }
  };

  if (!generated || !data) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen">
        <div className="bg-[#0f172a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Compliance Blueprint</span>
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Generate My BIS Compliance Blueprint</h1>
            <p className="text-blue-200">A comprehensive compliance plan based on your product profile, standard, and readiness assessment.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium text-left">
                {error}
              </div>
            )}
            
            {generating ? (
              <div>
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-1" />
                    <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-2" />
                    <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-3" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">Generating Compliance Blueprint</h3>
                <p className="text-sm text-gray-500">Compiling product profile, standards analysis, readiness assessment, testing requirements, laboratory recommendations...</p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-[#F0F4F8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#0f172a]" />
                </div>
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">Your BIS Compliance Blueprint</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Generate a comprehensive compliance report covering applicable standards, QCO details, certification scheme, factory readiness, testing requirements, and recommended laboratories.
                </p>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Generate Blueprint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const generatedDate = data.generated_at ? new Date(data.generated_at).toLocaleDateString() : new Date().toLocaleDateString();
  const standard = (data as any).standard || (data as any).applicable_standard || {};
  const standardNumber = standard.number || standard.standard_number || 'N/A';
  const readiness = (data as any).readiness || { score: 0, critical_gaps: [] };

  return (
    <div className="bg-[#F5F7FA] min-h-screen print:bg-white print:text-black">
      {/* Header */}
      <div className="bg-[#0f172a] text-white no-print">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
                <Link to="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Compliance Blueprint</span>
              </div>
              <h1 className="font-heading text-2xl font-bold">BIS Compliance Blueprint</h1>
              <p className="text-blue-200 text-sm">Generated on {generatedDate}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white text-[#0f172a] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-[#0f172a]">
        <div className="gov-stripe h-2 w-full mb-4"></div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">Official Compliance Blueprint</h1>
            <p className="text-gray-500 mt-1 text-sm">Bureau of Indian Standards Requirements</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Generated: <strong>{generatedDate}</strong></p>
            <p>Product: <strong>{data.product?.name || 'N/A'}</strong></p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 print:py-0 print:space-y-4">
        {/* Product Profile */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:shadow-none">
          <SectionHeader>1. Product Profile</SectionHeader>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 print:p-2">
            {data.product && Object.entries(data.product).map(([key, val]) => (
              <div key={key} className="bg-[#F5F7FA] rounded-lg p-3 print:bg-white print:border print:border-gray-200">
                <div className="text-xs text-gray-400 capitalize mb-0.5">{key.replace(/_/g, ' ')}</div>
                <div className="text-sm font-semibold text-gray-900">{val as string}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Decision Logic (Explanation) */}
        {data.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden no-print">
            <SectionHeader>AI Decision Logic</SectionHeader>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-blue-800 font-semibold block text-sm">Decision</span>
                  <span className="text-blue-900 font-medium text-sm">{data.explanation.decision}</span>
                </div>
                <div>
                  <span className="text-blue-800 font-semibold block text-sm">Confidence</span>
                  <span className="text-blue-900 font-medium text-sm">{data.explanation.confidence}</span>
                </div>
              </div>
              <div>
                <span className="text-blue-800 font-semibold block text-sm mb-1">Reasoning Factors</span>
                <ul className="list-disc pl-5 text-blue-900 text-sm space-y-1">
                  {data.explanation.reasoning && data.explanation.reasoning.map((r: any, i: any) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Standard & QCO */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:shadow-none">
          <SectionHeader>2. Applicable Standard & QCO Status</SectionHeader>
          <div className="p-5 print:p-2">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px] bg-[#F5F7FA] rounded-lg p-4 print:bg-white print:border print:border-gray-200">
                <div className="text-xs text-gray-400 mb-1">Standard</div>
                <div className="text-lg font-bold text-[#0f172a] font-heading">{standardNumber}</div>
                <div className="text-sm text-gray-600">{standard.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1 min-w-[200px]">
                {[
                  { label: 'Scheme', value: standard.scheme || data.certification_scheme?.scheme || 'N/A' },
                  { label: 'QCO Status', value: data.qco_status?.status || 'N/A' },
                  { label: 'Effective Date', value: data.qco_status?.effective_date || 'N/A' },
                  { label: 'Readiness Score', value: `${readiness.score}%` },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-3 print:bg-white print:border print:border-gray-200">
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {readiness.critical_gaps && readiness.critical_gaps.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-4 print:bg-white print:border-gray-200">
                <div className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Factory Gaps Identified
                </div>
                <ul className="list-disc pl-5 text-sm text-red-700 print:text-gray-900 space-y-1">
                  {readiness.critical_gaps.map((gap: any, i: any) => (
                    <li key={i}>{gap.requirement || JSON.stringify(gap)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Testing Requirements */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:shadow-none print:break-inside-avoid">
          <SectionHeader>3. Testing Requirements</SectionHeader>
          <div className="p-5 print:p-2">
            {!data.testing_requirements || data.testing_requirements.length === 0 ? (
              <div className="text-sm text-gray-500">No specific testing requirements found.</div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F7FA] print:bg-gray-100">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                    {data.testing_requirements.map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-gray-900">{t.name}</td>
                        <td className="px-3 py-2 text-gray-600">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full print:bg-transparent print:border print:border-gray-300 print:text-gray-700">{t.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Labs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:shadow-none print:break-inside-avoid">
          <SectionHeader>4. Recommended Laboratories</SectionHeader>
          <div className="p-5 print:p-2">
            {!data.recommended_labs || data.recommended_labs.length === 0 ? (
              <div className="text-sm text-gray-500">No laboratories found matching these criteria.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.recommended_labs.map((lab, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 print:border-gray-300">
                    <div className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{lab.name}</div>
                    {lab.matching_reason && lab.matching_reason.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500 print:text-gray-500" />
                        {reason}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evidence Sources */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden no-print">
          <SectionHeader>5. Evidence Sources</SectionHeader>
          <div className="p-5">
            <div className="text-sm font-semibold text-gray-700 mb-3">Sources Used:</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['BIS Product Manual', 'BIS QCO Notification', 'BIS Standard Information', 'BIS Laboratory Directory'].map((src, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {src}
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">Report generated by AI Assistant</span>
              <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded">
                Verified on: {generatedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Print-only Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 text-sm">
          This compliance blueprint is generated based on available data and is intended for informational purposes.
        </div>

        {/* Download CTA */}
        <div className="bg-[#0f172a] rounded-xl p-6 text-center text-white no-print">
          <h3 className="font-heading text-lg font-bold mb-2">Download Your Complete Blueprint</h3>
          <p className="text-blue-200 text-sm mb-4">Save this compliance plan as a PDF for your records, team, or BIS submission preparation.</p>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#0f172a] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
