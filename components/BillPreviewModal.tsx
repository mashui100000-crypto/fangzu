import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, FileText, Download, Calendar, ArrowRight } from 'lucide-react';
import { Room, AppConfig } from '../types';

interface BillPreviewModalProps {
  room: Room;
  config: AppConfig;
  onClose: () => void;
}

export const BillPreviewModal: React.FC<BillPreviewModalProps> = ({ room, config, onClose }) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use stored dates from room, or default to Next Month logic if missing
  const [startDate, setStartDate] = useState(() => {
    if (room.billStartDate) return room.billStartDate;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  const [endDate, setEndDate] = useState(() => {
    if (room.billEndDate) return room.billEndDate;
    const now = new Date();
    const next = new Date(now);
    next.setMonth(now.getMonth() + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
  });

  const getVal = (v: string | number | undefined) => parseFloat(String(v)) || 0;
  
  const ePrev = getVal(room.elecPrev);
  const eCurr = getVal(room.elecCurr);
  const eUsage = eCurr - ePrev;
  const ePrice = getVal(room.fixedElecPrice || config.elecPrice);
  const eTotal = Math.max(0, eUsage * ePrice);
  
  const wPrev = getVal(room.waterPrev);
  const wCurr = getVal(room.waterCurr);
  const wUsage = wCurr - wPrev;
  const wPrice = getVal(room.fixedWaterPrice || config.waterPrice);
  const wTotal = Math.max(0, wUsage * wPrice);
  
  const xTotal = (room.extraFees || []).reduce((s, i) => s + getVal(i.amount), 0);
  const total = getVal(room.rent) + eTotal + wTotal + xTotal;
  
  const dateStr = useMemo(() => {
    if (!startDate || !endDate) return '';
    
    const formatFull = (s: string) => {
        const [y, m, d] = s.split('-');
        return `${y}年${parseInt(m)}月${parseInt(d)}日`;
    };
    const formatShort = (s: string) => {
        const [y, m, d] = s.split('-');
        return `${parseInt(m)}月${parseInt(d)}日`;
    };
    
    const startY = startDate.split('-')[0];
    const endY = endDate.split('-')[0];
    
    if (startY === endY) {
        return `${formatFull(startDate)} 至 ${formatShort(endDate)}`;
    }
    return `${formatFull(startDate)} 至 ${formatFull(endDate)}`;
  }, [startDate, endDate]);
  
  const textContent = `【房租收据】${dateStr}\n房号：${room.roomNo}\n----------------\n🏠 房租：${room.rent}元\n` + 
    (eUsage > 0 || room.elecCurr ? `⚡ 电费：${ePrev}→${eCurr} (${eUsage.toFixed(1)}度) × ${ePrice} = ${eTotal.toFixed(1)}元\n` : '') + 
    (wUsage > 0 || room.waterCurr ? `💧 水费：${wPrev}→${wCurr} (${wUsage.toFixed(1)}吨) × ${wPrice} = ${wTotal.toFixed(1)}元\n` : '') + 
    (room.extraFees || []).map(f => getVal(f.amount) > 0 ? `🧾 ${f.name}：${f.amount}元\n` : '').join('') + 
    `----------------\n💰 总计：${total.toFixed(1)} 元\n`;

  useEffect(() => {
    if (mode === 'image' && canvasRef.current && dateStr) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const width = 600;
      const height = 650 + (room.extraFees?.length || 0) * 40;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      // Background
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, width, height);
      
      // Border
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, width, 10);
      
      // Header
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('房 屋 租 金 收 据', width / 2, 80);
      
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(dateStr, width / 2, 120);
      
      // Divider
      ctx.beginPath();
      ctx.moveTo(40, 140);
      ctx.lineTo(width - 40, 140);
      ctx.strokeStyle = '#EEE';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      let y = 190;
      ctx.textAlign = 'left';
      
      const row = (l: string, v: string, b?: boolean, sub?: string) => {
        ctx.font = b ? 'bold 28px sans-serif' : '24px sans-serif';
        ctx.fillStyle = b ? '#111827' : '#374151';
        ctx.fillText(l, 40, y);
        ctx.textAlign = 'right';
        ctx.fillText(v, width - 40, y);
        
        if (sub) {
            y += 30;
            ctx.textAlign = 'left';
            ctx.font = '20px sans-serif';
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText(sub, 40, y);
        }
        
        ctx.textAlign = 'left';
        y += 50;
      };
      
      row(`🏠 房号：${room.roomNo}`, `¥${room.rent}`);
      
      if (eUsage > 0 || room.elecCurr) {
          row(`⚡ 电费 (${eUsage.toFixed(1)}度)`, `¥${eTotal.toFixed(1)}`, false, `读数: ${ePrev} → ${eCurr}`);
      }
      
      if (wUsage > 0 || room.waterCurr) {
          row(`💧 水费 (${wUsage.toFixed(1)}吨)`, `¥${wTotal.toFixed(1)}`, false, `读数: ${wPrev} → ${wCurr}`);
      }
      
      if (room.extraFees) room.extraFees.forEach(f => row(`🧾 ${f.name}`, `¥${f.amount}`));
      
      y += 20;
      ctx.fillStyle = '#FEF2F2';
      ctx.fillRect(40, y - 40, width - 80, 80);
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('总计', 60, y + 15);
      ctx.textAlign = 'right';
      ctx.fillText(`¥${total.toFixed(1)}`, width - 60, y + 15);
      
      ctx.textAlign = 'center';
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('感谢您的配合，请及时转账', width / 2, y + 100);
      
      // Convert to image
      setImgSrc(canvasRef.current.toDataURL("image/png"));
    }
  }, [mode, room, config, dateStr, eTotal, eUsage, total, wTotal, wUsage, ePrev, eCurr, wPrev, wCurr]);

  const downloadImage = () => {
    if (imgSrc) {
        const link = document.createElement('a');
        link.download = `收据_${room.roomNo}_${dateStr}.png`;
        link.href = imgSrc;
        link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <FileText className="text-blue-600"/> 账单预览
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
        </div>

        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-2">
                <Calendar size={14}/> 账单周期 (预览)
            </label>
            <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-400 outline-none"
                    value={startDate}
                    readOnly
                />
                <span className="text-gray-400"><ArrowRight size={14}/></span>
                <input 
                    type="date" 
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-400 outline-none"
                    value={endDate}
                    readOnly
                />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-center">如需修改日期，请在房间详情页调整</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4 flex-shrink-0">
          <button onClick={() => setMode('text')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'text' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
            📝 纯文本
          </button>
          <button onClick={() => setMode('image')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'image' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
            🖼️ 正式图片
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 flex justify-center">
          {mode === 'text' ? (
            <textarea 
              className="w-full h-64 bg-transparent resize-none outline-none text-sm font-mono text-gray-700 whitespace-pre-wrap" 
              value={textContent} 
              readOnly
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Hidden Canvas for generation */}
              <canvas ref={canvasRef} className="hidden" />
              {/* Visible Image for interaction */}
              {imgSrc ? (
                  <img src={imgSrc} alt="Bill" className="w-full h-auto rounded shadow-lg" />
              ) : (
                  <div className="text-gray-400">正在生成...</div>
              )}
              <p className="text-xs text-gray-400 mt-2">长按图片可保存，或点击下方按钮</p>
            </div>
          )}
        </div>
        
        {mode === 'text' ? (
            <button 
              onClick={() => navigator.clipboard.writeText(textContent).then(() => alert("文本已复制"))} 
              className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-colors bg-black"
            >
              复制文本
            </button>
        ) : (
            <button 
              onClick={downloadImage} 
              className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-colors bg-blue-600 flex items-center justify-center gap-2"
            >
              <Download size={18} /> 保存到相册
            </button>
        )}
      </div>
    </div>
  );
};