export const fetchMockData = async <T>(filename: string): Promise<T> => {
  try {
    // In a real scenario, this would be a fetch call to an API.
    // For this mock implementation, we dynamically import the JSON file.
    const data = await import(`../data/mock/${filename}.json`);
    
    // Simulate network latency (300-600ms)
    const latency = Math.floor(Math.random() * 300) + 300;
    await new Promise(resolve => setTimeout(resolve, latency));
    
    return data.default as T;
  } catch (error) {
    console.error(`Error loading mock data ${filename}:`, error);
    throw error;
  }
};

export const api = {
  getHomeData: () => fetchMockData<any>('home'),
  getStandards: () => fetchMockData<any>('standardsData'),
  getTestingRequirements: () => fetchMockData<any>('testingRequirements'),
  getLaboratories: () => fetchMockData<any>('laboratories'),
  getFactoryReadiness: () => fetchMockData<any>('factoryReadinessData'),
  getCertificationJourney: () => fetchMockData<any>('certificationJourneyData'),
  getEvidenceChat: () => fetchMockData<any>('evidenceChatData'),
  getVerificationResults: () => fetchMockData<any>('verificationResults'),
  getComplianceBlueprint: () => fetchMockData<any>('complianceBlueprintData'),
};
