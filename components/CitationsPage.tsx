import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CitationsPage: React.FC = () => {
  const { t } = useLanguage();

  const citations = [
    {
      category: t.citations.categoryNames.energyData,
      icon: "⚡",
      sources: [
        {
          title: "Global Day-Ahead Electricity Price Dataset",
          citation: 'Ullah, Md Habib; Reza, Sayed Mohsin; Gundapaneni, Lasya Madhuri; Balachander, Pranav; Babaiahgari, Bhanu; Khan, Abdullah Al Ahad (2025), "Global Day-Ahead Electricity Price Dataset", Mendeley Data, V3',
          doi: "10.17632/s54n4tyyz4.3",
          url: "https://doi.org/10.17632/s54n4tyyz4.3",
          description: "Comprehensive dataset of day-ahead electricity market prices from major markets worldwide including EU (ENTSO-E), USA (ISOs), and Asia-Pacific regions.",
          coverage: "2024-2025, hourly granularity",
          usage: "Real-time energy price updates for TCO calculations across 18+ regions"
        },
        {
          title: "ENTSO-E Transparency Platform",
          citation: 'ENTSO-E (European Network of Transmission System Operators for Electricity), "Transparency Platform - Day-Ahead Prices"',
          url: "https://transparency.entsoe.eu/",
          description: "Official European electricity market data including day-ahead prices, generation, load, and cross-border flows.",
          coverage: "EU member states, real-time and historical data",
          usage: "Live energy price updates for European regions (Germany, France, Spain, Italy, Netherlands, etc.)"
        },
        {
          title: "EIA - U.S. Energy Information Administration",
          citation: 'U.S. Energy Information Administration (2024), "Electric Power Monthly"',
          url: "https://www.eia.gov/electricity/monthly/",
          description: "Official U.S. electricity statistics including prices, generation, sales, and revenue.",
          coverage: "All U.S. states and regions, monthly updates",
          usage: "Energy price data for U.S. regions (Arizona, Texas, Ohio, New York)"
        },
        {
          title: "OECD Energy Prices Database",
          citation: 'OECD (2024), "Energy Prices and Taxes", OECD iLibrary',
          doi: "10.1787/energy_prices-data-en",
          url: "https://doi.org/10.1787/energy_prices-data-en",
          description: "International comparison of energy prices including electricity and natural gas for industry and households.",
          coverage: "OECD member countries, quarterly updates",
          usage: "Baseline energy prices and verification of market data"
        }
      ]
    },
    {
      category: t.citations.categoryNames.semiconductorData,
      icon: "🏭",
      sources: [
        {
          title: "JRC141323: Critical Raw Materials for Strategic Technologies",
          citation: 'European Commission, Joint Research Centre (2024), "Critical Raw Materials for Strategic Technologies and Sectors in the EU", JRC Technical Report JRC141323',
          url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC141323",
          usage: "Semiconductor material properties, supply chain risk assessment"
        },
        {
          title: "JRC133850: Energy and GHG Emissions of Semiconductor Manufacturing",
          citation: 'European Commission, Joint Research Centre (2023), "Energy consumption and greenhouse gas emissions in the semiconductor industry", JRC Technical Report JRC133850',
          usage: "Energy consumption data per chip, carbon footprint calculations"
        },
        {
          title: "JRC133892: Semiconductor Manufacturing Costs",
          citation: 'European Commission, Joint Research Centre (2023), "Cost analysis of semiconductor manufacturing processes", JRC Technical Report JRC133892',
          usage: "Manufacturing cost structures, maintenance cost estimates"
        },
        {
          title: "Materials Project Database",
          citation: 'Jain, A., Ong, S. P., Hautier, G., Chen, W., Richards, W. D., Dacek, S., ... & Persson, K. A. (2013), "Commentary: The Materials Project: A materials genome approach to accelerating materials innovation", APL Materials, 1(1), 011002',
          doi: "10.1063/1.4812323",
          url: "https://materialsproject.org/",
          description: "Open database of computed materials properties including semiconductors (Si, GaN, GaAs, SiC).",
          usage: "Material properties, energy band gaps, thermal conductivity, and performance metrics"
        }
      ]
    },
    {
      category: t.citations.categoryNames.carbonData,
      icon: "🌍",
      sources: [
        {
          title: "EU Emissions Trading System (EU ETS)",
          citation: 'European Commission (2025), "EU Emissions Trading System (EU ETS) - Carbon Market Report 2024"',
          url: "https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en",
          usage: "EU carbon tax rates, CO₂ pricing data"
        },
        {
          title: "IEA World Energy Outlook 2023",
          citation: 'International Energy Agency (2023), "World Energy Outlook 2023", IEA, Paris',
          doi: "10.1787/827374a6-en",
          file: "827374a6-en.pdf (355 pages)",
          usage: "Global energy trends, carbon intensity factors, regional energy mix"
        }
      ]
    },
    {
      category: t.citations.categoryNames.policyData,
      icon: "💰",
      sources: [
        {
          title: "EU Chips Act",
          citation: 'European Parliament and Council (2023), "Regulation (EU) 2023/1781 establishing a framework of measures for strengthening Europe\'s semiconductor ecosystem (Chips Act)", Official Journal of the European Union',
          file: "EU_Chips_Act_Regulation_2023.pdf",
          usage: "EU subsidy rates (40% for advanced fabs), eligibility criteria"
        },
        {
          title: "USA CHIPS and Science Act",
          citation: 'U.S. Congress (2022), "CHIPS and Science Act of 2022", Public Law 117-167',
          usage: "U.S. federal subsidies for semiconductor manufacturing, state incentives"
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 {t.citations.title}
        </h1>
        <p className="text-lg text-gray-600">
          {t.citations.subtitle}
        </p>
      </div>

      {/* Data Quality Badge */}
      <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">{t.citations.dataQuality.title}</h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Authenticity:</strong> {t.citations.dataQuality.authenticity}</li>
                <li><strong>Timeliness:</strong> {t.citations.dataQuality.timeliness}</li>
                <li><strong>Completeness:</strong> {t.citations.dataQuality.completeness}</li>
                <li><strong>Accuracy:</strong> {t.citations.dataQuality.accuracy}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Citations by Category */}
      <div className="space-y-8">
        {citations.map((category, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">{category.icon}</span>
              {category.category}
            </h2>
            
            <div className="space-y-6">
              {category.sources.map((source, sourceIdx) => (
                <div key={sourceIdx} className="border-l-4 border-blue-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {source.title}
                  </h3>
                  
                  <p className="text-sm text-gray-700 italic mb-3 bg-gray-50 p-3 rounded">
                    {source.citation}
                    {source.doi && (
                      <span className="block mt-1 text-blue-600">
                        doi: <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {source.doi}
                        </a>
                      </span>
                    )}
                  </p>

                  {source.url && (
                    <p className="text-sm mb-2">
                      <span className="font-medium text-gray-700">🔗 URL:</span>{' '}
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {source.url}
                      </a>
                    </p>
                  )}

                  {source.file && (
                    <p className="text-sm mb-2">
                      <span className="font-medium text-gray-700">📄 File:</span>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{source.file}</code>
                    </p>
                  )}

                  {source.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">📝 Description:</span> {source.description}
                    </p>
                  )}

                  {source.coverage && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">📊 Coverage:</span> {source.coverage}
                    </p>
                  )}

                  {source.usage && (
                    <p className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
                      <span className="font-medium">✨ Used for:</span> {source.usage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Update Schedule */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📅 {t.citations.updateSchedule.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">⚡</span>
            <div>
              <p className="text-gray-700">{t.citations.updateSchedule.energy}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">⚗️</span>
            <div>
              <p className="text-gray-700">{t.citations.updateSchedule.materials}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">🌍</span>
            <div>
              <p className="text-gray-700">{t.citations.updateSchedule.carbon}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">💰</span>
            <div>
              <p className="text-gray-700">{t.citations.updateSchedule.subsidies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Citation Format Note */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>{t.citations.footer.format}</p>
        <p className="mt-1">{t.citations.footer.lastUpdated}</p>
      </div>
    </div>
  );
};

export default CitationsPage;
