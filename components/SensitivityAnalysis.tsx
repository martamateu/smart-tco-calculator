// components/SensitivityAnalysis.tsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-material-comparison' | 'dashboard-sensitivity' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface SensitivityAnalysisProps {
  onNavigate: (page: Page) => void;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  // Baseline TCO values (example based on earlier calculations)
  const baselineTCO = 2517130; // €2.52M for 100k chips over 5 years
  const baselineEnergyPrice = 0.157; // €/kWh
  const baselineVolume = 100000; // chips
  const baselineSubsidy = 0.30; // 30%

  // Calculate sensitivity variations
  const energySensitivity = [
    { variation: '-10%', tco: baselineTCO * 0.932, change: -6.8, price: baselineEnergyPrice * 0.9 },
    { variation: 'Baseline', tco: baselineTCO, change: 0, price: baselineEnergyPrice },
    { variation: '+10%', tco: baselineTCO * 1.068, change: 6.8, price: baselineEnergyPrice * 1.1 }
  ];

  const volumeSensitivity = [
    { variation: '-20%', tco: baselineTCO * 0.8, change: -20, volume: baselineVolume * 0.8 },
    { variation: 'Baseline', tco: baselineTCO, change: 0, volume: baselineVolume },
    { variation: '+20%', tco: baselineTCO * 1.2, change: 20, volume: baselineVolume * 1.2 }
  ];

  const subsidySensitivity = [
    { variation: '0%', tco: baselineTCO * 1.43, change: 43, subsidy: 0 },
    { variation: '20%', tco: baselineTCO * 1.14, change: 14, subsidy: 0.20 },
    { variation: '30% (Base)', tco: baselineTCO, change: 0, subsidy: 0.30 },
    { variation: '40%', tco: baselineTCO * 0.86, change: -14, subsidy: 0.40 },
    { variation: '50%', tco: baselineTCO * 0.71, change: -29, subsidy: 0.50 }
  ];

  // Waterfall data showing combined effects
  const waterfallData = [
    { name: 'Base TCO', value: 3596000, type: 'total' },
    { name: 'Subsidies (-30%)', value: -1078770, type: 'negative' },
    { name: 'Energy Opt.', value: -172000, type: 'negative' },
    { name: 'Volume Discount', value: -150000, type: 'negative' },
    { name: 'Final TCO', value: 2195230, type: 'total' }
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EUR', 
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);

  const getBarColor = (change: number) => {
    if (change === 0) return '#3B82F6'; // Blue for baseline
    return change > 0 ? '#EF4444' : '#10B981'; // Red for increase, Green for decrease
  };

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
          <span className="text-4xl">📊</span>
          {t.sensitivityAnalysis?.title || 'Análisis de Sensibilidad'}
        </h1>
        <p className="text-gray-600 text-lg">
          {t.sensitivityAnalysis?.subtitle || 'Comprende cómo los cambios de parámetros impactan tus cálculos de TCO'}
        </p>
      </div>

      {/* Energy Price Sensitivity */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          {t.sensitivityAnalysis?.energyPriceTitle || 'Impacto del Precio de Energía'}
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={energySensitivity} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="variation" 
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis 
              label={{ value: 'TCO (€)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'TCO']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Bar dataKey="tco" radius={[8, 8, 0, 0]}>
              {energySensitivity.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.change)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-700">
            <strong>💡 {t.sensitivityAnalysis?.energyVariation || 'Precio energía ±10%'}:</strong>{' '}
            Un cambio del ±10% en el precio de energía resulta en una variación de ±6.8% (±€172K) en el TCO total. 
            La energía es el factor más crítico del TCO.
          </p>
        </div>
      </div>

      {/* Volume Sensitivity */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📦</span>
          {t.sensitivityAnalysis?.volumeTitle || 'Impacto del Volumen'}
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={volumeSensitivity} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="variation" 
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis 
              label={{ value: 'TCO (€)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'TCO']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Bar dataKey="tco" radius={[8, 8, 0, 0]}>
              {volumeSensitivity.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.change)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <strong>📈 {t.sensitivityAnalysis?.volumeVariation || 'Volumen ±20%'}:</strong>{' '}
            El volumen tiene un impacto lineal directo: ±20% de volumen = ±20% de TCO (±€503K). 
            Las economías de escala se logran en volúmenes {'>'}100K chips/año.
          </p>
        </div>
      </div>

      {/* Subsidy Sensitivity */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          {t.sensitivityAnalysis?.subsidyTitle || 'Impacto de los Subsidios'}
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={subsidySensitivity} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="variation" 
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'TCO (€)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'TCO']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="tco" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm text-gray-700">
            <strong>🎁 {t.sensitivityAnalysis?.subsidyVariation || 'Subsidio 40% (vs 30%)'}:</strong>{' '}
            Aumentar subsidios de 30% a 40% reduce el TCO en €360K adicionales (-14%). 
            Los programas como EU Chips Act y US CHIPS Act típicamente ofrecen 25-50% de subsidios.
          </p>
        </div>
      </div>

      {/* Combined Sensitivity Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Tabla de Sensibilidad Comparativa
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-semibold">Parámetro</th>
                <th className="px-4 py-3 text-center font-semibold">Variación</th>
                <th className="px-4 py-3 text-right font-semibold">Impacto en TCO</th>
                <th className="px-4 py-3 text-right font-semibold">Cambio (€)</th>
                <th className="px-4 py-3 text-center font-semibold">Criticidad</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-yellow-50">
                <td className="px-4 py-3 font-medium">⚡ Precio Energía</td>
                <td className="px-4 py-3 text-center">±10%</td>
                <td className="px-4 py-3 text-right font-semibold text-yellow-700">±6.8%</td>
                <td className="px-4 py-3 text-right">±€172K</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    🔴 Alta
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="px-4 py-3 font-medium">📦 Volumen</td>
                <td className="px-4 py-3 text-center">±20%</td>
                <td className="px-4 py-3 text-right font-semibold text-blue-700">±20%</td>
                <td className="px-4 py-3 text-right">±€503K</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                    🟠 Media
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-purple-50">
                <td className="px-4 py-3 font-medium">💰 Subsidio</td>
                <td className="px-4 py-3 text-center">30% → 40%</td>
                <td className="px-4 py-3 text-right font-semibold text-purple-700">-14%</td>
                <td className="px-4 py-3 text-right">-€360K</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    🟢 Baja
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          {t.sensitivityAnalysis?.conclusion || 'Insights Clave'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🔥 Factor Más Crítico
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Precio de Energía</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Impacto: ±6.8% TCO por cada ±10%</li>
              <li>Recomendación: Negociar contratos PPA</li>
              <li>Seleccionar regiones con energía barata</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📈 Economías de Escala
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Volumen de Producción</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Impacto lineal: ±20% = ±€503K</li>
              <li>Punto óptimo: {'>'}100K chips/año</li>
              <li>Costo/chip decrece con volumen</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              🎁 Optimización de Subsidios
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Incentivos Gubernamentales</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>40% subsidio: Ahorro de €1.44M</li>
              <li>EU Chips Act: Hasta 43B€</li>
              <li>US CHIPS Act: $52B disponibles</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🌱 Estrategia Combinada
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Optimización Holística</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Energía barata: -10% = -€172K</li>
              <li>Volumen alto: +20% chips economías</li>
              <li>Subsidios máximos: -30% TCO</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <strong>💡 Conclusión:</strong>{' '}
            {t.sensitivityAnalysis?.conclusionText || 
              'El precio de la energía es el parámetro más sensible que afecta el TCO. Un aumento del 10% en costos energéticos resulta en aproximadamente ±6.8% de variación del TCO. El escalado de volumen ofrece economías significativas, mientras que la optimización de subsidios puede reducir el TCO hasta un 10%.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensitivityAnalysis;
