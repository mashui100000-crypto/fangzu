
import React, { useState } from 'react';
import { Room } from '../types';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface NewMonthModalProps {
  rooms: Room[];
  onAction: (targetDay: number | 'all') => void;
  onCancel: () => void;
}

export const NewMonthModal: React.FC<NewMonthModalProps> = ({ rooms, onAction, onCancel }) => {
  const [confirmTarget, setConfirmTarget] = useState<number | 'all' | null>(null);

  const dayGroups = rooms.reduce((acc, r) => {
    const d = r.payDay || 1;
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const days = Object.keys(dayGroups).sort((a, b) => parseInt(a) - parseInt(b));

  const handleInitialClick = (target: number | 'all') => {
    setConfirmTarget(target);
  };

  const getTargetCount = () => {
    if (confirmTarget === 'all') return rooms.length;
    if (typeof confirmTarget === 'number') return dayGroups[confirmTarget] || 0;
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl transition-all">
        
        {!confirmTarget ? (
          /* --- STEP 1: Selection List --- */
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">开启新月份</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">请选择要结算的批次：</p>
            
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {days.map(day => (
                <button 
                  key={day} 
                  onClick={() => handleInitialClick(parseInt(day))} 
                  className="w-full flex justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 text-left transition-colors"
                >
                  <span className="font-bold text-gray-700">{day}号收租的房间</span>
                  <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{dayGroups[parseInt(day)]}间</span>
                </button>
              ))}
              
              {rooms.length > 0 && (
                <button 
                  onClick={() => handleInitialClick('all')} 
                  className="w-full p-3 text-sm text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200"
                >
                  全部结算 ({rooms.length}间)
                </button>
              )}

              {rooms.length === 0 && (
                 <p className="text-center text-sm text-gray-400 py-4">暂无房间数据</p>
              )}
            </div>

            <button onClick={onCancel} className="w-full py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">
              取消
            </button>
          </>
        ) : (
          /* --- STEP 2: Confirmation Warning --- */
          <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 fade-in">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle size={28} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ 确认结算操作?</h3>
            
            <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl text-left w-full space-y-2">
              <p>您即将对 <strong>{getTargetCount()}</strong> 个房间执行结算：</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600 text-xs">
                 <li>当前未结账单将归档到历史记录</li>
                 <li>“本月读数”将自动转为“上月读数”</li>
                 <li>所有支付状态将重置为“未交”</li>
                 <li>操作不可逆，请确保数据无误</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => setConfirmTarget(null)} 
                className="py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16}/> 返回
              </button>
              <button 
                onClick={() => onAction(confirmTarget)} 
                className="py-3 rounded-lg font-bold text-white bg-black hover:bg-gray-800 shadow-lg"
              >
                确认执行
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
