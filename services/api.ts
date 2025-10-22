import { TcoInput, TcoResult, Material, Region, Scenario, Explanation, ChatRequest, ChatResponse } from '../types';

// Use production backend URL or localhost for development
// For GitHub Pages, we always use production backend
const API_BASE_URL = window.location.hostname === 'martamateu.github.io'
  ? 'https://smart-tco-backend-859997094469.europe-west1.run.app/api'
  : 'http://localhost:8000/api';

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT = 30000;

/**
 * Fetch with timeout support
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 30s)
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const api = {
  getMaterials: async (): Promise<Material[]> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/materials`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      return await response.json();
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  },

  getRegions: async (): Promise<Region[]> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/regions`);
      if (!response.ok) throw new Error('Failed to fetch regions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  getScenarios: async (material: string, region: string, volume: number, years: number): Promise<Scenario[]> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/scenarios?material=${material}&region=${region}&volume=${volume}&years=${years}`);
      if (!response.ok) throw new Error('Failed to fetch scenarios');
      const data = await response.json();
      return data.baseline || [];
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
  },

  predictTco: async (inputs: TcoInput): Promise<TcoResult> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error('Failed to predict TCO');
      }
      
      const data = await response.json();
      return { ...data, _rawResponse: data };
    } catch (error) {
      console.error('Error predicting TCO:', error);
      throw error;
    }
  },

  explainTco: async (inputs: TcoInput, result: TcoResult, language: string = 'en'): Promise<Explanation> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputs,
          result: result._rawResponse || result,
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI explanation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      throw error;
    }
  },

  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }, 60000); // 60s timeout for chat (longer because it may take more time)

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  },
};

export default api;
