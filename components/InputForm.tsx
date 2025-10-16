
import React, { useState, useEffect } from 'react';
import { TcoInput, Material, Region } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

interface InputFormProps {
  onSubmit: (inputs: TcoInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [inputs, setInputs] = useState<TcoInput>({
    material: '',
    region: '',
    volume: 100000,
    years: 5,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [mats, regs] = await Promise.all([api.getMaterials(), api.getRegions()]);
      setMaterials(mats);
      setRegions(regs);
      if (mats.length > 0) setInputs(prev => ({ ...prev, material: mats[0].id }));
      if (regs.length > 0) setInputs(prev => ({ ...prev, region: regs[0].code }));
    };
    fetchData();
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
            {/* Wide Bandgap */}
            <optgroup label="⚡ Wide Bandgap (Power & RF)">
              {materials.filter(m => ['sic', 'gan', 'gan_on_sic'].includes(m.id)).map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* Advanced Logic */}
            <optgroup label="🔬 Advanced Logic (3nm-7nm)">
              {materials.filter(m => ['si_3nm', 'si_5nm', 'si_7nm'].includes(m.id)).map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* Mature Logic */}
            <optgroup label="💎 Mature Logic (14nm+)">
              {materials.filter(m => ['si_14nm', 'si_28nm'].includes(m.id)).map(m => 
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </optgroup>
            
            {/* Specialty & Compound */}
            <optgroup label="🧪 Specialty & Compound Semiconductors">
              {materials.filter(m => ['gaas', 'inp', 'sige', 'diamond'].includes(m.id)).map(m => 
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
    </div>
  );
};

export default InputForm;
