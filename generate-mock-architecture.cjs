const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, 'src', 'data', 'mock');
if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true });

// Create empty mock files as per user request to set up architecture
const files = [
  'products.json',
  'standards.json',
  'qco.json',
  'documents.json',
  'readiness.json',
  'tests.json',
  'labs.json',
  'licences.json',
  'certificationSteps.json',
  'blueprint.json',
  'verificationRecords.json'
];

files.forEach(f => {
  fs.writeFileSync(path.join(mockDir, f), '{\n  "data": []\n}\n');
});

console.log('Mock architecture files created successfully.');
