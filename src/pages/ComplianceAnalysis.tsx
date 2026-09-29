import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Package, BookOpen, ShieldCheck, ClipboardCheck, Microscope, FlaskConical, CheckCircle2, Download, Search } from 'lucide-react';
import { demoAPI } from '../services/api';

export default function ComplianceAnalysis() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const data = await demoAPI.complianceAnalysis(input);
      setResult(data.workflow_results);
    } catch (err: any) {
      console.error(err);
      setError('Failed to run compliance analysis. Please ensure backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Compliance Analysis</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">End-to-End Compliance Journey</h1>
              <p className="text-blue-200 text-sm mt-1">Simulate the full BIS compliance pipeline for your product.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-700">Describe your product</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., I manufacture electric kettles"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || isAnalyzing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        {/* Results Journey */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Your Compliance Roadmap</h2>
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  1
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <Package className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Product Identification</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Product Name</span>
                    <span className="font-medium text-gray-900">{result.product?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Category</span>
                    <span className="font-medium text-gray-900">{result.product?.category || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  2
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Applicable Standard</h3>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold">IS Number</span>
                  <span className="font-bold text-lg text-indigo-700">{result.applicable_standard?.standard_number}</span>
                </div>
                <div className="mt-2">
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Title</span>
                  <span className="font-medium text-gray-700">{result.applicable_standard?.title}</span>
                </div>
                <div className="mt-2 text-xs text-green-600 font-semibold bg-green-50 w-max px-2 py-1 rounded">
                  High Confidence Match
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  3
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-red-600">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Regulatory Status</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">QCO Status</span>
                    <span className="font-bold text-lg text-red-600 uppercase">{result.qco_status?.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Effective Date</span>
                    <span className="font-medium text-gray-900">{result.qco_status?.effective_date || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  4
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-purple-600">
                  <ClipboardCheck className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Certification Path</h3>
                </div>
                <div className="mb-4">
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Scheme</span>
                  <span className="font-bold text-gray-900">{result.certification_scheme?.scheme}</span>
                </div>
                <div className="space-y-3 pl-3 border-l-2 border-purple-200">
                  {result.licence_process?.map((step: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full -left-[17px] top-1.5 ring-4 ring-white" />
                      <h4 className="text-sm font-bold text-gray-900">Step {step.step}: {step.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  5
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-teal-600">
                  <Microscope className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Testing Requirements</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {result.testing_requirements?.map((test: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>{test.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold z-10 border-4 border-[#F5F7FA]">
                  6
                </div>
                <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-orange-600">
                  <FlaskConical className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Laboratory Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {result.recommended_labs?.slice(0, 3).map((lab: any, i: number) => (
                    <div key={i} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                      <h4 className="font-semibold text-gray-900 text-sm">{lab.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lab.matching_reason?.slice(0, 2).map((reason: string, j: number) => (
                          <span key={j} className="text-[10px] uppercase font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-white font-bold z-10 border-4 border-[#F5F7FA]">
                  7
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-br from-[#0f172a] to-blue-900 rounded-xl shadow-lg p-6 text-white mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Download className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Compliance Blueprint Ready</h3>
                  <p className="text-blue-200 text-sm mb-6 max-w-md">Your complete compliance journey mapping has been finalized. Download the full PDF blueprint to begin the certification process.</p>
                  
                  <div className="bg-white/10 p-4 rounded-lg mb-6 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-200">Required Documents</span>
                      <span className="font-bold">{result.required_documents?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-blue-200">Mandatory Tests</span>
                      <span className="font-bold">{result.testing_requirements?.length || 0}</span>
                    </div>
                  </div>
                  
                  <button className="bg-white text-[#0f172a] px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Blueprint
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
