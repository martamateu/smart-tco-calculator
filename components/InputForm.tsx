
import React, { useState, useEffect, useRef } from 'react';
import { TcoInput, Material, Region } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import ChatSection from './ChatSection';

interface InputFormProps {
  onSubmit: (inputs: TcoInput) => void;
  isLoading: boolean;
  tcoResult?: any;
  tcoInput?: TcoInput;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, tcoResult, tcoInput }) => {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  const [inputs, setInputs] = useState<TcoInput>({
    material: '',
    region: '',
    volume: 100000,
    years: 5,
  });

  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchDataWithRetry = async (attempt: number = 1, maxAttempts: number = 3): Promise<void> => {
      if (!isMountedRef.current) return;
      
      try {
        setIsLoadingData(true);
        setLoadError(null);
        setRetryCount(attempt);
        
        // Fetch data with timeout and retry logic
        const [mats, regs] = await Promise.all([
          api.getMaterials(),
          api.getRegions()
        ]);
        
        // Check if component is still mounted before setting state
        if (!isMountedRef.current) return;
        
        // Validate data
        if (!mats || mats.length === 0) {
          throw new Error('No materials data received');
        }
        if (!regs || regs.length === 0) {
          throw new Error('No regions data received');
        }
        
        // Set data and default values
        setMaterials(mats);
        setRegions(regs);
        setInputs(prev => ({
          ...prev,
          material: mats[0]?.id || '',
          region: regs[0]?.code || ''
        }));
        setIsLoadingData(false);
        setLoadError(null);
        
      } catch (error) {
        console.error(`Error loading data (attempt ${attempt}/${maxAttempts}):`, error);
        
        if (!isMountedRef.current) return;
        
        // Retry if we haven't exceeded max attempts
        if (attempt < maxAttempts) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
          setTimeout(() => {
            fetchDataWithRetry(attempt + 1, maxAttempts);
          }, attempt * 1000); // Exponential backoff: 1s, 2s, 3s
        } else {
          setIsLoadingData(false);
          setLoadError(error instanceof Error ? error.message : 'Failed to load data. Please refresh the page.');
        }
      }
    };
    
    fetchDataWithRetry();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'volume' || name === 'years' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  // Manual retry function
  const handleRetry = () => {
    setIsLoadingData(true);
    setLoadError(null);
    setRetryCount(0);
    window.location.reload();
  };

  if (isLoadingData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col justify-center items-center">
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.home.title}</h2>
          <p className="text-gray-600 mb-8 text-sm">{t.home.subtitle}</p>
          
          <div className="space-y-6">
            {/* Material Skeleton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.home.selectMaterial}
              </label>
              <div className="relative">
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Region Skeleton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.home.selectRegion}
              </label>
              <div className="relative">
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Volume Skeleton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.home.volume}
              </label>
              <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse mt-2"></div>
            </div>

            {/* Years Skeleton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.home.years}
              </label>
              <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse mt-2"></div>
            </div>

            {/* Button Skeleton */}
            <div className="pt-2">
              <div className="h-11 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Loading Text with retry count */}
          <div className="flex items-center justify-center mt-8 gap-2">
            <svg className="animate-spin h-5 w-5 text-roseRed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 text-sm font-medium">
              Loading materials and regions...
              {retryCount > 1 && <span className="text-xs ml-2">(attempt {retryCount}/3)</span>}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (loadError) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col justify-center items-center">
        <div className="w-full text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Failed to Load Data</h3>
          <p className="text-gray-600 mb-6 text-sm">{loadError}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-roseRed text-white rounded-xl hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
          <p className="text-xs text-gray-500 mt-4">
            If the problem persists, please check your internet connection or try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.home.title}</h2>
      <p className="text-gray-600 mb-6 text-sm">{t.home.subtitle}</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-gray-700">
            {t.home.selectMaterial}
          </label>
          <select
            id="material"
            name="material"
            value={inputs.material}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-roseRed focus:border-roseRed sm:text-sm rounded-md"
          >
            {/* Traditional Semiconductors */}
            <optgroup label="💎 Traditional Semiconductor">
              {materials.filter(m => m.category === 'Traditional Semiconductor').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* Wide-bandgap */}
            <optgroup label="⚡ Wide-bandgap Semiconductor">
              {materials.filter(m => m.category === 'Wide-bandgap Semiconductor').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* Ultra-wide Bandgap */}
            <optgroup label="� Ultra-wide Bandgap">
              {materials.filter(m => m.category === 'Ultra-wide Bandgap').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* III-V Compounds */}
            <optgroup label="🧪 III-V Compound">
              {materials.filter(m => m.category === 'III-V Compound').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* III-Nitride Wide-bandgap */}
            <optgroup label="⚡ III-Nitride Wide-bandgap">
              {materials.filter(m => m.category === 'III-Nitride Wide-bandgap').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* II-VI Compounds */}
            <optgroup label="🔬 II-VI Compound">
              {materials.filter(m => m.category === 'II-VI Compound').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* 2D Materials */}
            <optgroup label="📐 2D Transition Metal Dichalcogenide">
              {materials.filter(m => m.category === '2D Transition Metal Dichalcogenide').map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            {t.home.selectRegion}
          </label>
          <select
            id="region"
            name="region"
            value={inputs.region}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-roseRed focus:border-roseRed sm:text-sm rounded-md"
          >
            {/* Europe */}
            <optgroup label="🇪🇺 Europe">
              {regions.filter(r => ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Austria', 'Czech Republic', 'Denmark', 'Finland', 'Greece', 'Hungary', 'Ireland', 'Portugal', 'Romania', 'Sweden', 'Slovakia', 'Slovenia'].includes(r.code)).map(r => 
                <option key={r.code} value={r.code}>{r.name}</option>
              )}
            </optgroup>
            
            {/* North America */}
            <optgroup label="🇺🇸 North America">
              {regions.filter(r => ['California', 'Texas', 'Arizona', 'Ohio', 'New York'].includes(r.code)).map(r => 
                <option key={r.code} value={r.code}>{r.name}</option>
              )}
            </optgroup>
            
            {/* Asia-Pacific */}
            <optgroup label="🌏 Asia-Pacific">
              {regions.filter(r => ['Taiwan', 'South Korea', 'Japan', 'China', 'Singapore', 'India', 'Australia'].includes(r.code)).map(r => 
                <option key={r.code} value={r.code}>{r.name}</option>
              )}
            </optgroup>
            
            {/* Latin America */}
            <optgroup label="🌎 Latin America">
              {regions.filter(r => ['Brazil', 'Chile', 'Mexico'].includes(r.code)).map(r => 
                <option key={r.code} value={r.code}>{r.name}</option>
              )}
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
            {t.home.volume} <span className="text-roseRed font-semibold">{inputs.volume.toLocaleString()}</span>
          </label>
          <input
            type="range"
            id="volume"
            name="volume"
            min="10000"
            max="500000"
            step="10000"
            value={inputs.volume}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-roseRed"
          />
        </div>

        <div>
          <label htmlFor="years" className="block text-sm font-medium text-gray-700">
            {t.home.years} <span className="text-roseRed font-semibold">{inputs.years}</span>
          </label>
          <input
            type="range"
            id="years"
            name="years"
            min="1"
            max="10"
            step="1"
            value={inputs.years}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-roseRed"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-roseRed hover:bg-roseRed-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-roseRed disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : t.home.calculate}
        </button>
      </form>

      {/* Separator */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Integrated ChatSection */}
      <div className="mt-6">
        <ChatSection 
          tcoResult={tcoResult}
          tcoInput={tcoInput}
        />
      </div>
    </div>
  );
};

export default InputForm;
