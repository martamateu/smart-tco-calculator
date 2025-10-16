import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-roseRed to-pink-600 bg-clip-text text-transparent mb-4">
            {t.about.title}
          </h1>
        </div>

        {/* Author Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-roseRed to-pink-600 flex items-center justify-center shadow-2xl">
                <span className="text-white text-6xl font-bold">M</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🌹</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.about.author.name}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-2xl">{t.about.author.description}</p>
              
              {/* Global Audience Update */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-blue-700">🌍 {t.about.author.globalAudience.title}</strong> {t.about.author.globalAudience.description}
                </p>
              </div>
              
              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/in/marta-mateu-delgado-a2a9a5209/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-roseRed to-pink-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {t.about.author.linkedin}
              </a>
            </div>
          </div>
        </div>

        {/* Motivation & Problem Statement */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-xl p-10 mb-10 border border-orange-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.about.motivation.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {t.about.motivation.intro} <strong>{t.about.motivation.problem}</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.about.motivation.bcgReference} <a href="https://www.bcg.com/publications/2023/navigating-the-semiconductor-manufacturing-costs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold underline">{t.about.motivation.bcgLinkText}</a>, {t.about.motivation.challenges}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>{t.about.motivation.challenge1}</li>
                <li>{t.about.motivation.challenge2}</li>
                <li>{t.about.motivation.challenge3}</li>
                <li>{t.about.motivation.challenge4}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                {t.about.motivation.solution}
              </p>
            </div>
          </div>
        </div>

        {/* Program Section */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-xl p-10 mb-10 border border-pink-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl">🌹</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.about.program.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{t.about.program.description}</p>
              <a
                href="https://websk.upc.edu/toprosiestalent22/?lang=ca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold text-lg group"
              >
                {t.about.program.link}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Acknowledgments Section */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-10 border border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl">🙏</span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.about.acknowledgments.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{t.about.acknowledgments.text}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <p className="text-gray-800">
                    <span className="font-bold text-blue-600">{t.about.acknowledgments.mentor}:</span>
                    <br />
                    <span className="text-xl font-semibold text-gray-900">Karina Gibert Oliveras</span>
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <p className="text-gray-800">
                    <span className="font-bold text-purple-600">{t.about.acknowledgments.organization}:</span>
                    <br />
                    <span className="text-xl font-semibold text-gray-900">Top Rosies</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-10 mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💻</span>
            </div>
            <h2 className="text-3xl font-bold text-white">{t.about.tech.title}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Frontend */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
                <span>🎨</span>
                {t.about.tech.frontend}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>React + TypeScript</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Vite</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Recharts</span>
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span>⚡</span>
                {t.about.tech.backend}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Python + FastAPI</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Google Cloud Run</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Vertex AI (Gemini)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>LangChain + RAG</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center bg-gradient-to-r from-roseRed to-pink-600 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">✨</span>
            <p className="text-white text-xl font-bold">{t.about.footer.message}</p>
            <span className="text-4xl">✨</span>
          </div>
          <p className="text-white text-lg opacity-90">{t.about.footer.contact}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
