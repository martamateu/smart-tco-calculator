
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TcoResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultsCardProps {
  result: TcoResult | null;
  isLoading: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ result, isLoading }) => {
  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">{t.results.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{t.home.subtitle}</p>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: result.currency || 'EUR', 
    notation: 'compact' 
  }).format(value);

  // Chart data with subsidies as negative bar
  const chartData = [
    { name: t.results.chipCost, cost: result.breakdown.chip_cost, type: 'cost' },
    { name: t.results.energyCost, cost: result.breakdown.energy_cost, type: 'cost' },
    { name: t.results.carbonTax, cost: result.breakdown.carbon_tax, type: 'cost' },
    { name: t.results.maintenance, cost: result.breakdown.maintenance, type: 'cost' },
    { name: t.results.subsidyAmount, cost: -result.breakdown.subsidy_amount, type: 'subsidy' },
  ];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.results.title}</h2>
      
      {/* Data freshness info - Always shown */}
      {result.data_availability?.energy_prices && (
        <div className={`mb-6 p-4 border-l-4 rounded ${
          result.warnings && result.warnings.length > 0 
            ? 'bg-yellow-50 border-yellow-400' 
            : 'bg-blue-50 border-blue-400'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.warnings && result.warnings.length > 0 ? (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                result.warnings && result.warnings.length > 0 ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                {result.warnings && result.warnings.length > 0 
                  ? (t.results.dataWarning || "Advertencia de datos")
                  : (t.results.dataInfo || "Información de datos")
                }
              </h3>
              {result.warnings && result.warnings.length > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>{warning.replace('⚠️ ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={`mt-2 text-xs ${
                result.warnings && result.warnings.length > 0 ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                <p className="font-medium">
                  ⚡ {t.results.energyPrices || "Precios de energía"}: {
                    result.data_availability.energy_prices.last_update 
                      ? new Date(result.data_availability.energy_prices.last_update).toLocaleString()
                      : t.results.noData || "No hay datos disponibles"
                  }
                </p>
                <p className="mt-1 italic opacity-80">
                  📡 {t.results.source || "Fuente"}: {
                    result.data_availability.energy_prices.source || "ENTSO-E Transparency Platform (EU)"
                  }
                  {result.data_availability.energy_prices.is_fallback && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                      ⚠️ Fallback
                    </span>
                  )}
                </p>
                {result.data_availability.energy_prices.fallback_reason && (
                  <p className="mt-1 text-xs text-yellow-700 bg-yellow-50 p-1 rounded">
                    ℹ️ {result.data_availability.energy_prices.fallback_reason}
                  </p>
                )}
                {result.data_availability.energy_prices.age_hours !== undefined && (
                  <p className="mt-1">
                    📊 {t.results.dataAge || "Antigüedad"}: {result.data_availability.energy_prices.age_hours.toFixed(1)}h
                  </p>
                )}
                <p className="mt-2 text-xs opacity-70">
                  💎 {t.results.otherSources || "Otros datos"}: Materials Project API, JRC Semiconductor Database, OECD Energy Prices
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-roseRed bg-opacity-10 rounded-lg">
          <p className="text-sm text-gray-600">{t.results.totalCost}</p>
          <p className="text-2xl font-bold text-roseRed">{formatCurrency(result.total_cost)}</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">{t.results.costPerChip}</p>
          <p className="text-2xl font-bold text-blue-600">€{result.cost_per_chip.toFixed(2)}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">{t.results.annualCost}</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(result.annual_cost)}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-3">{t.results.breakdown}</h3>
      <div className="mb-2 px-3 py-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
        <p className="text-xs text-blue-900">
          <strong>ℹ️ Nota:</strong> Las barras positivas representan costos, la barra negativa (verde) representa subsidios aplicados.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-20}
            textAnchor="end"
            height={80}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            width={90}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip 
            formatter={(value: number) => [
              formatCurrency(Math.abs(value)), 
              value < 0 ? 'Subsidio' : 'Costo'
            ]}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
          />
          <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => {
              // Costs: different colors, Subsidy: green (negative)
              const costColors = ['#E11D48', '#3B82F6', '#F59E0B', '#8B5CF6'];
              const subsidyColor = '#10B981';
              const color = entry.type === 'subsidy' ? subsidyColor : costColors[index % costColors.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Waterfall Chart - TCO Flow Visualization */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Flujo de Costos (Waterfall)
        </h3>
        <p className="text-xs text-gray-500 mb-4 italic">
          💡 Visualización de cómo los subsidios reducen el TCO desde los costos base hasta el total final
        </p>
        
        {/* Manual Waterfall Visualization */}
        <div className="space-y-3">
          {/* Base TCO */}
          <div className="flex items-center gap-3">
            <div className="w-32 text-right text-sm font-medium text-gray-700">
              TCO Base
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md flex items-center justify-between px-4 text-white font-semibold"
                style={{ width: `${(result.breakdown.total_before_subsidy / result.breakdown.total_before_subsidy) * 100}%` }}
              >
                <span className="text-sm">Costos Totales</span>
                <span>{formatCurrency(result.breakdown.total_before_subsidy)}</span>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Subsidy Reduction */}
          <div className="flex items-center gap-3">
            <div className="w-32 text-right text-sm font-medium text-gray-700">
              Subsidios
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md flex items-center justify-between px-4 text-white font-semibold"
                style={{ 
                  width: `${(result.breakdown.subsidy_amount / result.breakdown.total_before_subsidy) * 100}%`,
                  marginLeft: 'auto',
                  marginRight: 0
                }}
              >
                <span className="text-sm">-{((result.breakdown.subsidy_amount / result.breakdown.total_before_subsidy) * 100).toFixed(0)}%</span>
                <span>-{formatCurrency(result.breakdown.subsidy_amount)}</span>
              </div>
            </div>
          </div>

          {/* Equals Sign */}
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-400">=</div>
          </div>

          {/* Final TCO */}
          <div className="flex items-center gap-3">
            <div className="w-32 text-right text-sm font-medium text-gray-700">
              TCO Final
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-between px-4 text-white font-bold border-2 border-blue-700"
                style={{ width: `${(result.breakdown.total_after_subsidy / result.breakdown.total_before_subsidy) * 100}%` }}
              >
                <span className="text-sm">Después de Subsidios</span>
                <span className="text-lg">{formatCurrency(result.breakdown.total_after_subsidy)}</span>
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-900">
                  Ahorro Total con Subsidios
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.breakdown.subsidy_amount)}
                </div>
                <div className="text-xs text-green-700">
                  ({((result.breakdown.subsidy_amount / result.breakdown.total_before_subsidy) * 100).toFixed(1)}% del costo base)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.results.totalBeforeSubsidy}:</span>
          <span className="font-semibold">{formatCurrency(result.breakdown.total_before_subsidy)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span className="flex items-center gap-2">
            {t.results.subsidyAmount}:
            {result.subsidy_source?.includes("Unknown") && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded" title={t.results.subsidyUnknown}>
                {t.results.subsidyEstimate}
              </span>
            )}
          </span>
          <span className="font-semibold">-{formatCurrency(result.breakdown.subsidy_amount)}</span>
        </div>
        {result.subsidy_source?.includes("Unknown") && (
          <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
            {t.results.subsidyUnknown}
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>{t.results.totalAfterSubsidy}:</span>
          <span className="text-roseRed">{formatCurrency(result.breakdown.total_after_subsidy)}</span>
        </div>
        <div className="mt-2 text-xs text-blue-700">
          <span className="font-semibold">Sources:</span> Mendeley Data (DOI: 10.17632/s54n4tyyz4.3), IEA Grid Carbon Intensity, BCG (2023) Semiconductor Manufacturing Costs
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
