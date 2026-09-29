import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, ChevronRight, Info, CheckCircle2,
  AlertTriangle, XCircle, Lightbulb, Layers, Shield, FileText, Loader2
} from 'lucide-react';

import { productsAPI, standardsAPI, ProductAnalysisResponse } from '../services/api';

const suggestions = [
  'Pressure cooker manufacturer',
  'LED bulb manufacturer',
  'Packaged drinking water producer',
  'Electric iron manufacturer',
  'Ceiling fan manufacturer',
  'Steel pipes supplier',
];

type Stage = 'input' | 'extracting' | 'clarification' | 'result';

const QCOBadge = ({ status }: { status: string }) => {
  if (status === 'mandatory-now') return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <div className="w-3 h-3 rounded-full bg-red-500 status-pulse flex-shrink-0" />
      <span className="text-sm font-semibold text-red-700">Mandatory Now</span>
      <span className="text-xs text-red-600">— QCO in force</span>
    </div>
  );
  if (status === 'upcoming') return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
      <span className="text-sm font-semibold text-amber-700">Upcoming Mandatory</span>
      <span className="text-xs text-amber-600">— QCO coming soon</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
      <span className="text-sm font-semibold text-green-700">Voluntary</span>
      <span className="text-xs text-green-600">— No mandatory order</span>
    </div>
  );
};

export default function StandardsDiscovery() {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<any>(null);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({ voltage: '', use: 'domestic' });

  const executeSearch = async (searchQuery: string) => {
    setStage('extracting');
    setError('');
    
    try {
      const analysis = await productsAPI.analyseProduct(searchQuery);
      setProductAnalysis(analysis);
      
      const discoverPayload = {
        product_description: searchQuery,
        product_name: analysis.product_name,
        category: analysis.category,
        attributes: {
          material: analysis.material || '',
          usage: analysis.usage || ''
        }
      };
      
      const discoverRes = await standardsAPI.discoverStandard(discoverPayload);
      
      if (discoverRes.matches && discoverRes.matches.length > 0) {
        const match = discoverRes.matches[0];
        const mappedResult = {
          number: match.standard_number,
          title: match.title,
          status: match.qco_status,
          scheme: match.scheme,
          qcoStatus: match.qco_status === 'Mandatory' ? 'mandatory-now' : 'voluntary',
          certType: 'Product Certification',
          scope: 'Scope derived from AI analysis',
          year: 2025,
          product: analysis.product_name,
          confidence: (match.confidence_score * 100).toFixed(0) + '%',
          confidenceReason: match.matching_reason.join(', '),
          explanation: match.explanation,
          relatedStandards: discoverRes.matches.slice(1).map(m => ({ number: m.standard_number, title: m.title }))
        };
        setResult(mappedResult);
        setStage('result');
      } else {
        setError('No standards found.');
        setStage('input');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred.');
      setStage('input');
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    executeSearch(query);
  };

  const handleClarificationSubmit = () => {
    // For now, bypass clarification and go to result if data is missing
    if (query.trim()) {
       executeSearch(query);
    }
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    executeSearch(s);
  };

  const handleReset = () => {
    setQuery('');
    setStage('input');
    setResult(null);
    setError('');
    setProductAnalysis(null);
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Page header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Standards Discovery</span>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Find Applicable BIS Standards</h1>
          <p className="text-blue-200">Describe your product in plain language. Our AI identifies the applicable Indian Standard, mandatory status, and certification scheme.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input stage */}
        {stage === 'input' && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Describe Your Product</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. I manufacture electric kettles for domestic use"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
              <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Include product type, material, capacity, voltage rating, and intended use for the most accurate standard recommendation.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}
            
            {/* Suggestions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Try These Examples
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-sm bg-[#F5F7FA] border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:border-[#0f172a] hover:text-[#0f172a] hover:bg-blue-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Extracting / loading */}
        {stage === 'extracting' && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-1" />
                <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-2" />
                <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-3" />
              </div>
            </div>
            <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">Analysing BIS Documents</h3>
            <p className="text-sm text-gray-500">Identifying applicable standards and QCO status from official BIS sources...</p>
          </div>
        )}

        {/* Clarification */}
        {stage === 'clarification' && (
          <div className="space-y-4">
            {/* Product extraction card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Product Understanding
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Product', value: 'Electric Kettle' },
                  { label: 'Category', value: 'Household Electrical Appliance' },
                  { label: 'Material', value: 'Stainless Steel' },
                  { label: 'Capacity', value: '1.7 Litres' },
                  { label: 'Usage', value: 'Domestic' },
                  { label: 'Application', value: 'Heating liquids' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clarification card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-4">
                <AlertTriangle className="w-4 h-4" />
                Need More Information
              </div>
              <p className="text-sm text-amber-800 mb-4">To recommend the precise standard, please answer the following:</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">What is the rated voltage?</label>
                  <input
                    type="text"
                    value={answers.voltage}
                    onChange={e => setAnswers({ ...answers, voltage: e.target.value })}
                    placeholder="e.g. 230V AC, 50Hz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Is it domestic or industrial use?</label>
                  <div className="flex gap-3">
                    {['domestic', 'industrial', 'both'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="use"
                          value={opt}
                          checked={answers.use === opt}
                          onChange={() => setAnswers({ ...answers, use: opt })}
                          className="accent-[#0f172a]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleClarificationSubmit}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Find Standard <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={handleReset} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {stage === 'result' && (
          <div className="space-y-4">
            {/* Main result */}
            <div className="bg-white border-2 border-[#0f172a] rounded-xl overflow-hidden">
              <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold">Standard Identified</span>
                </div>
                <span className="text-xs text-blue-200">Confidence: {result.confidence}</span>
              </div>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Applicable Standard</div>
                    <h2 className="font-heading text-2xl font-bold text-gray-900">{result.number}</h2>
                    <p className="text-sm text-gray-600 mt-1 max-w-xl">{result.title}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-start sm:items-end">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      result.status === 'Mandatory'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {result.status}
                    </span>
                    <span className="text-xs bg-blue-50 text-[#0f172a] px-3 py-1 rounded-full border border-blue-100 font-medium">
                      {result.scheme}
                    </span>
                  </div>
                </div>

                {/* QCO status */}
                <div className="mb-5">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">QCO Status</div>
                  <QCOBadge status={result.qcoStatus} />
                </div>

                {/* Key fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Cert Type', value: result.certType },
                    { label: 'Scope', value: result.scope.substring(0, 50) + '...' },
                    { label: 'Year', value: String(result.year) },
                    { label: 'Product', value: result.product },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Confidence rationale (AI Decision Logic) */}
                {(result.explanation || result.confidenceReason) && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-blue-900">AI Decision Logic</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-blue-700/70 font-semibold block text-xs">Decision</span>
                        <span className="text-blue-900 font-medium">Recommended Standard: {result.number}</span>
                      </div>
                      <div>
                        <span className="text-blue-700/70 font-semibold block text-xs">Confidence</span>
                        <span className="text-blue-900 font-medium">{result.explanation?.confidence || result.confidence}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-700/70 font-semibold block text-xs mb-1">Reasoning Factors</span>
                      {result.explanation?.reasoning ? (
                        <ul className="list-disc pl-5 text-blue-900 text-sm space-y-1">
                          {result.explanation.reasoning.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-blue-900 text-sm">{result.confidenceReason}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link to="/certification-journey" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Certification Journey <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/evidence-assistant" className="inline-flex items-center gap-2 px-4 py-2 border border-[#0f172a] text-[#0f172a] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                    Ask AI Assistant
                  </Link>
                  <button onClick={handleReset} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors">
                    Search Again
                  </button>
                </div>
              </div>
            </div>

            {/* Related standards */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Related Standards
              </div>
              <div className="space-y-2">
                {result.relatedStandards.map((rel: any) => (
                  <div key={rel.number} className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{rel.number}</div>
                      <div className="text-xs text-gray-500">{rel.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
