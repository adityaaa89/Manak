import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import StandardsDiscovery from './pages/StandardsDiscovery';
import EvidenceAssistant from './pages/EvidenceAssistant';
import CertificationJourney from './pages/CertificationJourney';
import FactoryReadiness from './pages/FactoryReadiness';
import SnapVerify from './pages/SnapVerify';
import LaboratoryFinder from './pages/LaboratoryFinder';
import ComplianceBlueprint from './pages/ComplianceBlueprint';
import ComplianceAnalysis from './pages/ComplianceAnalysis';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/standards-discovery" element={<StandardsDiscovery />} />
            <Route path="/evidence-assistant" element={<EvidenceAssistant />} />
            <Route path="/certification-journey" element={<CertificationJourney />} />
            <Route path="/factory-readiness" element={<FactoryReadiness />} />
            <Route path="/snap-verify" element={<SnapVerify />} />
            <Route path="/laboratory-finder" element={<LaboratoryFinder />} />
            <Route path="/compliance-blueprint" element={<ComplianceBlueprint />} />
            <Route path="/compliance-analysis" element={<ComplianceAnalysis />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
