// components/MaterialComparison.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-material-comparison' | 'dashboard-sensitivity' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface MaterialComparisonProps {
  onNavigate: (page: Page) => void;
}

interface MaterialData {
  material: string;
  tcoPerChip: number;
  energyConsumption: number;
  chipCost: number;
  technicalAdvantage: string;
  efficiency: number;
}

const MaterialComparison: React.FC<MaterialComparisonProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Si');

  useEffect(() => {
    const fetchMaterialsData = async () => {
      setLoading(true);
      try {
        // Simular datos de materiales - En producción esto vendría del backend
        const materialsData: MaterialData[] = [
          {
            material: 'Si',
            tcoPerChip: 5.03,
            energyConsumption: 0.5,
            chipCost: 2.75,
            technicalAdvantage: 'Maduro, económico',
            efficiency: 75
          },
          {
            material: 'GaN',
            tcoPerChip: 8.40,
            energyConsumption: 0.18,
            chipCost: 0.63,
            technicalAdvantage: '-75% consumo energético',
            efficiency: 95
          },
          {
            material: 'SiC',
            tcoPerChip: 12.50,
            energyConsumption: 0.25,
            chipCost: 3.82,
            technicalAdvantage: 'Alta temperatura, potencia',
            efficiency: 90
          },
          {
            material: 'GaAs',
            tcoPerChip: 9.20,
            energyConsumption: 0.45,
            chipCost: 1.13,
            technicalAdvantage: 'Alta frecuencia, RF',
            efficiency: 82
          },
          {
            material: 'InP',
            tcoPerChip: 15.75,
            energyConsumption: 0.35,
            chipCost: 2.50,
            technicalAdvantage: 'Óptica, telecom',
            efficiency: 88
          },
          {
            material: 'Diamond',
            tcoPerChip: 450.00,
            energyConsumption: 0.08,
            chipCost: 300.00,
            technicalAdvantage: 'Ultra-potencia, experimental',
            efficiency: 98
          }
        ];

        setMaterials(materialsData);
      } catch (error) {
        console.error('Error fetching materials data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialsData();
  }, []);

  const tcoData = materials.map(m => ({
    material: m.material,
    'TCO/chip (€)': m.tcoPerChip
  }));

  const energyData = materials.map(m => ({
    material: m.material,
    'Consumo (W)': m.energyConsumption
  }));

  const efficiencyData = materials.map(m => ({
    subject: m.material,
    Eficiencia: m.efficiency,
    fullMark: 100
  }));

  const selectedMaterialData = materials.find(m => m.material === selectedMaterial);

  const getBarColor = (material: string) => {
    const colors: { [key: string]: string } = {
      'Si': '#3B82F6',
      'GaN': '#10B981',
      'SiC': '#F59E0B',
      'GaAs': '#EF4444',
      'InP': '#8B5CF6',
      'Diamond': '#EC4899'
    };
    return colors[material] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.dashboard.backHome || 'Back to Home'}
          </button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.dashboard.backHome || 'Back to Home'}
        </button>
      </div>

      {/* Title */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <span className="text-4xl">💎</span>
          {t.materialComparison?.title || 'Comparativa de Materiales'}
        </h1>
        <p className="text-gray-600 text-lg">
          {t.materialComparison?.subtitle || 'Compara el TCO, consumo energético y características técnicas de diferentes materiales semiconductores'}
        </p>
      </div>

      {/* TCO per Chip Comparison */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          {t.materialComparison?.tcoTitle || 'TCO por Chip (€)'}
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={tcoData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="material" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'TCO/chip (€)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`€${value.toFixed(2)}`, 'TCO/chip']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Bar dataKey="TCO/chip (€)" radius={[8, 8, 0, 0]}>
              {tcoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.material)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 {t.materialComparison?.tcoNote || 'Nota'}:</strong>{' '}
            {t.materialComparison?.tcoDescription || 
              'El Si es óptimo para volúmenes >50K chips/año en aplicaciones estándar debido a su bajo costo y madurez tecnológica.'}
          </p>
        </div>
      </div>

      {/* Energy Consumption Comparison */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          {t.materialComparison?.energyTitle || 'Consumo Energético (W)'}
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={energyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="material" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Consumo (W)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}W`, 'Consumo']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Bar dataKey="Consumo (W)" radius={[8, 8, 0, 0]}>
              {energyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.material)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>🌱 {t.materialComparison?.energyNote || 'Ventaja'}:</strong>{' '}
            {t.materialComparison?.energyDescription || 
              'GaN y Diamond ofrecen el menor consumo energético, ideal para aplicaciones de alta eficiencia y reducción de huella de carbono.'}
          </p>
        </div>
      </div>

      {/* Technical Characteristics Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          {t.materialComparison?.tableTitle || 'Características Técnicas Detalladas'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-semibold">Material</th>
                <th className="px-4 py-3 text-right font-semibold">TCO/chip</th>
                <th className="px-4 py-3 text-right font-semibold">vs Si</th>
                <th className="px-4 py-3 text-right font-semibold">Consumo (W)</th>
                <th className="px-4 py-3 text-right font-semibold">Eficiencia</th>
                <th className="px-4 py-3 text-left font-semibold">Ventaja Técnica</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, idx) => {
                const siTco = materials.find(m => m.material === 'Si')?.tcoPerChip || 5.03;
                const vsPercent = ((material.tcoPerChip - siTco) / siTco * 100).toFixed(0);
                return (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMaterial(material.material)}
                    style={selectedMaterial === material.material ? { backgroundColor: '#EFF6FF' } : {}}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: getBarColor(material.material) }}>
                      {material.material}
                    </td>
                    <td className="px-4 py-3 text-right">€{material.tcoPerChip.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {material.material === 'Si' ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <span className={Number(vsPercent) > 0 ? 'text-red-600' : 'text-green-600'}>
                          {Number(vsPercent) > 0 ? '+' : ''}{vsPercent}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{material.energyConsumption}W</td>
                    <td className="px-4 py-3 text-right">{material.efficiency}%</td>
                    <td className="px-4 py-3">{material.technicalAdvantage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          {t.materialComparison?.recommendationsTitle || 'Recomendaciones'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🏭 {t.materialComparison?.volumeTitle || 'Alto Volumen (>100K/año)'}
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>{t.materialComparison?.highVolume.recommended}</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>{t.materialComparison?.highVolume.bullet1}</li>
              <li>{t.materialComparison?.highVolume.bullet2}</li>
              <li>{t.materialComparison?.highVolume.bullet3}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🌱 {t.materialComparison?.efficiencyTitle || 'Máxima Eficiencia Energética'}
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>{t.materialComparison?.efficiency.recommended}</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>{t.materialComparison?.efficiency.bullet1}</li>
              <li>{t.materialComparison?.efficiency.bullet2}</li>
              <li>{t.materialComparison?.efficiency.bullet3}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              ⚡ {t.materialComparison?.powerTitle || 'Alta Potencia'}
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>{t.materialComparison?.power.recommended}</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>{t.materialComparison?.power.bullet1}</li>
              <li>{t.materialComparison?.power.bullet2}</li>
              <li>{t.materialComparison?.power.bullet3}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              📡 {t.materialComparison?.rfTitle || 'RF & Telecomunicaciones'}
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>{t.materialComparison?.rf.recommended}</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>{t.materialComparison?.rf.bullet1}</li>
              <li>{t.materialComparison?.rf.bullet2}</li>
              <li>{t.materialComparison?.rf.bullet3}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <strong>💡 {t.materialComparison?.conclusionNote}</strong>{' '}
            {t.materialComparison?.conclusionText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaterialComparison;
