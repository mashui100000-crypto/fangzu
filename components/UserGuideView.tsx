import React from 'react';
import { X } from 'lucide-react';

interface UserGuideViewProps {
  onClose: () => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-[200] overflow-y-auto p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-black">新手指南</h2>
        <button onClick={onClose}><X/></button>
      </div>
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-blue-800">👋 欢迎使用</h3>
          <p className="text-sm text-blue-600 mt-1">这是最稳定的 v25 版本。</p>
        </div>
        <div>
          <h4 className="font-bold">1. 批量建房</h4>
          <p className="text-sm text-gray-500">点击右下角+号，切换到【批量生成】，支持预览微调。</p>
        </div>
        <div>
          <h4 className="font-bold">2. 图片账单</h4>
          <p className="text-sm text-gray-500">在账单预览中切换【正式图片】，可长按保存。</p>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">
          开始使用
        </button>
      </div>
    </div>
  );
};