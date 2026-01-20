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
          <p className="text-sm text-blue-600 mt-1">这是一款专业的房租管理工具，支持云端数据同步。</p>
        </div>
        
        <div>
          <h4 className="font-bold">1. 数据存在哪里？</h4>
          <p className="text-sm text-gray-500">默认情况下数据保存在本地。点击顶部的云朵图标☁️，<strong className="text-gray-800">注册登录账号</strong>后，数据将自动同步到云端服务器，防止丢失。</p>
        </div>

        <div>
          <h4 className="font-bold">2. 跨设备使用</h4>
          <p className="text-sm text-gray-500">只需在另一台设备（手机或电脑）上登录相同的账号，您的房源和账单数据就会自动同步。</p>
        </div>

        <div>
          <h4 className="font-bold">3. 批量建房</h4>
          <p className="text-sm text-gray-500">点击右下角+号，切换到【批量生成】，支持预览微调，快速建立房源档案。</p>
        </div>
        
        <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">
          开始使用
        </button>
      </div>
    </div>
  );
};