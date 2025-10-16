import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DocsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-roseRed to-pink-600 bg-clip-text text-transparent mb-4">
            {t.docs.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.docs.subtitle}</p>
        </div>

        {/* What is TCO Section - NEW */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💰</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.whatIsTCO.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-purple-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{t.docs.whatIsTCO.definition}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.whatIsTCO.importance}</p>
          </div>

          {/* TCO Components */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💎</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.whatIsTCO.components.chips}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.whatIsTCO.components.chipsDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.whatIsTCO.components.energy}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.whatIsTCO.components.energyDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌱</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.whatIsTCO.components.carbon}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.whatIsTCO.components.carbonDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎁</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.whatIsTCO.components.subsidies}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.whatIsTCO.components.subsidiesDesc}</p>
            </div>
          </div>
        </section>

        {/* AI Chat Assistant Section - NEW */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💬</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.chatAssistant.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-cyan-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{t.docs.chatAssistant.description}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.chatAssistant.benefits}</p>
          </div>

          {/* Chat Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cyan-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.chatAssistant.features.aiPowered}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.chatAssistant.features.aiPoweredDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌐</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.chatAssistant.features.multilingual}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.chatAssistant.features.multilingualDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.chatAssistant.features.contextual}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.chatAssistant.features.contextualDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.chatAssistant.features.insights}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.chatAssistant.features.insightsDesc}</p>
            </div>
          </div>
        </section>

        {/* Consumer Guide Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-roseRed to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.consumer.title}</h2>
          </div>
          
          <div className="grid gap-8">
            {/* Target Audience Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-roseRed hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👥</span>
                <h3 className="text-2xl font-bold text-gray-800">{t.docs.consumer.targetTitle}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.targetContent}</p>
            </div>

            {/* Purpose Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💡</span>
                <h3 className="text-2xl font-bold text-gray-800">{t.docs.consumer.purposeTitle}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.purposeContent}</p>
            </div>

            {/* Key Objectives Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🎯</span>
                <h3 className="text-2xl font-bold text-gray-800">{t.docs.consumer.objectivesTitle}</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.objective1}</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.objective2}</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.objective3}</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed text-lg">{t.docs.consumer.objective4}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🧩</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">{t.docs.components.title}</h2>
              <p className="text-gray-600 mt-1">{t.docs.components.subtitle}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Component 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-roseRed hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📝</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.components.input.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.components.input.content}</p>
            </div>

            {/* Component 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧮</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.components.calculator.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.components.calculator.content}</p>
            </div>

            {/* Component 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.components.ai.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.components.ai.content}</p>
            </div>

            {/* Component 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.components.scenarios.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.components.scenarios.content}</p>
            </div>

            {/* Component 5 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.components.breakdown.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.components.breakdown.content}</p>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.dataSources.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-emerald-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.dataSources.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🇪🇺</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.dataSources.sources.jrc}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.dataSources.sources.jrcDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.dataSources.sources.oecd}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.dataSources.sources.oecdDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎁</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.dataSources.sources.euChips}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.dataSources.sources.euChipsDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.dataSources.sources.industry}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.dataSources.sources.industryDesc}</p>
            </div>
          </div>
        </section>

        {/* Random Forest Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌳</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.randomForest.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{t.docs.randomForest.description}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.randomForest.benefits}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.randomForest.features.accuracy}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.randomForest.features.accuracyDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.randomForest.features.features}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.randomForest.features.featuresDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔄</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.randomForest.features.training}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.randomForest.features.trainingDesc}</p>
            </div>
          </div>
        </section>

        {/* RAG Engine Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.ragEngine.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-orange-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{t.docs.ragEngine.description}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.ragEngine.benefits}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.ragEngine.features.vectorSearch}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.ragEngine.features.vectorSearchDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.ragEngine.features.contextual}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.ragEngine.features.contextualDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📖</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.ragEngine.features.knowledge}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.ragEngine.features.knowledgeDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-rose-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.ragEngine.features.realtime}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.ragEngine.features.realtimeDesc}</p>
            </div>
          </div>
        </section>

        {/* Gemini AI Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.geminiAI.title}</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-violet-500 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{t.docs.geminiAI.description}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.geminiAI.benefits}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-violet-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧠</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.geminiAI.features.advanced}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.geminiAI.features.advancedDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.geminiAI.features.conversational}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.geminiAI.features.conversationalDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-fuchsia-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌍</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.geminiAI.features.multilingual}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.geminiAI.features.multilingualDesc}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎨</span>
                <h3 className="text-xl font-bold text-gray-800">{t.docs.geminiAI.features.markdown}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{t.docs.geminiAI.features.markdownDesc}</p>
            </div>
          </div>
        </section>

        {/* Technical Architecture Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">⚙️</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{t.docs.technical.title}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Frontend */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-roseRed mb-4">{t.docs.technical.frontend.title}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-roseRed mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.frontend.react}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-roseRed mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.frontend.typescript}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-roseRed mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.frontend.vite}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-roseRed mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.frontend.tailwind}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-roseRed mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.frontend.recharts}</span>
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">{t.docs.technical.backend.title}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.backend.fastapi}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.backend.uvicorn}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.backend.pydantic}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.backend.structure}</span>
                </li>
              </ul>
            </div>

            {/* AI/ML */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-green-600 mb-4">{t.docs.technical.ai.title}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.ai.gemini}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.ai.transformers}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.ai.faiss}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.ai.rag}</span>
                </li>
              </ul>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">{t.docs.technical.data.title}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.data.jrc}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.data.oecd}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.data.materials}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">▸</span>
                  <span className="text-gray-700">{t.docs.technical.data.mock}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6">{t.docs.technical.api.title}</h3>
            <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold">GET</span>
                <span className="text-gray-300">{t.docs.technical.api.health}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold">GET</span>
                <span className="text-gray-300">{t.docs.technical.api.materials}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold">GET</span>
                <span className="text-gray-300">{t.docs.technical.api.regions}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold">GET</span>
                <span className="text-gray-300">{t.docs.technical.api.scenarios}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500 text-white rounded font-bold">POST</span>
                <span className="text-gray-300">{t.docs.technical.api.predict}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500 text-white rounded font-bold">POST</span>
                <span className="text-gray-300">{t.docs.technical.api.explain}</span>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold">GET</span>
                <span className="text-gray-300">{t.docs.technical.api.docs}</span>
              </div>
            </div>
          </div>

          {/* Deployment */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.docs.technical.deployment.title}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{t.docs.technical.deployment.content}</p>
          </div>
        </section>

        {/* API Link Footer */}
        <div className="mt-12 p-8 bg-gradient-to-r from-roseRed to-pink-600 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📚</span>
              <p className="text-white font-semibold text-lg">{t.docs.apiLink}</p>
            </div>
            <a 
              href="https://www.postman.com/" 
              className="px-6 py-3 bg-white text-roseRed rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Postman →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
