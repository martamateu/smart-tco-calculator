// components/RandomForestVisualization.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

// Use production backend URL or localhost for development
// For GitHub Pages, we always use production backend
const API_BASE_URL = window.location.hostname === 'martamateu.github.io'
  ? 'https://smart-tco-backend-859997094469.europe-west1.run.app/api'
  : 'http://localhost:8000/api';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface RandomForestVisualizationProps {
  onNavigate?: (page: Page) => void;
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface ModelMetrics {
  accuracy: number;
  training_samples: number;
  features_used: number;
  trees: number;
  max_depth: number;
}

const RandomForestVisualization: React.FC<RandomForestVisualizationProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setLoading(true);
        
        // Fetch feature importance from backend
        const response = await fetch(`${API_BASE_URL}/ml-model/feature-importance`);
        if (!response.ok) throw new Error('Failed to fetch model data');
        
        const data = await response.json();
        setFeatureImportance(data.feature_importance);
        setModelMetrics(data.metrics);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ML model data:', err);
        setError(t.mlViz?.error || 'Error loading Random Forest model. Please ensure the model is trained with Mendeley & IEA data.');
        setLoading(false);
      }
    };

    fetchModelData();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading Random Forest ML Model trained on Mendeley & IEA datasets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🌳 Random Forest ML Model Visualization
              </h1>
              <p className="text-gray-600">
                Understanding how our TCO prediction model works using Random Forest algorithm trained on 10,000+ real-world scenarios from <strong>Mendeley Data</strong> (electricity prices) and <strong>IEA</strong> (carbon intensity). Model accuracy validated against <strong>BCG (2023)</strong> industry benchmarks.
              </p>
              <p className="text-blue-600 text-xs mt-2">
                📊 Training Data: Mendeley Global Electricity Dataset (DOI: 10.17632/s54n4tyyz4.3) + IEA Grid Carbon Intensity + BCG Cost Validation
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back to Calculator
              </button>
            )}
          </div>

          {/* Model Metrics */}
          {modelMetrics && (
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{modelMetrics.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">{t.mlViz?.accuracy || 'Accuracy'}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{modelMetrics.training_samples.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.mlViz?.trainingSamples || 'Training Samples'}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{modelMetrics.features_used}</div>
                <div className="text-sm text-gray-600">Features Used</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{modelMetrics.trees}</div>
                <div className="text-sm text-gray-600">{t.mlViz?.trees || 'Decision Trees'}</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-600">{modelMetrics.max_depth}</div>
                <div className="text-sm text-gray-600">{t.mlViz?.maxDepth || 'Max Tree Depth'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Importance Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📊 {t.mlViz?.featureImportance || 'Feature Importance Analysis'}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.mlViz?.featureImportanceDesc || 'These features have the biggest impact on TCO predictions (higher = more important)'}
          </p>

          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} label={{ value: 'Importance (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="feature" width={140} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {featureImportance.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.importance > 20 ? '#3B82F6' : // blue
                      entry.importance > 10 ? '#10B981' : // green
                      entry.importance > 5 ? '#F59E0B' : // orange
                      '#9CA3AF' // gray
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* How Random Forest Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔬 {t.mlViz?.howItWorks || 'How the Random Forest Model Works'}
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-blue-900 mb-2">1. Training Phase</h3>
              <p>
                The model was trained on <strong>{modelMetrics?.training_samples.toLocaleString()}+ semiconductor manufacturing scenarios</strong> from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mendeley Data (DOI: 10.17632/s54n4tyyz4.3)</li>
                <li>IEA Grid Carbon Intensity Database</li>
                <li>ENTSO-E energy prices (real-time EU data)</li>
                <li>JRC semiconductor studies (manufacturing data)</li>
                <li>OECD energy statistics (global pricing)</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-green-900 mb-2">2. Ensemble Learning</h3>
              <p>
                Random Forest uses <strong>{modelMetrics?.trees} decision trees</strong> that each make independent predictions. 
                The final prediction is the average of all trees, which reduces overfitting and improves accuracy.
              </p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-purple-900 mb-2">3. Feature Importance</h3>
              <p>
                The model learns which factors matter most for TCO:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Energy consumption</strong> - Largest driver (typically 70-90% of TCO, validated by BCG 2023)</li>
                <li><strong>Regional energy prices</strong> - Varies 10x globally (€0.02 to €0.50/kWh, BCG 2023)</li>
                <li><strong>Carbon intensity & tax</strong> - Significant impact in EU/Asia (IEA, BCG)</li>
                <li><strong>Government subsidies</strong> - Can reduce TCO by 25-50% (BCG 2023)</li>
                <li><strong>Material properties</strong> - Affects both cost and efficiency</li>
              </ul>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-orange-900 mb-2">4. Non-Linear Relationships</h3>
              <p>
                Unlike simple formulas, Random Forest captures complex interactions:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>How subsidies interact with energy costs</li>
                <li>Volume discounts at different scales</li>
                <li>Regional policy combinations (carbon tax + subsidies)</li>
                <li>Material-specific manufacturing efficiency curves</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Model Validation */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ✅ {t.mlViz?.modelValidation || 'Model Validation & Accuracy'}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Cross-Validation Results</h3>
              <p className="text-gray-600">
                The model achieves <strong>{modelMetrics?.accuracy.toFixed(1)}% accuracy</strong> using 5-fold cross-validation 
                on held-out test data, ensuring it generalizes well to new scenarios.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Industry & Real-World Validation</h3>
              <p className="text-gray-600">
                Predictions validated against actual semiconductor manufacturing costs from JRC reports (2023-2025),
                industry benchmarks from TSMC, Intel, Samsung foundries, and cost breakdowns published by BCG (2023).
              </p>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">📚 Technical Documentation</h2>
          <p className="mb-4">
            For detailed mathematical formulas, training methodology, and validation procedures, see:
          </p>
          <button
            onClick={() => onNavigate?.('docs')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Full ML Documentation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomForestVisualization;
