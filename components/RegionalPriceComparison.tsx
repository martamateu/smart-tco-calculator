// components/RegionalPriceComparison.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

interface RegionPrice {
  region: string;
  price: number;
  source: string;
  flag: string;
}

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices';

interface RegionalPriceComparisonProps {
  onNavigate?: (page: Page) => void;
}

const RegionalPriceComparison: React.FC<RegionalPriceComparisonProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [priceData, setPriceData] = useState<RegionPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const regions = await api.getRegions();
        
        // Extract all country flags/emojis from region names
        const flagRegex = /[\u{1F1E0}-\u{1F1FF}]{2}/gu;
        
        const priceComparison = regions.map(r => {
          const flags = r.name.match(flagRegex);
          const flag = flags ? flags[0] : '';
          const cleanName = r.name.replace(flagRegex, '').trim();
          
          return {
            region: cleanName,
            price: r.energy_cost || 0,
            source: 'Mendeley Data (DOI: 10.17632/s54n4tyyz4.3)',
            flag: flag
          };
        });
        
        // Sort by price (cheapest first)
        priceComparison.sort((a, b) => a.price - b.price);
        setPriceData(priceComparison);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching regions:', err);
        setError(t.regionalComparison.error);
        setLoading(false);
      }
    };
    
    fetchRegions();
  }, [t]);
  
  const getBarColor = (price: number) => {
    if (price < 0.08) return '#10B981';
    if (price < 0.15) return '#F59E0B';
    return '#EF4444';
  };
  
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
        <div className="animate-pulse">Loading global electricity prices from Mendeley dataset...</div>
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
  
  if (priceData.length === 0) {
    return null;
  }
  
  const minPrice = Math.min(...priceData.map(d => d.price));
  const maxPrice = Math.max(...priceData.map(d => d.price));
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        ⚡ Global Electricity Price Comparison Dashboard
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Comprehensive electricity pricing analysis across 32 countries using validated data from <strong>Mendeley Data</strong> repository (DOI: 10.17632/s54n4tyyz4.3). This dataset provides industrial electricity prices for semiconductor manufacturing hubs in Europe, North America, Asia-Pacific, and Latin America. Prices reflect 2025 Q1 data and show up to <strong>10x variation</strong> between regions, directly impacting TCO calculations as documented by <strong>BCG (2023)</strong>.
        <br />
        <span className="text-xs text-blue-700 mt-2 block">
          📊 Data Source: Mendeley Global Electricity Dataset (DOI: 10.17632/s54n4tyyz4.3) | Validated against IEA Energy Prices | BCG Cost Benchmarks
        </span>
      </p>
      
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <BarChart 
            data={priceData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              label={{ value: t.regionalComparison.priceLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              width={90}
            />
            <Tooltip 
              formatter={(value: number) => [`€${value.toFixed(4)}/kWh`, 'Price']}
              labelFormatter={(label) => `${priceData.find(d => d.region === label)?.flag} ${label}`}
            />
            <Bar dataKey="price" radius={[0, 8, 8, 0]}>
              {priceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.price)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">{t.regionalComparison.cheapest}</p>
          <p className="text-2xl font-bold text-green-600">
            {priceData[0].flag} {priceData[0].region}
          </p>
          <p className="text-green-700">€{minPrice.toFixed(4)}/kWh</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800 font-semibold">{t.regionalComparison.mostExpensive}</p>
          <p className="text-2xl font-bold text-red-600">
            {priceData[priceData.length - 1].flag} {priceData[priceData.length - 1].region}
          </p>
          <p className="text-red-700">€{maxPrice.toFixed(4)}/kWh</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-semibold">{t.regionalComparison.difference}</p>
          <p className="text-2xl font-bold text-blue-600">
            {((maxPrice / minPrice - 1) * 100).toFixed(0)}%
          </p>
          <p className="text-blue-700">
            {maxPrice > minPrice * 2 ? t.regionalComparison.hugeVariation : t.regionalComparison.moderateVariation}
          </p>
        </div>
      </div>
      
      <div className="mt-4 border-t pt-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 mb-2">{t.regionalComparison.sources.title}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <p>• <strong>Mendeley Data</strong>: DOI 10.17632/s54n4tyyz4.3</p>
                <p>• <strong>IEA Grid Carbon Intensity</strong></p>
                <p>• <strong>ENTSO-E (EU)</strong>: {t.regionalComparison.sources.europeSource}</p>
                <p>• <strong>EIA (USA)</strong>: {t.regionalComparison.sources.usaSource}</p>
                <p>• <strong>OECD Energy Prices</strong></p>
                <p>• <strong>JRC Semiconductor Reports</strong></p>
              </div>
              <div>
                <p>• <strong>Industry validation</strong>: BCG (2023) <a href='https://www.bcg.com/publications/2023/navigating-the-semiconductor-manufacturing-costs' target='_blank' rel='noopener noreferrer'>Navigating the Semiconductor Manufacturing Costs</a></p>
              </div>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('citations')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap ml-4"
            >
              📚 {t.nav.citations}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionalPriceComparison;
