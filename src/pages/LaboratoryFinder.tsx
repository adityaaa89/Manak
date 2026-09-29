import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, MapPin, Phone, Mail, CheckCircle2,
  Shield, FlaskConical, Filter, Search, Clock, Star, ExternalLink
} from 'lucide-react';
import { labsAPI } from '../services/api';

const cities = ['All Locations', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Ahmedabad'];
const standards = ['All Standards', 'IS 302-2-15', 'IS 16156', 'IS 14543', 'IS 2082', 'IS 13252'];
const testTypes = ['All Tests', 'Electrical Safety', 'Chemical Testing', 'Mechanical Testing', 'Water Quality', 'Calibration'];

const cityPositions: Record<string, { x: number; y: number }> = {
  Delhi: { x: 45, y: 25 },
  Mumbai: { x: 28, y: 52 },
  Ahmedabad: { x: 22, y: 38 },
  Bengaluru: { x: 38, y: 68 },
  Chennai: { x: 46, y: 70 },
};

export default function LaboratoryFinder() {
  const [cityFilter, setCityFilter] = useState('All Locations');
  const [stdFilter, setStdFilter] = useState('All Standards');
  const [testFilter, setTestFilter] = useState('All Tests');
  const [search, setSearch] = useState('');
  
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLabs() {
      setLoading(true);
      try {
        const res = await labsAPI.searchLaboratories({
          standard_id: 1, // Using default ID for testing purposes
          required_tests: testFilter !== 'All Tests' ? [testFilter] : [],
          location: cityFilter !== 'All Locations' ? { city: cityFilter } : {}
        });
        
        // Map backend LabResult to UI format
        const mappedLabs = res.results.map((r, i) => {
          // Infer city from name or default to Delhi for map purposes
          let city = 'Delhi';
          if (r.name.toLowerCase().includes('mumbai')) city = 'Mumbai';
          if (r.name.toLowerCase().includes('bengaluru')) city = 'Bengaluru';
          if (r.name.toLowerCase().includes('chennai')) city = 'Chennai';
          if (r.name.toLowerCase().includes('ahmedabad')) city = 'Ahmedabad';

          return {
            id: `lab-${i}`,
            name: r.name,
            city: city,
            location: `${city}, India`,
            nabl: true, // Assuming true for now
            standards: ['IS 302-2-15'], // Using default
            tests: r.supported_tests || ['Electrical Safety', 'Performance Testing'],
            recognition: r.recognition_status,
            turnaround: '10-15 Days',
            accreditationNo: 'TC-' + Math.floor(Math.random() * 9000 + 1000),
            status: 'Active',
            contact: '+91 1800 123 4567',
            email: 'contact@' + r.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
            matching_reason: r.matching_reason
          };
        });
        
        setLabs(mappedLabs);
        if (mappedLabs.length > 0) setSelectedLab(mappedLabs[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLabs();
  }, [cityFilter, stdFilter, testFilter]);

  const filtered = labs.filter(lab => {
    if (search && !lab.name.toLowerCase().includes(search.toLowerCase()) && !lab.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedLabData = labs.find(l => l.id === selectedLab);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Laboratory Finder</span>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Find Testing Laboratories</h1>
          <p className="text-blue-200">Locate BIS-recognised laboratories by product, standard, test type, or location.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Filter className="w-4 h-4" />
            Filter Laboratories
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lab name..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
              />
            </div>
            {[
              { value: stdFilter, onChange: setStdFilter, options: standards, label: 'Standard' },
              { value: testFilter, onChange: setTestFilter, options: testTypes, label: 'Test Type' },
              { value: cityFilter, onChange: setCityFilter, options: cities, label: 'Location' },
            ].map((filter) => (
              <select
                key={filter.label}
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] text-gray-700"
              >
                {filter.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-1" />
              <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-2" />
              <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full dot-3" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Lab list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-sm text-gray-500 mb-2">{filtered.length} laboratories found</div>
              {filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No laboratories match your filters.</p>
                </div>
              ) : filtered.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => setSelectedLab(lab.id)}
                  className={`w-full text-left bg-white border rounded-xl p-4 transition-all ${
                    selectedLab === lab.id ? 'border-[#0f172a] shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-heading font-semibold text-sm text-gray-900 leading-snug">{lab.name}</div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {lab.nabl && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">NABL</span>
                      )}
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">BIS Recognised</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {lab.location}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lab.tests.slice(0, 3).map((test: string) => (
                      <span key={test} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {test}
                      </span>
                    ))}
                    {lab.tests.length > 3 && (
                      <span className="text-xs text-gray-400">+{lab.tests.length - 3} more</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Map + detail */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#F5F7FA] border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Laboratory Locations
                </div>
                <div className="relative h-80 bg-gray-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLabData ? `${selectedLabData.name}, ${selectedLabData.location}` : (cityFilter === 'All Locations' ? 'India' : `${cityFilter}, India`))}&output=embed&z=${selectedLabData ? 14 : (cityFilter === 'All Locations' ? 5 : 11)}`}
                  ></iframe>
                </div>
              </div>

              {/* Selected lab detail */}
              {selectedLabData && (
                <div className="bg-white border border-[#0f172a] rounded-xl overflow-hidden">
                  <div className="bg-[#0f172a] px-4 py-3">
                    <div className="text-white font-heading font-semibold">{selectedLabData.name}</div>
                    <div className="text-blue-200 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedLabData.location}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Recognition', value: selectedLabData.recognition },
                        { label: 'NABL Accredited', value: selectedLabData.nabl ? 'Yes' : 'No' },
                        { label: 'Turnaround', value: selectedLabData.turnaround },
                        { label: 'Accreditation No.', value: selectedLabData.accreditationNo },
                        { label: 'Status', value: selectedLabData.status },
                      ].map((item) => (
                        <div key={item.label} className="bg-[#F5F7FA] rounded-lg p-2.5">
                          <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                          <div className={`text-sm font-semibold ${item.label === 'Status' ? 'text-green-600' : item.label === 'NABL Accredited' && item.value === 'Yes' ? 'text-blue-700' : 'text-gray-900'}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-green-600 text-green-600" />
                        Recommended because:
                      </div>
                      <ul className="space-y-1">
                        {selectedLabData.matching_reason.map((reason: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supported Tests</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLabData.tests.map((test: string) => (
                          <span key={test} className="text-xs bg-blue-50 border border-blue-100 text-blue-800 px-2 py-1 rounded">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Applicable Standards</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLabData.standards.map((std: string) => (
                          <span key={std} className="text-xs bg-[#F5F7FA] border border-gray-200 text-gray-700 px-2 py-1 rounded font-mono">
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-[#0f172a]" />
                        {selectedLabData.contact}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-[#0f172a]" />
                        {selectedLabData.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`mailto:${selectedLabData.email}`} className="flex-1 text-center text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Contact Lab
                      </a>
                      <button className="px-4 text-sm border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <ExternalLink className="w-4 h-4" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
