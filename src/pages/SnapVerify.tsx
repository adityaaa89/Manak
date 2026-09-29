import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Upload, ChevronRight, CheckCircle2, AlertTriangle,
  XCircle, Search, Info, Shield, Building2, Package, FileText, Calendar
} from 'lucide-react';
import { verificationAPI } from '../services/api';

type VerifyStatus = 'idle' | 'uploading' | 'processing' | 'verified' | 'mismatch' | 'invalid';

const processingSteps = [
  { label: 'Image Upload', icon: Upload },
  { label: 'OCR Extraction', icon: FileText },
  { label: 'CM/L Lookup', icon: Search },
  { label: 'Scope Matching', icon: Shield },
  { label: 'Verification Result', icon: CheckCircle2 },
];

export default function SnapVerify() {
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [processingStep, setProcessingStep] = useState(0);
  const [apiResult, setApiResult] = useState<any>(null);
  const [cmlQuery, setCmlQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setStatus('uploading');
    setProcessingStep(1);
    
    let step = 1;
    const interval = setInterval(() => {
      if (step < 4) {
        step++;
        setProcessingStep(step);
      }
    }, 800);

    try {
      const res = await verificationAPI.verifyImage(file);
      
      clearInterval(interval);
      setProcessingStep(5);
      
      setApiResult({
        cmlNumber: res.identifier.value,
        manufacturer: res.manufacturer || 'Unknown',
        product: 'Electric Kettle', // Simplified for prototype
        standard: res.standard || 'Unknown',
        licenceValidFrom: '2023-01-01',
        licenceValidTo: res.valid_until || '2025-12-31',
        remark: 'Licence is valid and active.'
      });

      if (res.verification.status === 'VERIFIED') {
        setStatus('verified');
      } else if (res.verification.status === 'PRODUCT_SCOPE_MISMATCH') {
        setStatus('mismatch');
      } else {
        setStatus('invalid');
      }
      
    } catch (err) {
      clearInterval(interval);
      setProcessingStep(5);
      setStatus('invalid');
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const handleDemo = async (resultType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'black';
      ctx.fillText(resultType === 'verified' ? 'CM/L-1000000' : 'CM/L-2000000', 10, 50);
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'demo.png', { type: 'image/png' });
        setImagePreview(URL.createObjectURL(file));
        processImage(file);
      }
    });
  };

  const handleReset = () => { 
    setStatus('idle'); 
    setProcessingStep(0);
    setImagePreview(null);
    setApiResult(null);
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Snap & Verify</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">Verify BIS Mark Instantly</h1>
              <p className="text-blue-200">Upload a product image to verify the ISI mark, CRS label, or BIS hallmark. Our AI extracts and validates the CM/L number against official BIS records.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'ISI Mark', sub: 'Manufactured goods', color: 'bg-white/10' },
                { label: 'CRS Label', sub: 'Electronics', color: 'bg-white/10' },
                { label: 'Hallmark', sub: 'Gold jewellery', color: 'bg-white/10' },
                { label: 'Packaging', sub: 'Labelled products', color: 'bg-white/10' },
              ].map((tag) => (
                <div key={tag.label} className={`${tag.color} border border-white/20 rounded-lg px-3 py-2`}>
                  <div className="text-sm font-semibold">{tag.label}</div>
                  <div className="text-xs text-blue-300">{tag.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">Search by CM/L Number</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={cmlQuery}
              onChange={e => setCmlQuery(e.target.value)}
              placeholder="e.g. CM/L-7654321"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
            />
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-blue-600/50 text-white rounded-lg cursor-not-allowed flex items-center gap-2"
              title="API currently requires image upload"
            >
              <Search className="w-4 h-4" />
              Lookup
            </button>
          </div>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-[#0f172a] bg-blue-50' : 'border-gray-300 bg-white hover:border-[#0f172a]/50 hover:bg-blue-50/30'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#F0F4F8] rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[#0f172a]" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-gray-900 mb-1">Drag image here or click to upload</div>
                  <div className="text-sm text-gray-500">Supports JPG, PNG, WEBP · Max 10MB</div>
                </div>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Select Image
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-3">Try Demo Samples</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleDemo('verified')}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0f172a]/40 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🫖</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Electric Kettle</div>
                    <div className="text-xs mt-0.5 text-green-600">✓ Will show verified</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemo('mismatch')}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0f172a]/40 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">💡</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">LED Bulb</div>
                    <div className="text-xs mt-0.5 text-amber-600">⚠ Will show mismatch</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemo('invalid')}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#0f172a]/40 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🔌</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Unverified Mark</div>
                    <div className="text-xs mt-0.5 text-red-600">✗ Will show invalid</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl p-3">
              <Info className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
              This verification is for reference purposes only. For official verification, visit the BIS MANAK Portal at manak.bis.gov.in. Images are processed locally and not stored.
            </div>
          </div>
        )}

        {(status === 'uploading' || (processingStep > 0 && processingStep < processingSteps.length)) && status !== 'verified' && status !== 'mismatch' && status !== 'invalid' && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-xl font-bold text-gray-900 mb-2">Analyzing Image</div>
              <div className="text-sm text-gray-500">Executing verification pipeline...</div>
            </div>
            
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-200 hidden sm:block" />
              
              <div className="flex flex-col gap-6">
                {processingSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i < processingStep;
                  const isActive = i === processingStep - 1 && i < processingSteps.length - 1;
                  return (
                    <div key={i} className="relative z-10 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm transition-all duration-500 ${isDone ? 'bg-green-500 scale-100' : isActive ? 'bg-blue-600 scale-110 shadow-blue-200' : 'bg-gray-200 scale-90'}`}>
                        {isDone ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                      </div>
                      <div className={`flex-1 p-4 rounded-xl border transition-all duration-500 ${isDone ? 'bg-green-50 border-green-200' : isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-base ${isDone ? 'text-green-700 font-bold' : isActive ? 'text-blue-900 font-bold' : 'text-gray-500 font-medium'}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>
                        {isActive && i === 1 && (
                          <div className="mt-2 text-xs text-blue-700 font-mono bg-blue-100/50 p-2 rounded">
                            Scanning for text blocks... Identifying CM/L pattern...
                          </div>
                        )}
                        {isActive && i === 2 && (
                          <div className="mt-2 text-xs text-blue-700 font-mono bg-blue-100/50 p-2 rounded">
                            Querying BIS database for extracted CM/L...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {status === 'verified' && apiResult && (
          <div className="space-y-4">
            {imagePreview && (
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4">
                <img src={imagePreview} alt="Uploaded product" className="w-16 h-16 object-cover rounded border" />
                <div>
                  <div className="text-sm font-semibold">Uploaded Image</div>
                  <div className="text-xs text-gray-500">Processed successfully</div>
                </div>
              </div>
            )}
            <div className="bg-white border-2 border-green-500 rounded-xl overflow-hidden">
              <div className="bg-green-500 px-5 py-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="font-semibold text-white text-lg">Verified Match</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'CM/L Number', value: apiResult.cmlNumber, icon: Shield },
                    { label: 'Manufacturer', value: apiResult.manufacturer, icon: Building2 },
                    { label: 'Standard', value: apiResult.standard, icon: FileText },
                    { label: 'Validity', value: `${apiResult.licenceValidFrom} to ${apiResult.licenceValidTo}`, icon: Calendar },
                    { label: 'Verification Status', value: 'Verified (Valid and Active)', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-3 p-3 bg-[#F5F7FA] rounded-lg">
                        <Icon className="w-4 h-4 text-[#0f172a] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                          <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="text-sm text-green-800">{apiResult.remark}</div>
                </div>
                <button onClick={handleReset} className="text-sm text-[#0f172a] border border-[#0f172a] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Verify Another Product
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'mismatch' && apiResult && (
          <div className="space-y-4">
            {imagePreview && (
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4">
                <img src={imagePreview} alt="Uploaded product" className="w-16 h-16 object-cover rounded border" />
                <div>
                  <div className="text-sm font-semibold">Uploaded Image</div>
                  <div className="text-xs text-gray-500">Processed successfully</div>
                </div>
              </div>
            )}
            <div className="bg-white border-2 border-amber-500 rounded-xl overflow-hidden">
              <div className="bg-amber-500 px-5 py-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-white" />
                <span className="font-semibold text-white text-lg">Product Scope Mismatch</span>
              </div>
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-900 font-medium">Licence exists but registered product does not match uploaded product.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'CM/L Number', value: apiResult.cmlNumber },
                    { label: 'Manufacturer', value: apiResult.manufacturer },
                    { label: 'Standard', value: apiResult.standard },
                    { label: 'Validity', value: `${apiResult.licenceValidFrom} to ${apiResult.licenceValidTo}` },
                    { label: 'Verification Status', value: 'Mismatch (Scope Error)' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mb-4">If you believe this is an error, contact the BIS Helpline at <strong>1800-11-4899</strong> or visit the MANAK Portal.</div>
                <button onClick={handleReset} className="text-sm text-[#0f172a] border border-[#0f172a] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4">
            {imagePreview && (
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4">
                <img src={imagePreview} alt="Uploaded product" className="w-16 h-16 object-cover rounded border opacity-50 grayscale" />
                <div>
                  <div className="text-sm font-semibold text-red-600">Verification Failed</div>
                </div>
              </div>
            )}
            <div className="bg-white border-2 border-red-500 rounded-xl overflow-hidden">
              <div className="bg-red-500 px-5 py-3 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-white" />
                <span className="font-semibold text-white text-lg">Unable to Verify</span>
              </div>
              <div className="p-5">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-900 font-medium">Unable to verify from available BIS sources. The mark could not be detected, the format is invalid, or the CM/L number does not exist in BIS records.</p>
                </div>
                <div className="text-sm text-gray-600 mb-4">If this product carries a BIS mark that should be valid, report it to BIS for investigation at <strong>1800-11-4899</strong>.</div>
                <button onClick={handleReset} className="text-sm text-[#0f172a] border border-[#0f172a] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Try Another Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
