import React from 'react';
import { X } from 'lucide-react';
import { HistoryItem } from '../types';
import { formatTime } from '../utils';

interface HistoryModalProps {
  archives: HistoryItem[];
  onRestore: (index: number) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ archives, onRestore, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]">
      <div className="bg-white w-full sm:w-[400px] h-[60vh] rounded-t-2xl sm:rounded-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between">
          <h3 className="font-bold">历史记录</h3>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {archives.map((item, i) => (
            <div key={i} className="p-3 border rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{item.desc}</p>
                <p className="text-xs text-gray-400">{formatTime(item.time)}</p>
              </div>
              {i !== 0 && (
                <button 
                  onClick={() => onRestore(i)} 
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold"
                >
                  恢复
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};