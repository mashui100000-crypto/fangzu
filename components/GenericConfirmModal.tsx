import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface GenericConfirmModalProps {
  title?: string;
  content?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GenericConfirmModal: React.FC<GenericConfirmModalProps> = ({ 
  title, 
  content, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200] animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle size={24}/>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title || '确认'}</h3>
          <p className="text-gray-500 text-sm">{content || '您确定要执行此操作吗？'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">
            取消
          </button>
          <button onClick={onConfirm} className="py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-md">
            确认
          </button>
        </div>
      </div>
    </div>
  );
};