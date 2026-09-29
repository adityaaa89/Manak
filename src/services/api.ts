import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout to handle LLM generation latency
});

// Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- Interfaces ---

// Products API
export interface ProductAnalysisRequest {
  description: string;
}

export interface ProductAnalysisResponse {
  product_name: string;
  category: string;
  material?: string;
  usage?: string;
  missing_information: string[];
}

// Standards API
export interface StandardsDiscoverRequest {
  product_description?: string;
  product_name: string;
  category: string;
  attributes: Record<string, string>;
}

export interface StandardMatch {
  standard_id: number;
  standard_number: string;
  title: string;
  scheme: string;
  qco_status: string;
  confidence_score: number;
  matching_reason: string[];
}

export interface StandardsDiscoverResponse {
  message: string;
  matches: StandardMatch[];
}

// QCO API
export interface QCOCheckRequest {
  enterprise_type?: string;
  current_date?: string;
}

export interface QCOCheckResponse {
  status: string;
  effective_date?: string;
  reason: string;
}

// Testing API
export interface TestDetail {
  test_name: string;
  clause?: string;
  equipment?: string;
  type?: string;
}

export interface TestingRequirementsResponse {
  standard_id: number;
  standard_number?: string;
  tests: TestDetail[];
}

// Factory Readiness API
export interface FactoryAssessRequest {
  standard_id: number;
  responses: Record<string, any>;
}

export interface ReadinessSection {
  name: string;
  score: number;
  items: any[];
}

export interface CriticalGap {
  requirement: string;
  severity: string;
  recommended_action: string;
}

export interface FactoryAssessResponse {
  standard_id?: number;
  standard_number?: string;
  assessment_id?: string;
  overall_score: number;
  sections: ReadinessSection[];
  critical_gaps: CriticalGap[];
  recommended_actions: string[];
}

// Laboratories API
export interface LabSearchRequest {
  standard_id: number;
  required_tests: string[];
  location: Record<string, string>;
}

export interface LabResult {
  name: string;
  supported_tests: string[];
  matching_reason: string[];
  recognition_status: string;
}

export interface LabSearchResponse {
  results: LabResult[];
}

// Blueprint API
export interface ProductInfo {
  name: string;
  category: string;
}

export interface StandardInfo {
  number: string;
  title: string;
  scheme: string;
}

export interface QCOInfo {
  status: string;
  effective_date?: string;
}

export interface BlueprintReadinessInfo {
  score: number;
  critical_gaps: Record<string, any>[];
}

export interface TestingReqInfo {
  name: string;
  type: string;
}

export interface LabRecInfo {
  name: string;
  matching_reason: string[];
}

export interface BlueprintGenerateResponse {
  product: ProductInfo;
  standard: StandardInfo;
  qco_status: QCOInfo;
  readiness: BlueprintReadinessInfo;
  testing_requirements: TestingReqInfo[];
  recommended_labs: LabRecInfo[];
  generated_at: string;
  explanation?: {
    decision: string;
    confidence: string;
    reasoning: string[];
  };
}

// RAG API
export interface RagQueryRequest {
  query: string;
  conversation_id?: string;
  language?: string;
  mode?: string;
  context_standard?: string;
}

export interface Citation {
  document: string;
  clause: string;
  page: string;
  excerpt: string;
}

export interface RagQueryResponse {
  answer: any;
  confidence: string;
  sources: Citation[];
}

// Verification API
export interface VerificationIdentifier {
  type: string;
  value: string;
}

export interface VerificationStatus {
  status: string;
  scope_match: boolean;
  message?: string;
}

export interface VerificationResponse {
  ocr_text: string;
  identifier: VerificationIdentifier;
  verification: VerificationStatus;
  manufacturer?: string;
  standard?: string;
  valid_until?: string;
}

// --- API Modules ---

export const productsAPI = {
  analyseProduct: async (description: string): Promise<ProductAnalysisResponse> => {
    const { data } = await apiClient.post<ProductAnalysisResponse>('/products/analyse', { description });
    return data;
  },
};

export const standardsAPI = {
  discoverStandard: async (payload: StandardsDiscoverRequest): Promise<StandardsDiscoverResponse> => {
    const { data } = await apiClient.post<StandardsDiscoverResponse>('/standards/discover', payload);
    return data;
  },
};

export const qcoAPI = {
  checkQCO: async (standard_id: number, payload: QCOCheckRequest = {}): Promise<QCOCheckResponse> => {
    const { data } = await apiClient.post<QCOCheckResponse>(`/qco/check/${standard_id}`, payload);
    return data;
  },
};

export const testingAPI = {
  getTestingRequirements: async (standard_id: number): Promise<TestingRequirementsResponse> => {
    const { data } = await apiClient.get<TestingRequirementsResponse>(`/testing/requirements/${standard_id}`);
    return data;
  },
};

export const readinessAPI = {
  assessFactoryReadiness: async (payload: FactoryAssessRequest): Promise<FactoryAssessResponse> => {
    const { data } = await apiClient.post<FactoryAssessResponse>('/factory/assess', payload);
    return data;
  },
};

export const labsAPI = {
  searchLaboratories: async (payload: LabSearchRequest): Promise<LabSearchResponse> => {
    const { data } = await apiClient.post<LabSearchResponse>('/laboratories/search', payload);
    return data;
  },
};

export const blueprintAPI = {
  generateBlueprint: async (product_id: number = 1, standard_id: number = 1, city: string = 'Mumbai'): Promise<BlueprintGenerateResponse> => {
    const { data } = await apiClient.get<BlueprintGenerateResponse>('/blueprint/generate', {
      params: { product_id, standard_id, city },
    });
    return data;
  },
};

export const ragAPI = {
  askQuestion: async (payload: RagQueryRequest): Promise<RagQueryResponse> => {
    const { data } = await apiClient.post<RagQueryResponse>('/chat/query', payload);
    return data;
  },
};

export const verificationAPI = {
  verifyImage: async (file: File, product_name?: string): Promise<VerificationResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (product_name) {
      formData.append('product_name', product_name);
    }
    const { data } = await apiClient.post<VerificationResponse>('/verify/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
export const demoAPI = {
  complianceAnalysis: async (product_description: string, city: string = 'Mumbai'): Promise<any> => {
    const { data } = await apiClient.post<any>('/demo/compliance-analysis', {
      product_description,
      city,
    });
    return data;
  },
};
