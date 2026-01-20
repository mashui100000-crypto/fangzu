import React from 'react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, setConfig, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">全局设置</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400">电费(元/度)</label>
            <input 
              type="number" 
              className="w-full border-b py-2 outline-none font-bold text-lg" 
              value={config.elecPrice} 
              onChange={e => setConfig({ ...config, elecPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400">水费(元/吨)</label>
            <input 
              type="number" 
              className="w-full border-b py-2 outline-none font-bold text-lg" 
              value={config.waterPrice} 
              onChange={e => setConfig({ ...config, waterPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400">默认房租</label>
            <input 
              type="number" 
              className="w-full border-b py-2 outline-none font-bold text-lg" 
              value={config.defaultRent} 
              onChange={e => setConfig({ ...config, defaultRent: e.target.value })}
            />
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 py-3 bg-black text-white rounded-lg font-bold shadow-lg">
          保存并关闭
        </button>
      </div>
    </div>
  );
};