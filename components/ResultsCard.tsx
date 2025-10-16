
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

  const chartData = [
    { name: t.results.chipCost, cost: result.breakdown.chip_cost },
    { name: t.results.energyCost, cost: result.breakdown.energy_cost },
    { name: t.results.carbonTax, cost: result.breakdown.carbon_tax },
    { name: t.results.maintenance, cost: result.breakdown.maintenance },
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
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis width={80} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="cost">
            {chartData.map((entry, index) => {
              const colors = ['#E11D48', '#3B82F6', '#10B981', '#F59E0B'];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

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
