
import React, { useState, useMemo } from 'react';
import { X, Copy, Calendar, ArrowRight } from 'lucide-react';
import { Room } from '../types';

interface BatchBillModalProps {
  rooms: Room[];
  onClose: () => void;
}

export const BatchBillModal: React.FC<BatchBillModalProps> = ({ rooms, onClose }) => {
  // Dates default to empty so user can select without deleting
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getVal = (v: string | number | undefined) => parseFloat(String(v)) || 0;
  
  const dateStr = useMemo(() => {
    if (!startDate || !endDate) return '';
    
    const formatFull = (s: string) => {
        const [y, m, d] = s.split('-');
        return `${y}年${parseInt(m)}月${parseInt(d)}日`;
    };
    
    return `${formatFull(startDate)} 至 ${formatFull(endDate)}`;
  }, [startDate, endDate]);

  const textContent = useMemo(() => {
    return rooms.map(room => {
        const ePrev = getVal(room.elecPrev);
        const eCurr = getVal(room.elecCurr);
        const eUsage = eCurr - ePrev;
        // Fallback to 0 if not set
        const ePrice = getVal(room.fixedElecPrice || 0);
        const eTotal = Math.max(0, eUsage * ePrice);
        
        const wPrev = getVal(room.waterPrev);
        const wCurr = getVal(room.waterCurr);
        const wUsage = wCurr - wPrev;
        // Fallback to 0 if not set
        const wPrice = getVal(room.fixedWaterPrice || 0);
        const wTotal = Math.max(0, wUsage * wPrice);
        
        const xTotal = (room.extraFees || []).reduce((s, i) => s + getVal(i.amount), 0);
        const total = getVal(room.rent) + eTotal + wTotal + xTotal;
        const depositVal = getVal(room.deposit);

        return `【${room.roomNo} 房租】${dateStr}\n` + 
        `🏠 房租：${room.rent}元\n` + 
        (eUsage > 0 || room.elecCurr ? `⚡ 电费：${ePrev}→${eCurr} (${eUsage.toFixed(1)}度) = ${eTotal.toFixed(1)}元\n` : '') + 
        (wUsage > 0 || room.waterCurr ? `💧 水费：${wPrev}→${wCurr} (${wUsage.toFixed(1)}吨) = ${wTotal.toFixed(1)}元\n` : '') + 
        (room.extraFees || []).map(f => getVal(f.amount) > 0 ? `🧾 ${f.name}：${f.amount}元\n` : '').join('') + 
        `💰 总计：${total.toFixed(1)} 元\n` + 
        (depositVal > 0 ? `(已收押金：${depositVal}元)\n` : '') + 
        `----------------\n`;
    }).join('\n');
  }, [rooms, dateStr]);

  const copyAll = () => {
    navigator.clipboard.writeText(textContent).then(() => alert("全部账单已复制"));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">批量账单 ({rooms.length})</h3>
            <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
        </div>
        
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-2">
                <Calendar size={14}/> 批量账单周期 (统一)
            </label>
            <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
                <span className="text-gray-400"><ArrowRight size={14}/></span>
                <input 
                    type="date" 
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
            <textarea 
              className="w-full h-full bg-transparent resize-none outline-none text-xs font-mono text-gray-700 whitespace-pre-wrap" 
              value={textContent} 
              readOnly
            />
        </div>
        
        <button onClick={copyAll} className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 shadow-md flex items-center justify-center gap-2">
            <Copy size={18}/> 一键复制全部
        </button>
      </div>
    </div>
  );
};
