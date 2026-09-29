import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, ChevronRight, FileText, BookOpen, Eye, EyeOff,
  ChevronDown, ExternalLink, AlertCircle
} from 'lucide-react';
import { ragAPI } from '../services/api';

type Evidence = {
  id: string;
  documentName: string;
  standardNumber: string;
  clause: string;
  page: string;
  source: string;
  status: string;
  confidence: string;
  excerpt?: string;
};

type Message = {
  id: number;
  role: 'user' | 'ai';
  content: any;
  evidence?: Evidence[];
  explanation?: {
    decision: string;
    confidence: string;
    reasoning: string[];
  };
};

const languages = ['English', 'हिन्दी', 'मराठी', 'தமிழ்'];

function EvidenceCard({ ev }: { ev: Evidence }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-[#0f172a] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Evidence Source</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-xs text-gray-500 font-medium">Document:</span>
          <span className="text-xs font-semibold text-gray-900 text-right w-2/3 truncate" title={ev.documentName}>{ev.documentName || 'Product Manual'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-xs text-gray-500 font-medium">Clause:</span>
          <span className="text-xs font-semibold text-gray-900">{ev.clause || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-xs text-gray-500 font-medium">Page:</span>
          <span className="text-xs font-semibold text-gray-900">{ev.page || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-xs text-gray-500 font-medium">Confidence:</span>
          <span className="text-xs font-semibold text-green-600">{ev.confidence || 'High'}</span>
        </div>
        
        {ev.excerpt && (
          <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-100 line-clamp-3">
            "{ev.excerpt}"
          </div>
        )}
        
        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 bg-[#F5F7FA] border border-gray-200 text-[#0f172a] text-xs font-semibold py-2 rounded hover:bg-gray-100 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Source
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, showEvidence, onToggleEvidence }: {
  msg: Message;
  showEvidence: boolean;
  onToggleEvidence: () => void;
}) {
  const [mode, setMode] = useState<'technical' | 'simple'>('technical');

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="chat-bubble-user max-w-[80%] px-4 py-3 text-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="chat-bubble-ai max-w-[90%] px-4 py-3">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#0f172a] font-medium">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Manak AI
          </div>
          <div className="flex gap-1">
            {(['technical', 'simple'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs px-2 py-0.5 rounded ${mode === m ? 'bg-[#0f172a] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {m === 'technical' ? 'Technical' : 'Simple'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {typeof msg.content === 'string' ? (
            mode === 'simple'
              ? msg.content.replace(/\*\*.*?\*\*/g, '').replace(/\n+/g, ' ').substring(0, 200) + '...'
              : msg.content
          ) : (
            <div className="space-y-4">
              {/* 1. Direct Answer */}
              {msg.content.direct_answer && (
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p>{msg.content.direct_answer}</p>
                </div>
              )}
              
              {/* 2 & 3. Compliance & Standard */}
              <div className="grid grid-cols-2 gap-3">
                {msg.content.compliance_status && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-semibold text-xs text-gray-500 uppercase">Compliance Status</div>
                    <div className="mt-1">
                      <span className="block text-sm">Certification: <span className="font-semibold">{msg.content.compliance_status.certification_required}</span></span>
                      <span className="block text-sm">QCO Status: <span className="font-semibold">{msg.content.compliance_status.qco_status}</span></span>
                    </div>
                  </div>
                )}
                
                {msg.content.applicable_standard && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-semibold text-xs text-gray-500 uppercase">Applicable Standard</div>
                    <div className="mt-1 font-semibold text-sm">{msg.content.applicable_standard}</div>
                  </div>
                )}
              </div>

              {/* 4. Journey Timeline */}
              {msg.content.certification_path && msg.content.certification_path.length > 0 && (
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-semibold text-xs text-gray-500 uppercase mb-2">Certification Path</div>
                  <div className="space-y-2 pl-2 border-l-2 border-blue-500">
                    {msg.content.certification_path.map((step: any, i: number) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5" />
                        <span className="text-sm font-medium">Step {step.step_number}:</span> <span className="text-sm">{step.step_title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5, 6, 7. Lists */}
              <div className="grid grid-cols-1 gap-3">
                {msg.content.required_documents && msg.content.required_documents.length > 0 && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-semibold text-xs text-gray-500 uppercase mb-2">Required Documents</div>
                    <ul className="list-disc pl-5 text-sm">
                      {msg.content.required_documents.map((doc: string, i: number) => <li key={i}>{doc}</li>)}
                    </ul>
                  </div>
                )}
                
                {msg.content.testing_requirements && msg.content.testing_requirements.length > 0 && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-semibold text-xs text-gray-500 uppercase mb-2">Testing Requirements</div>
                    <ul className="list-disc pl-5 text-sm">
                      {msg.content.testing_requirements.map((test: string, i: number) => <li key={i}>{test}</li>)}
                    </ul>
                  </div>
                )}
                
                {msg.content.recommended_laboratories && msg.content.recommended_laboratories.length > 0 && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-semibold text-xs text-gray-500 uppercase mb-2">Recommended Laboratories</div>
                    <ul className="list-disc pl-5 text-sm">
                      {msg.content.recommended_laboratories.map((lab: string, i: number) => <li key={i}>{lab}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Explainability Card */}
          {'explanation' in msg && msg.explanation && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-900">AI Decision Logic</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-blue-700/70 font-semibold block text-xs">Decision</span>
                  <span className="text-blue-900 font-medium">{msg.explanation.decision}</span>
                </div>
                <div>
                  <span className="text-blue-700/70 font-semibold block text-xs">Confidence</span>
                  <span className="text-blue-900 font-medium">{msg.explanation.confidence}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-blue-700/70 font-semibold block text-xs mb-1">Reasoning Factors</span>
                <ul className="list-disc pl-5 text-blue-900 text-sm space-y-1">
                  {msg.explanation.reasoning.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        {'evidence' in msg && msg.evidence && msg.evidence.length > 0 && (
          <button
            onClick={onToggleEvidence}
            className="mt-2 flex items-center gap-1.5 text-xs text-[#0f172a] hover:underline"
          >
            {showEvidence ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showEvidence ? 'Hide' : 'Show'} {msg.evidence.length} Evidence Source{msg.evidence.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}

export default function EvidenceAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      content: 'Hello! I am Manak, your AI compliance assistant. I can help answer questions using official BIS regulations and standard documents. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('English');
  const [conversationId] = useState(`conv-${Math.random().toString(36).substr(2, 9)}`);
  const [evidenceVisible, setEvidenceVisible] = useState<Record<number, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const activeEvidence: Evidence[] = messages
    .filter((m): m is Message & { evidence: Evidence[] } => m.role === 'ai' && 'evidence' in m && !!m.evidence && evidenceVisible[m.id])
    .flatMap(m => m.evidence as Evidence[]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await ragAPI.askQuestion({
        query: userMsg.content,
        conversation_id: conversationId,
        language: lang,
        mode: 'technical',
        context_standard: 'IS 302-2-15'
      });
      
      const mappedEvidence: Evidence[] = res.sources.map((src, i) => ({
        id: `ev-${Date.now()}-${i}`,
        documentName: src.document,
        standardNumber: 'IS 302-2-15',
        clause: src.clause,
        page: src.page,
        source: 'BIS',
        status: 'Active',
        confidence: res.confidence || 'High',
        excerpt: src.excerpt
      }));

      const aiMsgId = Date.now() + 1;
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'ai',
        content: res.answer,
        evidence: mappedEvidence,
        explanation: res.explanation,
      };
      
      setMessages(prev => [...prev, aiMsg]);
      // Auto-expand evidence for the new response
      setEvidenceVisible(prev => ({ ...prev, [aiMsgId]: true }));
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'ai',
        content: 'Sorry, I encountered an error while trying to fetch the information. Please try again later.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Evidence Assistant</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">Evidence-Locked Manak AI</h1>
              <p className="text-blue-200 text-sm mt-1">Every answer is grounded in official BIS documents with clause-level citations.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-900 text-sm px-3 py-1.5 rounded-lg appearance-none pr-8 outline-none shadow-sm"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4">
          {/* Chat panel */}
          <div className="flex-1 min-w-0 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
            {/* Context bar inside the chat */}
            <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-3 flex items-center gap-3 shrink-0">
              <BookOpen className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <div className="text-xs text-blue-900">
                <span className="font-semibold">Active context:</span> IS 302-2-15:2025 · Electric Kettle · Scheme-I · BIS Certification Regulations 2018
              </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gray-50/50">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  showEvidence={evidenceVisible[msg.id] || false}
                  onToggleEvidence={() => setEvidenceVisible(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                />
              ))}
              {isTyping && (
                <div className="flex gap-2 items-center text-sm text-gray-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full dot-1" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full dot-2" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full dot-3" />
                  </div>
                  Searching BIS documents...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              {/* Disclaimer */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2 px-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                AI responses are based on BIS documents. Always verify with official BIS sources before making compliance decisions.
              </div>

              <div className="flex items-end gap-2 bg-white border-2 border-gray-200 rounded-xl p-1.5 shadow-sm hover:border-gray-300 focus-within:!border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-200">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about testing requirements, documents, fees, certification process..."
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none text-gray-800 placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Evidence drawer */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
              <div className="bg-[#0f172a] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-semibold">Evidence Sources</span>
                </div>
                <span className="text-xs text-blue-300">{activeEvidence.length} source{activeEvidence.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-y-auto p-3 space-y-3 h-full">
                {activeEvidence.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-gray-400">
                    <FileText className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Evidence sources will appear here as the AI references BIS documents.</p>
                  </div>
                ) : (
                  activeEvidence.map((ev) => (
                    <EvidenceCard key={ev.id} ev={ev} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
