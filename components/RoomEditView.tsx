
import React, { useEffect } from 'react';
import { ArrowLeft, Trash2, Zap, Droplets, LogOut, X, Calendar, User, Phone, History, CreditCard } from 'lucide-react';
import { Room, AppConfig, ActionHandlers, ModalState } from '../types';

interface RoomEditViewProps {
  room: Room | undefined;
  config: AppConfig;
  actions: ActionHandlers;
  onBack: () => void;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  confirmAction: (title: string, content: string, action: () => void) => void;
}

export const RoomEditView: React.FC<RoomEditViewProps> = ({ 
  room, 
  config, 
  actions, 
  onBack, 
  setModal, 
  confirmAction 
}) => {
  if (!room) { 
    setTimeout(onBack, 0); 
    return null; 
  }

  const getVal = (v: any) => parseFloat(v) || 0;
  // Requirement 2: Utility prices are now per-room only. Default to 0 if not set.
  const elecPrice = room.fixedElecPrice || '0';
  const waterPrice = room.fixedWaterPrice || '0';
  
  const elecUsage = getVal(room.elecCurr) - getVal(room.elecPrev);
  const elecTotal = Math.max(0, elecUsage * getVal(elecPrice));
  const waterUsage = getVal(room.waterCurr) - getVal(room.waterPrev);
  const waterTotal = Math.max(0, waterUsage * getVal(waterPrice));
  const extraFees = room.extraFees || [];
  const extraTotal = extraFees.reduce((sum, item) => sum + getVal(item.amount), 0);
  const grandTotal = getVal(room.rent) + elecTotal + waterTotal + extraTotal;

  const handleChange = (f: keyof Room, v: any) => actions.updateRoom(room.id, { [f]: v });
  
  // Special handler for Move-In Date change to sync PayDay
  const handleDateChange = (dateStr: string) => {
    const updates: Partial<Room> = { moveInDate: dateStr };
    if (dateStr) {
      const day = new Date(dateStr).getDate();
      if (!isNaN(day)) updates.payDay = day;
    }
    actions.updateRoom(room.id, updates);
  };

  const handleExtraChange = (newFees: any[]) => actions.updateRoom(room.id, { extraFees: newFees });
  
  const toggleStatus = () => { 
    actions.saveRoom(room.id, { status: room.status === 'paid' ? 'unpaid' : 'paid' }); 
    onBack(); 
  };

  const addExtra = () => handleExtraChange([...extraFees, { id: Date.now(), name: '', amount: '' }]);
  
  const updateExtra = (idx: number, f: string, v: string) => { 
    const n = [...extraFees]; 
    // @ts-ignore
    n[idx][f] = v; 
    handleExtraChange(n); 
  };
  
  const requestRemoveExtra = (idx: number) => {
    confirmAction(
      "删除费用?",
      `确定删除 "${extraFees[idx].name || '未命名费用'}" 吗？`,
      () => handleExtraChange(extraFees.filter((_, i) => i !== idx))
    );
  };

  const handleMoveOutRequest = () => {
    setModal({ type: 'moveOut', data: room });
  };
  
  const handleSingleSettle = () => {
      confirmAction(
          "确认结算本月?", 
          "系统将保存当前账单到历史记录，把本月读数转为上月读数，并自动设置下一个账单周期的日期。", 
          () => actions.settleSingleRoom(room.id)
      );
  };

  // Validation Logic
  const isPhoneValid = !room.tenantPhone || /^\d{11}$/.test(room.tenantPhone);
  const isIdCardValid = !room.tenantIdCard || /^.{18}$/.test(room.tenantIdCard); 

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-bold text-sm">
          <ArrowLeft size={18}/> 返回
        </button>
        <span className="font-bold text-lg text-gray-800">{room.roomNo}</span>
        <button 
          onClick={() => confirmAction("删除房间?", "确定删除此房间吗？数据可恢复。", () => actions.deleteSingle(room.id))} 
          className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          <span className="text-xs font-bold">删除</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8 mt-6">
        <div className="text-center bg-blue-50 py-6 rounded-2xl border border-blue-100 relative group">
          <p className="text-xs text-blue-400 font-bold uppercase mb-1">本月应收</p>
          <div className="text-5xl font-black text-blue-900 font-mono tracking-tighter">¥{grandTotal.toLocaleString()}</div>
          <div className="absolute top-2 right-3 text-blue-300 text-xs font-bold bg-white/50 px-2 py-1 rounded-lg">押金: {room.deposit || 0}</div>
          
          <button 
            onClick={() => setModal({ type: 'billHistory', data: room })}
            className="absolute top-2 left-3 text-blue-400 hover:text-blue-600 p-1 bg-white/50 rounded-lg flex items-center gap-1 text-xs font-bold"
          >
            <History size={14}/> 历史
          </button>
        </div>

        {/* Tenant Info */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
             <User size={14} className="text-gray-500"/>
             <span className="text-xs font-bold text-gray-500">租客信息</span>
          </div>
          <div className="flex gap-4 mb-3">
             <div className="flex-1">
                 <div className="relative">
                    <User size={14} className="absolute left-2 top-2.5 text-gray-400" />
                    <input 
                      placeholder="租客姓名" 
                      className="w-full pl-7 pr-2 py-2 text-sm font-bold bg-white border border-gray-200 rounded outline-none"
                      value={room.tenantName || ''}
                      onChange={e => handleChange('tenantName', e.target.value)}
                    />
                 </div>
             </div>
             <div className="flex-1">
                 <div className="relative">
                    <Phone size={14} className="absolute left-2 top-2.5 text-gray-400" />
                    <input 
                      type="tel"
                      placeholder="联系电话" 
                      className={`w-full pl-7 pr-2 py-2 text-sm font-bold bg-white border rounded outline-none ${!isPhoneValid ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200'}`}
                      value={room.tenantPhone || ''}
                      onChange={e => handleChange('tenantPhone', e.target.value)}
                    />
                 </div>
                 {!isPhoneValid && <p className="text-[10px] text-red-500 mt-1 pl-1">电话需11位</p>}
             </div>
          </div>
          
          <div className="w-full">
             <div className="relative">
                <CreditCard size={14} className="absolute left-2 top-2.5 text-gray-400" />
                <input 
                  placeholder="身份证号" 
                  className={`w-full pl-7 pr-2 py-2 text-sm font-bold bg-white border rounded outline-none ${!isIdCardValid ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200'}`}
                  value={room.tenantIdCard || ''}
                  onChange={e => handleChange('tenantIdCard', e.target.value)}
                  maxLength={18}
                />
             </div>
             {!isIdCardValid && <p className="text-[10px] text-red-500 mt-1 pl-1">身份证需18位</p>}
          </div>
        </div>

        {/* Room Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">房租(元)</label>
            <input type="number" value={room.rent || ''} onChange={(e) => handleChange('rent', e.target.value)} className="w-full text-lg font-bold border-b border-gray-200 py-1 outline-none" placeholder="" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">押金(元)</label>
            <input type="number" value={room.deposit || ''} onChange={(e) => handleChange('deposit', e.target.value)} className="w-full text-lg font-bold border-b border-gray-200 py-1 outline-none text-blue-600" placeholder="" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">入住日期</label>
            <input 
              type="date" 
              value={room.moveInDate || ''} 
              onChange={(e) => handleDateChange(e.target.value)} 
              className="w-full text-sm font-bold border-b border-gray-200 py-1.5 outline-none" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">收租时间(号)</label>
            <input 
              type="number" 
              value={room.payDay || ''} 
              onChange={(e) => handleChange('payDay', parseInt(e.target.value))} 
              className="w-full text-lg font-bold border-b border-gray-200 py-1 outline-none" 
              placeholder="" 
            />
          </div>
        </div>

        {/* Billing Cycle Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               <Calendar size={14} className="text-gray-500"/>
               <span className="text-xs font-bold text-gray-500">账单日期 (选填)</span>
             </div>
             <button
               onClick={handleSingleSettle}
               className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold shadow-sm hover:bg-blue-700"
             >
               📅 结算/开启下月
             </button>
           </div>
           <div className="flex items-center gap-2">
             <input 
               type="date" 
               className="flex-1 bg-white border border-gray-200 rounded px-2 py-2 text-sm font-bold text-gray-800 outline-none"
               value={room.billStartDate || ''}
               onChange={e => handleChange('billStartDate', e.target.value)}
             />
             <span className="text-gray-400 text-xs">至</span>
             <input 
               type="date" 
               className="flex-1 bg-white border border-gray-200 rounded px-2 py-2 text-sm font-bold text-gray-800 outline-none"
               value={room.billEndDate || ''}
               onChange={e => handleChange('billEndDate', e.target.value)}
             />
           </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm relative">
            <div className="flex justify-between mb-3 items-center">
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500"/> 电费
              </div>
              
              {/* Requirement 2: Editable Unit Price, no placeholder */}
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                <span className="text-[10px] font-bold text-yellow-700">单价:</span>
                <input 
                    type="number" 
                    value={room.fixedElecPrice || ''} 
                    onChange={e => handleChange('fixedElecPrice', e.target.value)}
                    className="w-12 bg-transparent text-xs font-bold text-yellow-700 outline-none border-b border-yellow-200 text-right"
                />
              </div>

              <span className="font-bold text-yellow-600">¥{elecTotal.toFixed(1)}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">上月读数</label>
                <input type="number" value={room.elecPrev || ''} onChange={(e) => handleChange('elecPrev', e.target.value)} className="w-full bg-gray-50 rounded p-2 text-sm font-bold text-gray-500 outline-none" placeholder=""/>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-blue-600 font-bold block mb-1">本月读数</label>
                <input type="number" autoFocus value={room.elecCurr || ''} onChange={(e) => handleChange('elecCurr', e.target.value)} className="w-full bg-blue-50 border border-blue-200 rounded p-2 text-lg font-bold text-gray-900 outline-none" placeholder=""/>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between mb-3 items-center">
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Droplets size={16} className="text-blue-500"/> 水费
              </div>

               {/* Requirement 2: Editable Unit Price, no placeholder */}
               <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                <span className="text-[10px] font-bold text-blue-700">单价:</span>
                <input 
                    type="number" 
                    value={room.fixedWaterPrice || ''} 
                    onChange={e => handleChange('fixedWaterPrice', e.target.value)}
                    className="w-12 bg-transparent text-xs font-bold text-blue-700 outline-none border-b border-blue-200 text-right"
                />
              </div>

              <span className="font-bold text-blue-600">¥{waterTotal.toFixed(1)}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">上月读数</label>
                <input type="number" value={room.waterPrev || ''} onChange={(e) => handleChange('waterPrev', e.target.value)} className="w-full bg-gray-50 rounded p-2 text-sm font-bold text-gray-500 outline-none" placeholder=""/>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-blue-600 font-bold block mb-1">本月读数</label>
                <input type="number" value={room.waterCurr || ''} onChange={(e) => handleChange('waterCurr', e.target.value)} className="w-full bg-blue-50 border border-blue-200 rounded p-2 text-lg font-bold text-gray-900 outline-none" placeholder=""/>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase">额外费用</label>
            <button onClick={addExtra} className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">+ 添加</button>
          </div>
          <div className="space-y-3">
            {extraFees.map((fee, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input placeholder="项目" value={fee.name} onChange={(e) => updateExtra(idx, 'name', e.target.value)} className="flex-1 border-b border-gray-100 py-2 text-sm font-bold outline-none"/>
                <input type="number" placeholder="0" value={fee.amount} onChange={(e) => updateExtra(idx, 'amount', e.target.value)} className="w-20 border-b border-gray-100 py-2 text-sm font-bold text-right outline-none"/>
                <button onClick={() => requestRemoveExtra(idx)} className="text-gray-300 hover:text-red-500">
                  <X size={16}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button onClick={handleMoveOutRequest} className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
            <LogOut size={16}/> 办理退租
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-40">
        <div className="grid grid-cols-[1fr_2fr] gap-4 max-w-md mx-auto">
          <button onClick={() => setModal({ type: 'bill', data: room })} className="bg-gray-100 text-gray-600 rounded-lg py-3 font-bold text-sm">生成账单</button>
          <button onClick={toggleStatus} className={`rounded-lg py-3 font-bold text-white shadow-sm flex items-center justify-center gap-2 ${room.status === 'paid' ? 'bg-gray-400' : 'bg-black'}`}>
            {room.status === 'paid' ? '标记未收' : '确认收款'}
          </button>
        </div>
      </div>
    </div>
  );
};
