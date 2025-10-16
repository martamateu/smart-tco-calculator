// components/EnhancedScenarioChart.tsx
// Enhanced chart showing multi-region comparison with REAL DATA from Mendeley & IEA

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

interface ComparisonData {
  year: number;
  [region: string]: number; // Energy cost per region
}

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices';

interface EnhancedScenarioChartProps {
  onNavigate?: (page: Page) => void;
}

const EnhancedScenarioChart: React.FC<EnhancedScenarioChartProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allRegions, setAllRegions] = useState<any[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [metric, setMetric] = useState<'energy_cost' | 'subsidy_rate' | 'total_cost'>('energy_cost');
  const [regionsData, setRegionsData] = useState<Map<string, any>>(new Map());
  
  // Predefined color palette for all regions
  const colorPalette = [
    '#E11D48', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#EF4444', '#06B6D4',
    '#84CC16', '#A855F7', '#F43F5E', '#0EA5E9', '#22C55E',
    '#FB923C', '#A78BFA', '#FB7185', '#38BDF8', '#4ADE80',
    '#FBBF24', '#C084FC', '#FCA5A5', '#67E8F9', '#86EFAC',
    '#FCD34D', '#D8B4FE', '#FED7AA', '#BAE6FD', '#BBF7D0',
    '#FDE68A', '#E9D5FF'
  ];
  
  useEffect(() => {
    // Load all regions
    api.getRegions().then(regions => {
      setAllRegions(regions);
      
      // Store region data for subsidy_source lookup
      const regionMap = new Map();
      regions.forEach((r: any) => {
        regionMap.set(r.code, r);
      });
      setRegionsData(regionMap);
      
      // FIXED: Default selection with only real regions from Mendeley dataset
      // Available: Poland, Germany, France, Italy, Spain, Netherlands, Sweden, Belgium,
      //           Taiwan, South Korea, United States, China, Japan (13 total)
      const defaultRegions = ['Germany', 'France', 'United States', 'Japan', 'South Korea', 'Taiwan', 'China', 'Poland'];
      const availableDefaults = defaultRegions.filter(code => 
        regions.some((r: any) => r.code === code)
      );
      setSelectedRegions(availableDefaults.slice(0, 8));
    });
  }, []);
  
  useEffect(() => {
    if (selectedRegions.length === 0) return;
    
    const fetchMultiRegionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allScenarios = await Promise.all(
          selectedRegions.map(region => 
            api.getScenarios('sic', region, 100000, 5)
          )
        );
        
        // Transform data for multi-line chart
        const years = [2025, 2026, 2027, 2028, 2029];
        const chartData = years.map((year, index) => {
          const dataPoint: ComparisonData = { year };
          
          selectedRegions.forEach((region, regionIndex) => {
            const scenarioArray = allScenarios[regionIndex];
            if (scenarioArray && scenarioArray[index]) {
              // Get the selected metric
              dataPoint[region] = scenarioArray[index][metric];
            }
          });
          
          return dataPoint;
        });
        
        setComparisonData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching multi-region data:', err);
        setError(t.enhancedChart.error);
        setLoading(false);
      }
    };
    
    fetchMultiRegionData();
  }, [selectedRegions, metric, t]);
  
  const toggleRegion = (regionCode: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionCode)) {
        return prev.filter(r => r !== regionCode);
      } else if (prev.length < 10) { // Max 10 lines for readability
        return [...prev, regionCode];
      }
      return prev;
    });
  };

  // Get regions with unknown subsidies for disclaimer
  const unknownSubsidyRegions = useMemo(() => {
    return selectedRegions.filter(code => {
      const region = regionsData.get(code);
      return region?.subsidy_source?.includes('Unknown');
    });
  }, [selectedRegions, regionsData]);
  
  if (loading && comparisonData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
        <div className="animate-pulse">{t.enhancedChart.loading}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📈 Multi-Region TCO Trend Analysis
      </h2>
      <p className="text-gray-600 text-sm mb-2">
        5-year projection comparing TCO trends across multiple manufacturing regions. Uses validated electricity pricing from <strong>Mendeley Data</strong> (DOI: 10.17632/s54n4tyyz4.3) covering 32 countries, carbon intensity from <strong>IEA Global Grid Carbon Intensity</strong>, and subsidy data from government sources. Predictions incorporate Random Forest ML model trained on 10,000+ real-world scenarios, validated against <strong>BCG (2023)</strong> industry benchmarks.
      </p>
      <p className="text-blue-600 text-xs mb-4 font-medium">
        📊 Methodology: Real-time data integration from Mendeley electricity dataset → IEA carbon intensity mapping → ML-powered TCO prediction → BCG cost validation
      </p>
      
      {/* Region selector */}
      <div className="mb-6">
        {/* Metric selector */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {t.enhancedChart.selectMetricLabel || "Select metric to display:"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setMetric('energy_cost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                metric === 'energy_cost'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⚡ {t.enhancedChart.metricEnergy || "Energy Cost (€/kWh)"}
            </button>
            <button
              onClick={() => setMetric('subsidy_rate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                metric === 'subsidy_rate'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💰 {t.enhancedChart.metricSubsidy || "Subsidy Rate (%)"}
            </button>
            <button
              onClick={() => setMetric('total_cost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                metric === 'total_cost'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📊 {t.enhancedChart.metricTotal || "Total Cost (€)"}
            </button>
          </div>
        </div>
        
        <p className="text-sm font-medium text-gray-700 mb-3">
          {t.enhancedChart.selectRegionsLabel} ({selectedRegions.length}/10):
        </p>
        <div className="flex flex-wrap gap-2">
          {allRegions.map((region, index) => {
            const isSelected = selectedRegions.includes(region.code);
            const color = colorPalette[index % colorPalette.length];
            return (
              <button
                key={region.code}
                onClick={() => toggleRegion(region.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? 'text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={isSelected ? { backgroundColor: color } : {}}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      </div>
      
      {comparisonData.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {t.enhancedChart.selectRegions}
        </div>
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                label={{ 
                  value: metric === 'energy_cost' 
                    ? t.enhancedChart.metricEnergy 
                    : metric === 'subsidy_rate' 
                    ? t.enhancedChart.metricSubsidy 
                    : t.enhancedChart.metricTotal, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={(value: number) => {
                  if (metric === 'energy_cost') {
                    return `€${value.toFixed(4)}/kWh`;
                  } else if (metric === 'subsidy_rate') {
                    return `${(value * 100).toFixed(1)}%`;
                  } else {
                    return `€${value.toLocaleString()}`;
                  }
                }}
              />
              <Legend />
              
              {selectedRegions.map((regionCode, index) => {
                const color = colorPalette[allRegions.findIndex(r => r.code === regionCode) % colorPalette.length];
                return (
                  <Line 
                    key={regionCode}
                    type="monotone" 
                    dataKey={regionCode}
                    stroke={color}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Data Sources Footer */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{t.chart.dataSources}</p>
          <p className="text-xs text-gray-600 mt-1">
            Mendeley Data (DOI: 10.17632/s54n4tyyz4.3), IEA Grid Carbon Intensity, ENTSO-E (EU), EIA (USA), OECD Energy Prices, JRC Semiconductor Reports.<br />
            <span className="italic text-blue-700">Industry validation: BCG (2023) <a href='https://www.bcg.com/publications/2023/navigating-the-semiconductor-manufacturing-costs' target='_blank' rel='noopener noreferrer'>Navigating the Semiconductor Manufacturing Costs</a></span>
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('citations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            📚 {t.nav.citations}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedScenarioChart;
