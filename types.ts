
export interface Material {
  id: string;
  name: string;
  base_cost?: number;
}

export interface Region {
  code: string;
  name: string;
  subsidy_rate?: number;
  energy_cost?: number;
  carbon_tax?: number;
}

export interface Scenario {
  year: number;
  energy_cost: number;
  subsidy_rate: number;
}

export interface TcoInput {
  material: string;
  region: string;
  volume: number;
  years: number;
}

export interface TcoResult {
  total_cost: number;
  cost_per_chip: number;
  annual_cost: number;
  breakdown: {
    chip_cost: number;
    energy_cost: number;
    carbon_tax: number;
    maintenance: number;
    supply_chain_risk: number;
    total_before_subsidy: number;
    subsidy_amount: number;
    total_after_subsidy: number;
  };
  currency: string;
  material_name: string;
  region_name: string;
  years: number;
  volume: number;
  subsidy_source?: string; // Source of subsidy program (EU Chips Act, USA CHIPS Act, Unknown, etc.)
  data_availability?: {
    energy_prices?: {
      status: string;
      is_expired: boolean;
      age_hours?: number;
      last_update?: string;
      message: string;
      source?: string; // Source of energy price data (ENTSO-E, EIA, etc.)
      is_fallback?: boolean; // Whether this is fallback data (not live API data)
      fallback_reason?: string; // Reason for using fallback data
    };
    ml_model?: string;
  };
  warnings?: string[];
  _rawResponse?: any;  // Store raw backend response for explain endpoint
}

export interface Explanation {
  explanation: string; // Free-form Gemini explanation with inline citations
  sources?: string[]; // List of data sources used in the explanation
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  tco_context?: TcoResult;
  chat_history?: ChatMessage[];
  language?: string;
}

export interface ChatResponse {
  message: string;
  sources: string[];
}

