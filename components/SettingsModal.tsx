
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
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
             <p className="text-xs text-blue-700 font-bold mb-1">ℹ️ 温馨提示</p>
             <p className="text-xs text-blue-600">为了防止误操作，电费和水费单价现在已改为在每个房间内单独设置。</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400">默认房租模板 (元)</label>
            <input 
              type="number" 
              className="w-full border-b py-2 outline-none font-bold text-lg" 
              value={config.defaultRent} 
              onChange={e => setConfig({ ...config, defaultRent: e.target.value })}
              placeholder="1000"
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
