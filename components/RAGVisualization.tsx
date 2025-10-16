// components/RAGVisualization.tsx
import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// Use production backend URL or localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://smart-tco-backend-859997094469.europe-west1.run.app/api'
  : 'http://localhost:8000/api';

type Page = 'home' | 'docs' | 'about' | 'citations' | 'dashboard-outlook' | 'dashboard-energy-comparison' | 'dashboard-energy-prices' | 'dashboard-ml-model' | 'dashboard-rag-system';

interface RAGVisualizationProps {
  onNavigate?: (page: Page) => void;
}

interface EmbeddingPoint {
  x: number;
  y: number;
  z: number;
  document: string;
  category: string;
  snippet: string;
}

interface RetrievalExample {
  query: string;
  top_documents: Array<{
    document: string;
    score: number;
    snippet: string;
  }>;
}

interface RAGStats {
  total_documents: number;
  total_chunks: number;
  embedding_dimension: number;
  model_name: string;
  index_type: string;
}

const RAGVisualization: React.FC<RAGVisualizationProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [embeddingData, setEmbeddingData] = useState<EmbeddingPoint[]>([]);
  const [retrievalExample, setRetrievalExample] = useState<RetrievalExample | null>(null);
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState('energy prices EU');
  
  const exampleQueries = [
    'energy prices EU',
    'semiconductor subsidies',
    'carbon footprint',
    'semiconductor materials',
    'EU regulations'
  ];

  useEffect(() => {
    const fetchRAGData = async () => {
      try {
        setLoading(true);
        
        // Fetch embedding visualization data
        const embeddingResponse = await fetch(`${API_BASE_URL}/rag/embeddings-viz`);
        if (!embeddingResponse.ok) throw new Error('Failed to fetch RAG embeddings');
        const embeddingData = await embeddingResponse.json();
        
        // Fetch retrieval example
        const retrievalResponse = await fetch(`${API_BASE_URL}/rag/retrieval-demo?query=${encodeURIComponent(selectedQuery)}`);
        if (!retrievalResponse.ok) throw new Error('Failed to fetch retrieval example');
        const retrievalData = await retrievalResponse.json();
        
        // Fetch RAG statistics
        const statsResponse = await fetch(`${API_BASE_URL}/rag/stats`);
        if (!statsResponse.ok) throw new Error('Failed to fetch RAG stats');
        const statsData = await statsResponse.json();
        
        setEmbeddingData(embeddingData.embeddings);
        setRetrievalExample(retrievalData);
        setRagStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching RAG visualization data:', err);
        setError(t.ragViz?.error || 'Error loading RAG system visualization. RAG system processes EU Chips Act, JRC reports, Mendeley datasets, and IEA data to provide context-aware answers.');
        setLoading(false);
      }
    };

    fetchRAGData();
  }, [selectedQuery, t]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Energy Prices': '#3B82F6',
      'Subsidies': '#10B981',
      'Materials': '#F59E0B',
      'Regulations': '#8B5CF6',
      'Carbon': '#EF4444',
      'Other': '#6B7280'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading RAG System processing EU Chips Act, JRC reports, Mendeley & IEA datasets...</div>
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
                🧠 RAG System Visualization Dashboard
              </h1>
              <p className="text-gray-600">
                Retrieval-Augmented Generation system that processes <strong>15+ official EU documents</strong> (EU Chips Act, JRC semiconductor reports), <strong>Mendeley datasets</strong>, <strong>IEA carbon data</strong>, and industry PDFs to provide context-aware explanations. Uses semantic embeddings to retrieve the most relevant information for each query, ensuring explanations are grounded in authoritative sources validated by <strong>BCG (2023)</strong>.
              </p>
              <p className="text-blue-600 text-xs mt-2">
                📊 Document Sources: EU Chips Act Regulation 2023 | JRC Semiconductor Studies | Mendeley Global Electricity Data | IEA Grid Carbon Intensity | BP Energy Outlook
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

          {/* RAG Statistics */}
          {ragStats && (
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{ragStats.total_documents}</div>
                <div className="text-sm text-gray-600">{t.ragViz?.totalDocuments || 'Documents'}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{ragStats.total_chunks.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.ragViz?.totalChunks || 'Text Chunks'}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{ragStats.embedding_dimension}</div>
                <div className="text-sm text-gray-600">{t.ragViz?.embeddingDimension || 'Embedding Dim'}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{ragStats.model_name.split('/').pop()}</div>
                <div className="text-sm text-gray-600">{t.ragViz?.modelName || 'Model'}</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-600">{ragStats.index_type}</div>
                <div className="text-sm text-gray-600">{t.ragViz?.indexType || 'Index Type'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Document Embedding Space */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🗺️ {t.ragViz?.embeddingSpace || 'Document Embedding Space (t-SNE Projection)'}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.ragViz?.embeddingSpaceDesc || 'Each point represents a document chunk in 2D semantic space. Similar documents cluster together.'}
          </p>

          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Dimension 1" domain={['dataMin - 1', 'dataMax + 1']} />
              <YAxis type="number" dataKey="y" name="Dimension 2" domain={['dataMin - 1', 'dataMax + 1']} />
              <ZAxis type="number" dataKey="z" range={[50, 500]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EmbeddingPoint;
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
                        <p className="font-bold text-gray-800 mb-1">{data.category}</p>
                        <p className="text-sm text-gray-600 mb-2">{data.document}</p>
                        <p className="text-xs text-gray-500 italic">"{data.snippet}..."</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {Object.entries(
                embeddingData.reduce((acc, point) => {
                  if (!acc[point.category]) acc[point.category] = [];
                  acc[point.category].push(point);
                  return acc;
                }, {} as Record<string, EmbeddingPoint[]>)
              ).map(([category, points]) => (
                <Scatter
                  key={category}
                  name={category}
                  data={points}
                  fill={getCategoryColor(category)}
                  fillOpacity={0.6}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {Object.keys(embeddingData.reduce((acc, point) => {
              acc[point.category] = true;
              return acc;
            }, {} as Record<string, boolean>)).map(category => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-sm text-gray-700">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retrieval Demo */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔍 {t.ragViz?.retrievalDemo || 'Document Retrieval Demo'}
          </h2>
          <p className="text-gray-600 mb-4">
            {t.ragViz?.retrievalDemoDesc || 'See how the RAG system finds relevant documents for different queries'}
          </p>

          {/* Query Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.ragViz?.selectQuery || 'Test Query:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map(query => (
                <button
                  key={query}
                  onClick={() => setSelectedQuery(query)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedQuery === query
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Retrieved Documents */}
          {retrievalExample && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-600 mb-1">Query:</p>
                <p className="font-semibold text-gray-800">"{retrievalExample.query}"</p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-gray-800">{t.ragViz?.topDocuments || 'Top Retrieved Documents'}:</p>
                {retrievalExample.top_documents.map((doc, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border-l-4 ${
                      idx === 0 ? 'bg-green-50 border-green-500' :
                      idx === 1 ? 'bg-yellow-50 border-yellow-500' :
                      'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          idx === 0 ? 'text-green-600' :
                          idx === 1 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800">{doc.document}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        doc.score > 0.8 ? 'bg-green-100 text-green-800' :
                        doc.score > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(doc.score * 100).toFixed(1)}% {t.ragViz?.score || 'match'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{doc.snippet}..."</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* How RAG Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔬 How RAG (Retrieval-Augmented Generation) Works
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-blue-900 mb-2">1. Document Indexing</h3>
              <p>
                <strong>{ragStats?.total_documents} PDF documents</strong> (EU regulations, JRC studies, ENTSO-E reports) 
                are split into <strong>{ragStats?.total_chunks.toLocaleString()} chunks</strong> for efficient retrieval.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-green-900 mb-2">2. Embedding Generation</h3>
              <p>
                Each chunk is converted to a <strong>{ragStats?.embedding_dimension}-dimensional vector</strong> using 
                the <strong>{ragStats?.model_name}</strong> sentence transformer model.
              </p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-purple-900 mb-2">3. Semantic Search</h3>
              <p>
                When you request an explanation, your query is embedded and compared to all document chunks using 
                cosine similarity. The <strong>top-k most relevant chunks</strong> are retrieved from the {ragStats?.index_type} index.
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-orange-900 mb-2">4. Context-Aware Response</h3>
              <p>
                Retrieved documents provide factual context to generate accurate explanations about:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Regional energy prices and trends</li>
                <li>Government subsidy programs (EU Chips Act, USA CHIPS Act, etc.)</li>
                <li>Carbon footprint regulations</li>
                <li>Semiconductor manufacturing data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📚 Knowledge Base Sources
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Energy Data</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ENTSO-E Transparency Platform</li>
                <li>• OECD Energy Statistics</li>
                <li>• IEA Global Energy Review 2025</li>
                <li>• BP Energy Outlook 2025</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">💰 Subsidy Programs</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• EU Chips Act Regulation 2023</li>
                <li>• USA CHIPS and Science Act</li>
                <li>• JRC Semiconductor Policy Studies</li>
                <li>• National funding announcements</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🏭 Manufacturing Data</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• JRC Technical Reports (2023-2025)</li>
                <li>• Materials Project API</li>
                <li>• Industry benchmarks (TSMC, Intel)</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">🌍 Regulations</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• EU Carbon Market Reports</li>
                <li>• Semiconductor export controls</li>
                <li>• Regional compliance documents</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">📚 Technical Documentation</h2>
          <p className="mb-4">
            For detailed RAG architecture, embedding models, and retrieval algorithms, see:
          </p>
          <button
            onClick={() => onNavigate?.('docs')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            View Full RAG Documentation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RAGVisualization;
