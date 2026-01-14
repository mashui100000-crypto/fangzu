import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Room, BillRecord } from '../types';

interface BillHistoryModalProps {
  room: Room;
  onSelect: (record: BillRecord) => void;
  onClose: () => void;
}

export const BillHistoryModal: React.FC<BillHistoryModalProps> = ({ room, onSelect, onClose }) => {
  const history = room.billHistory || [];
  // Sort descending by date (newest first)
  const sorted = [...history].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl h-[60vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
            <div>
                <h3 className="font-bold text-lg text-gray-900">历史账单</h3>
                <p className="text-xs text-gray-400">{room.roomNo}</p>
            </div>
            <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p className="text-sm">暂无历史记录</p>
                    <p className="text-xs mt-1">结算新月份后会显示在这里</p>
                </div>
            ) : sorted.map(h => (
                <button key={h.id} onClick={() => onSelect(h)} className="w-full bg-gray-50 p-4 rounded-xl flex justify-between items-center hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group">
                    <div className="text-left">
                        <div className="font-bold text-gray-800 text-sm">{h.startDate} <span className="text-gray-300 mx-1">→</span> {h.endDate}</div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-2">
                             <span>总计: <span className="text-gray-900 font-bold">¥{h.total.toFixed(1)}</span></span>
                             {h.tenantName && <span>| {h.tenantName}</span>}
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400"/>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};