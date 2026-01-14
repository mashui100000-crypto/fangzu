import React, { useState } from 'react';
import { ArrowLeft, X, Trash2 } from 'lucide-react';
import { AppConfig, Room } from '../types';

interface AddRoomModalProps {
  config: AppConfig;
  onSave: (data: Partial<Room>) => void;
  onBatchConfirmed: (previewRooms: Partial<Room>[]) => void;
  onCancel: () => void;
  confirmAction: (title: string, content: string, action: () => void) => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ 
  config, 
  onSave, 
  onBatchConfirmed, 
  onCancel, 
  confirmAction 
}) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    roomNo: '',
    rent: config.defaultRent,
    payDay: '1',
    deposit: '',
    prefix: '',
    floorStart: '1',
    floorEnd: '6',
    roomCount: '4',
    fixedElecPrice: '',
    fixedWaterPrice: ''
  });
  const [previewRooms, setPreviewRooms] = useState<Partial<Room>[]>([]);

  const handleChange = (f: string, v: string) => setData({ ...data, [f]: v });

  const handleGeneratePreview = () => {
    const start = parseInt(data.floorStart), end = parseInt(data.floorEnd), rCount = parseInt(data.roomCount);
    if (isNaN(start) || isNaN(end) || isNaN(rCount)) return alert("请填写正确的数字");

    const tempRooms: Partial<Room>[] = [];
    for (let f = start; f <= end; f++) {
      for (let r = 1; r <= rCount; r++) {
        const roomNo = `${data.prefix}${f}${r.toString().padStart(2, '0')}`;
        tempRooms.push({
          roomNo,
          rent: data.rent,
          payDay: parseInt(data.payDay),
          deposit: data.deposit,
          fixedElecPrice: data.fixedElecPrice,
          fixedWaterPrice: data.fixedWaterPrice
        });
      }
    }
    setPreviewRooms(tempRooms);
    setStep(2);
  };

  const updatePreviewItem = (index: number, field: keyof Room, value: string) => {
    setPreviewRooms(prev => {
      const newArr = [...prev];
      // @ts-ignore
      newArr[index][field] = value;
      return newArr;
    });
  };

  const requestRemoveItem = (index: number) => {
    confirmAction(
      "确认移除?",
      `确定不生成房间 ${previewRooms[index].roomNo} 吗？`,
      () => setPreviewRooms(prev => prev.filter((_, i) => i !== index))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{step === 1 ? '添加资产' : '生成预览'}</h2>
          <button onClick={onCancel}><X size={24} className="text-gray-400"/></button>
        </div>
        
        {step === 1 && (
          <>
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4 flex-shrink-0">
              <button onClick={() => setMode('single')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'single' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>单个添加</button>
              <button onClick={() => setMode('batch')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'batch' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>批量生成</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 px-1">
              {mode === 'single' ? (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">房间号</label>
                  <input className="w-full text-xl font-bold border-b-2 py-2 outline-none" placeholder="301" value={data.roomNo} onChange={e => handleChange('roomNo', e.target.value)} />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">前缀 (如: A栋-)</label>
                    <input className="w-full text-lg font-bold border-b-2 py-2 outline-none" placeholder="A栋-" value={data.prefix} onChange={e => handleChange('prefix', e.target.value)} />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">起始层</label>
                      <input type="number" className="w-full text-lg font-bold border-b-2 py-2 outline-none" value={data.floorStart} onChange={e => handleChange('floorStart', e.target.value)} />
                    </div>
                    <span className="text-gray-300 font-bold pt-4">至</span>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">结束层</label>
                      <input type="number" className="w-full text-lg font-bold border-b-2 py-2 outline-none" value={data.floorEnd} onChange={e => handleChange('floorEnd', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">每层几户</label>
                    <input type="number" className="w-full text-lg font-bold border-b-2 py-2 outline-none" value={data.roomCount} onChange={e => handleChange('roomCount', e.target.value)} />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">租金(元)</label>
                  <input type="number" className="w-full font-bold border-b py-1 outline-none" value={data.rent} onChange={e => handleChange('rent', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">押金(元)</label>
                  <input type="number" className="w-full font-bold border-b py-1 outline-none" placeholder="0" value={data.deposit} onChange={e => handleChange('deposit', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">收租日(号)</label>
                  <input type="number" className="w-full font-bold border-b py-1 outline-none" value={data.payDay} onChange={e => handleChange('payDay', e.target.value)} />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mt-2 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2">💰 独立水电 (选填)</p>
                <div className="flex gap-3">
                  <input placeholder={`电:${config.elecPrice}`} className="w-full bg-white border rounded px-2 py-1.5 text-sm" value={data.fixedElecPrice} onChange={e => handleChange('fixedElecPrice', e.target.value)} />
                  <input placeholder={`水:${config.waterPrice}`} className="w-full bg-white border rounded px-2 py-1.5 text-sm" value={data.fixedWaterPrice} onChange={e => handleChange('fixedWaterPrice', e.target.value)} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => mode === 'single' ? onSave({ ...data, payDay: parseInt(data.payDay) }) : handleGeneratePreview()} 
              className="w-full mt-4 py-3 bg-black text-white rounded-lg font-bold shadow-lg flex-shrink-0"
            >
              {mode === 'single' ? '确认添加' : '下一步：预览并微调'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 font-bold flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <ArrowLeft size={14}/> 返回修改
              </button>
              <span className="text-xs text-gray-400">共 {previewRooms.length} 间</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1 pb-2">
              {previewRooms.map((room, idx) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2 relative group">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-800 text-lg">{room.roomNo}</span>
                    <button onClick={() => requestRemoveItem(idx)} className="bg-red-50 text-red-500 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Trash2 size={12}/> 删除
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block">租金</label>
                      <input type="number" className="w-full bg-gray-50 border rounded px-2 py-1 text-sm font-bold text-gray-800 outline-none" value={room.rent} onChange={e => updatePreviewItem(idx, 'rent', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block">押金</label>
                      <input type="number" className="w-full bg-gray-50 border rounded px-2 py-1 text-sm font-bold text-gray-800 outline-none" value={room.deposit} onChange={e => updatePreviewItem(idx, 'deposit', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block">收租日</label>
                      <input type="number" className="w-full bg-gray-50 border rounded px-2 py-1 text-sm font-bold text-gray-800 outline-none" value={room.payDay} onChange={e => updatePreviewItem(idx, 'payDay', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => onBatchConfirmed(previewRooms)} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg flex-shrink-0">
              确认生成全部
            </button>
          </>
        )}
      </div>
    </div>
  );
};