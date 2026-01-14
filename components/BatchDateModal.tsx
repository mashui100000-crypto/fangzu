import React, { useState } from 'react';

interface BatchDateModalProps {
  count: number;
  onConfirm: (day: string) => void;
  onCancel: () => void;
}

export const BatchDateModal: React.FC<BatchDateModalProps> = ({ count, onConfirm, onCancel }) => {
  const [d, setD] = useState('1');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[100]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">修改 {count} 个房间日期</h3>
        <input 
          autoFocus 
          type="number" 
          value={d} 
          onChange={e => setD(e.target.value)} 
          className="w-full text-4xl font-bold text-center border-b-2 mb-6 outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 bg-gray-100 rounded-lg font-bold">
            取消
          </button>
          <button onClick={() => onConfirm(d)} className="py-3 bg-black text-white rounded-lg font-bold">
            确认
          </button>
        </div>
      </div>
    </div>
  );
};