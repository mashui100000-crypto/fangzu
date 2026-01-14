import React from 'react';
import { Room } from '../types';

interface NewMonthModalProps {
  rooms: Room[];
  onAction: (targetDay: number | 'all') => void;
  onCancel: () => void;
}

export const NewMonthModal: React.FC<NewMonthModalProps> = ({ rooms, onAction, onCancel }) => {
  const dayGroups = rooms.reduce((acc, r) => {
    const d = r.payDay || 1;
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const days = Object.keys(dayGroups).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">开启新月份</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">请选择要结算的批次：</p>
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {days.map(day => (
            <button 
              key={day} 
              onClick={() => onAction(parseInt(day))} 
              className="w-full flex justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 text-left"
            >
              <span className="font-bold text-gray-700">{day}号收租的房间</span>
              <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{dayGroups[parseInt(day)]}间</span>
            </button>
          ))}
          <button 
            onClick={() => onAction('all')} 
            className="w-full p-3 text-sm text-gray-400 font-bold hover:text-gray-600"
          >
            全部结算
          </button>
        </div>
        <button onClick={onCancel} className="w-full py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">
          暂不结算
        </button>
      </div>
    </div>
  );
};