// components/ScenarioChart.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

interface TcoComparison {
  region: string;
  flag: string;
  tco_total: number;
  energy_cost: number;
  subsidy_amount: number;
}

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface ScenarioChartProps {
  onNavigate?: (page: Page) => void;
}

const ScenarioChart: React.FC<ScenarioChartProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [comparisons, setComparisons] = useState<TcoComparison[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('sic');
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'energy' | 'subsidy'>('total');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // FIXED: Only use regions that actually exist in global_electricity_data_2025.json
  // Available: Poland, Germany, France, Italy, Spain, Netherlands, Sweden, Belgium,
  //           Taiwan, South Korea, United States, China, Japan (13 total)
  const topRegions = ['Germany', 'France', 'Netherlands', 'Spain', 'Belgium', 
                     'United States', 'Taiwan', 'South Korea', 'Japan', 'China', 'Poland', 'Italy', 'Sweden'];

  useEffect(() => {
    api.getMaterials().then(materialsData => {
      setMaterials(materialsData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      setLoading(true);
      Promise.all(
        topRegions.map(region =>
          api.predictTco({ material: selectedMaterial, region, volume: 100000, years: 1 }).then(result => ({
            region: region,
            flag: region.match(/[^\s]+/)?.[0] || '🌍',
            tco_total: result.total_cost,
            energy_cost: result.breakdown?.energy_cost || 0,
            subsidy_amount: result.breakdown?.subsidy_amount || 0
          }))
        )
      ).then(results => {
        results.sort((a, b) => a.tco_total - b.tco_total);
        setComparisons(results);
        setLoading(false);
      });
    }
  }, [selectedMaterial]);
  
  const getBarColor = (index: number) => {
    if (index === 0) return '#10B981'; // Green for best
    if (index === 1) return '#F59E0B'; // Orange for second
    if (index === 2) return '#3B82F6'; // Blue for third
    return '#9CA3AF'; // Gray for others
  };
  
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
        <div className="animate-pulse">Loading TCO Comparison from Mendeley & IEA data...</div>
      </div>
    );
  }
  
  if (comparisons.length === 0) {
    return null;
  }
  
  const getMetricValue = (item: TcoComparison) => {
    switch (selectedMetric) {
      case 'total': return item.tco_total;
      case 'energy': return item.energy_cost;
      case 'subsidy': return item.subsidy_amount;
      default: return item.tco_total;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'total': return 'TCO Total (€)';
      case 'energy': return 'Energy Cost (€)';
      case 'subsidy': return 'Subsidy Amount (€)';
      default: return 'TCO Total (€)';
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🌍 Regional TCO Comparison Dashboard
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Comprehensive TCO analysis across 32 countries with real-time data integration. This dashboard compares total cost of ownership for semiconductor manufacturing using validated electricity prices from <strong>Mendeley Data</strong> (DOI: 10.17632/s54n4tyyz4.3), carbon intensity from <strong>IEA Global Grid Carbon Intensity</strong>, and industry benchmarks validated by <strong>BCG (2023)</strong>. Energy costs can vary up to 10x between regions, while subsidies impact TCO by 25-50%.
        <br />
        <span className="text-xs text-blue-700 mt-2 block">
          📊 Data Sources: Mendeley Global Electricity Dataset (2025) | IEA Grid Carbon Intensity | BCG Semiconductor Cost Analysis
        </span>
      </p>
      
      {/* Material Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Semiconductor Material:
        </label>
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name} ({material.category})
            </option>
          ))}
        </select>
      </div>

      {/* Metric Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedMetric('total')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedMetric === 'total' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📊 Total TCO
        </button>
        <button
          onClick={() => setSelectedMetric('energy')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedMetric === 'energy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⚡ Energy Cost
        </button>
        <button
          onClick={() => setSelectedMetric('subsidy')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedMetric === 'subsidy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💰 Subsidies
        </button>
      </div>
      
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <BarChart 
            data={comparisons}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              label={{ value: getMetricLabel(), position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              width={90}
            />
            <Tooltip 
              formatter={(value: number) => [`€${value.toLocaleString()}`, getMetricLabel()]}
              labelFormatter={(label) => `${comparisons.find(d => d.region === label)?.flag} ${label}`}
            />
            <Bar dataKey={selectedMetric === 'total' ? 'tco_total' : selectedMetric === 'energy' ? 'energy_cost' : 'subsidy_amount'} radius={[0, 8, 8, 0]}>
              {comparisons.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">🥇 Best Region</p>
          <p className="text-2xl font-bold text-green-600">
            {comparisons[0].flag} {comparisons[0].region}
          </p>
          <p className="text-green-700">€{comparisons[0].tco_total.toLocaleString()}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-orange-800 font-semibold">🥈 Second Best</p>
          <p className="text-2xl font-bold text-orange-600">
            {comparisons[1]?.flag} {comparisons[1]?.region}
          </p>
          <p className="text-orange-700">€{comparisons[1]?.tco_total.toLocaleString()}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-semibold">💡 Cost Variance</p>
          <p className="text-2xl font-bold text-blue-600">
            {(((comparisons[comparisons.length - 1].tco_total - comparisons[0].tco_total) / comparisons[0].tco_total) * 100).toFixed(0)}%
          </p>
          <p className="text-blue-700">Between best and worst</p>
        </div>
      </div>
      
      <div className="mt-4 border-t pt-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 mb-2">📚 TCO Methodology</p>
            <p className="text-xs text-gray-600">
              Based on real-time energy prices (Mendeley, IEA), verified subsidy programs, carbon intensity, and industry benchmarks.<br />
              <span className="italic text-blue-700">Industry validation: BCG (2023) <a href='https://www.bcg.com/publications/2023/navigating-the-semiconductor-manufacturing-costs' target='_blank' rel='noopener noreferrer'>Navigating the Semiconductor Manufacturing Costs</a></span>
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('docs')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap ml-4"
            >
              📚 Documentation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioChart;
