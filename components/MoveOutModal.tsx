import React from 'react';
import { Room, AppConfig } from '../types';

interface MoveOutModalProps {
  room: Room;
  config: AppConfig;
  onConfirm: (id: string, returnDeposit: boolean) => void;
  onCancel: () => void;
}

export const MoveOutModal: React.FC<MoveOutModalProps> = ({ room, config, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">办理退租: {room.roomNo}</h3>
        <p className="text-gray-500 text-sm mb-6">
          您需要决定如何处理该房间的押金 ({room.deposit || 0}元)。
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => onConfirm(room.id, true)} 
            className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            退还押金 (清零)
          </button>
          <button 
            onClick={() => onConfirm(room.id, false)} 
            className="w-full py-3 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            保留押金 (不退)
          </button>
          <button 
            onClick={onCancel} 
            className="w-full py-2 text-sm text-gray-400 font-bold mt-2"
          >
            取消操作
          </button>
        </div>
      </div>
    </div>
  );
};