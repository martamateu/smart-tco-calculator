import { TcoInput, TcoResult, Material, Region, Scenario, Explanation, ChatRequest, ChatResponse } from '../types';

// Use production backend URL or localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://smart-tco-backend-859997094469.europe-west1.run.app/api'
  : 'http://localhost:8000/api';

const api = {
  getMaterials: async (): Promise<Material[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      return await response.json();
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  },

  getRegions: async (): Promise<Region[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/regions`);
      if (!response.ok) throw new Error('Failed to fetch regions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  getScenarios: async (material: string, region: string, volume: number, years: number): Promise<Scenario[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios?material=${material}&region=${region}&volume=${volume}&years=${years}`);
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
      const response = await fetch(`${API_BASE_URL}/predict`, {
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
      const response = await fetch(`${API_BASE_URL}/explain`, {
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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

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
