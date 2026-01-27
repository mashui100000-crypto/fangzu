
import React, { useState } from 'react';
import { BatchSettingsData } from '../types';

interface BatchEditModalProps {
  count: number;
  onConfirm: (data: BatchSettingsData) => void;
  onCancel: () => void;
}

export const BatchEditModal: React.FC<BatchEditModalProps> = ({ count, onConfirm, onCancel }) => {
  const [data, setData] = useState<BatchSettingsData>({
    payDay: '',
    rent: '',
    fixedElecPrice: '',
    fixedWaterPrice: ''
  });

  const hasChanges = Object.values(data).some(v => v !== '');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[100] animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">批量修改 ({count}个房间)</h3>
        <p className="text-xs text-gray-400 mb-4">仅填写需要修改的项目，留空则保持原样。</p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">收租日 (号)</label>
            <input 
              type="number" 
              placeholder="保持不变"
              value={data.payDay} 
              onChange={e => setData({...data, payDay: e.target.value})} 
              className="w-full text-sm font-bold border-b-2 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">租金 (元)</label>
            <input 
              type="number" 
              placeholder="保持不变"
              value={data.rent} 
              onChange={e => setData({...data, rent: e.target.value})} 
              className="w-full text-sm font-bold border-b-2 py-2 outline-none"
            />
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">电费单价</label>
                <input 
                  type="number" 
                  placeholder="保持不变"
                  value={data.fixedElecPrice} 
                  onChange={e => setData({...data, fixedElecPrice: e.target.value})} 
                  className="w-full text-sm font-bold border-b-2 py-2 outline-none"
                />
             </div>
             <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">水费单价</label>
                <input 
                  type="number" 
                  placeholder="保持不变"
                  value={data.fixedWaterPrice} 
                  onChange={e => setData({...data, fixedWaterPrice: e.target.value})} 
                  className="w-full text-sm font-bold border-b-2 py-2 outline-none"
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 bg-gray-100 rounded-lg font-bold">
            取消
          </button>
          <button 
            onClick={() => onConfirm(data)} 
            disabled={!hasChanges}
            className="py-3 bg-black text-white rounded-lg font-bold disabled:opacity-50"
          >
            确认修改
          </button>
        </div>
      </div>
    </div>
  );
};
