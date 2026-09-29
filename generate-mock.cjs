const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, 'src', 'data', 'mock');
if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true });

// Extract from Home.tsx
const homeData = {
  stats: [
    { label: 'BIS Standards Covered', value: '22,000+' },
    { label: 'Products Assessed', value: '1,40,000+' },
    { label: 'Manufacturers Onboarded', value: '18,500+' },
    { label: 'Active Licences', value: '35,000+' }
  ],
  features: [
    { id: 'f1', icon: 'Search', title: 'AI Standards Discovery', description: 'Describe your product in plain language. Our AI identifies the applicable BIS Indian Standard, mandatory status, and certification scheme.', path: '/standards-discovery', badge: 'AI-Powered' },
    { id: 'f2', icon: 'Shield', title: 'Evidence-Backed Answers', description: 'Every answer is grounded in official BIS documents with clause-level citations. Toggle between technical and simple explanations.', path: '/evidence-assistant', badge: 'RAG' },
    { id: 'f3', icon: 'TrendingUp', title: 'Certification Journey', description: 'A personalised step-by-step roadmap from product identification to BIS licence grant, with cost and timeline estimates.', path: '/certification-journey', badge: 'Roadmap' },
    { id: 'f4', icon: 'Factory', title: 'Factory Readiness Advisor', description: 'Assess your manufacturing unit against BIS inspection criteria. Identify gaps before the BIS officer visits your factory.', path: '/factory-readiness', badge: 'Checklist' },
    { id: 'f5', icon: 'Camera', title: 'Snap & Verify', description: 'Upload a product image and verify the BIS mark authenticity in seconds. Check CM/L number, manufacturer, and product scope.', path: '/snap-verify', badge: 'Vision AI' },
    { id: 'f6', icon: 'FlaskConical', title: 'Laboratory Finder', description: 'Find BIS-recognised laboratories by product, standard, test type, or location. View NABL accreditation and turnaround time.', path: '/laboratory-finder', badge: 'Directory' }
  ],
  userCards: [
    { id: 'u1', title: 'Complete BIS Certification Guidance', icon: 'Factory', color: 'bg-white border-gray-200', iconColor: 'text-[#0f172a]', badge: 'Manufacturer', description: 'Find applicable standards, identify certification requirements, check factory readiness and prepare for approval.', cta: 'Start Assessment', path: '/dashboard' },
    { id: 'u2', title: 'Verify BIS Mark Authenticity', icon: 'Shield', color: 'bg-white border-gray-200', iconColor: 'text-green-700', badge: 'Consumer', description: 'Upload a product image and verify CM/L, ISI, CRS and BIS-related information.', cta: 'Snap & Verify', path: '/snap-verify' },
    { id: 'u3', title: 'Ask BIS AI Assistant', icon: 'BookOpen', color: 'bg-white border-gray-200', iconColor: 'text-amber-700', badge: 'Knowledge Explorer', description: 'Get source-backed explanations of standards, clauses, testing requirements and procedures.', cta: 'Explore Standards', path: '/evidence-assistant' }
  ],
  journeySteps: [
    { step: '01', label: 'Describe Product', icon: 'FileText' },
    { step: '02', label: 'AI Identifies Standard', icon: 'Search' },
    { step: '03', label: 'Check QCO Status', icon: 'AlertCircle' },
    { step: '04', label: 'Certification Roadmap', icon: 'Layers' },
    { step: '05', label: 'Factory Readiness', icon: 'Factory' },
    { step: '06', label: 'Find Lab & Apply', icon: 'Award' }
  ],
  recentUpdates: [
    { id: 'u1', date: '15 Sep 2025', title: 'QCO for Ceiling Fans (Amendment) — Effective 01 Jan 2026', type: 'QCO', urgent: true },
    { id: 'u2', date: '10 Sep 2025', title: 'IS 302-2-15:2025 (Electric Kettles) — Second Revision Published', type: 'Standard', urgent: false },
    { id: 'u3', date: '05 Sep 2025', title: 'BIS Lab Recognition Extended — National Test House Western Region', type: 'Lab', urgent: false },
    { id: 'u4', date: '28 Aug 2025', title: 'Scheme-I Fee Revision — Effective 01 Oct 2025', type: 'Fee', urgent: true }
  ]
};
fs.writeFileSync(path.join(mockDir, 'home.json'), JSON.stringify(homeData, null, 2));

console.log("Mock data generated.");
