import React from 'react';
import { X, Plus, RotateCcw, Cloud } from 'lucide-react';

interface UserGuideViewProps {
  onClose: () => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-[200] overflow-y-auto animate-in slide-in-from-bottom-4">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-black text-gray-900">新手指南</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={24} className="text-gray-500"/></button>
        </div>

        <div className="p-6 space-y-8 pb-20">
          
          {/* Intro */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-800 text-lg mb-2">👋 欢迎使用房租管家</h3>
            <p className="text-sm text-blue-600 leading-relaxed">
              这是一款专为房东设计的管理工具。没有任何广告，支持离线使用，数据自动保存。
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">建立房源档案</h4>
                <p className="text-sm text-gray-500 mb-3">
                  点击右下角的 <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-[10px]"><Plus size={12}/></span> 按钮。
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-100">
                  <strong>💡 小技巧：</strong> 如果您有整栋楼，请在添加页面顶部切换到“批量生成”，可以一次性生成几十个房间。
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">录入租客与读数</h4>
                <p className="text-sm text-gray-500 mb-2">
                  点击任意房间卡片进入详情页。
                </p>
                <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                  <li>输入租客姓名和电话。</li>
                  <li>填写 <span className="text-blue-600 font-bold">本月电表/水表读数</span>，系统会自动减去上月读数计算费用。</li>
                  <li>可以添加“卫生费”或“宽带费”等额外项目。</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">生成账单与收款</h4>
                <p className="text-sm text-gray-500 mb-2">
                  费用核对无误后：
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-200 text-gray-700 px-1.5 rounded text-xs font-bold mt-0.5">账单</span>
                    <span>点击底部的“生成账单”，可以保存为图片发给租客。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-black text-white px-1.5 rounded text-xs font-bold mt-0.5">收款</span>
                    <span>收到钱后，点击“确认收款”，房间状态会变为已收（绿色）。</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">下个月怎么办？</h4>
                <p className="text-sm text-gray-500 mb-3">
                  当新的月份开始时，点击首页顶部的 <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs font-bold"><RotateCcw size={10}/> 结算</span> 按钮。
                </p>
                <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800 border border-orange-100">
                  <strong>⚠️ 重要：</strong> “结算”操作会将当前的“本月读数”自动转为“上月读数”，并清空本月读数，重置支付状态，为您准备好录入新数据。
                </div>
              </div>
            </div>

             {/* Step 5 */}
             <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">防止数据丢失</h4>
                <p className="text-sm text-gray-500">
                  默认数据只保存在您的手机里。为了防止手机丢失导致数据丢失，请务必点击首页顶部的 <span className="inline-flex items-center gap-1 bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-xs font-bold"><Cloud size={10}/> 云同步</span> 注册一个账号。
                </p>
              </div>
            </div>

          </div>

          <button onClick={onClose} className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-xl hover:bg-gray-800 transition-all active:scale-[0.98]">
            我学会了，开始使用
          </button>
        </div>
      </div>
    </div>
  );
};