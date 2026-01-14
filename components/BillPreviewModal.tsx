import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, FileText, Download } from 'lucide-react';
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
  const [startDate] = useState(() => {
    if (room.billStartDate) return room.billStartDate;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  const [endDate] = useState(() => {
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
  const hasElec = eUsage > 0 || room.elecCurr !== '';
  
  const wPrev = getVal(room.waterPrev);
  const wCurr = getVal(room.waterCurr);
  const wUsage = wCurr - wPrev;
  const wPrice = getVal(room.fixedWaterPrice || config.waterPrice);
  const wTotal = Math.max(0, wUsage * wPrice);
  const hasWater = wUsage > 0 || room.waterCurr !== '';
  
  const xTotal = (room.extraFees || []).reduce((s, i) => s + getVal(i.amount), 0);
  const total = getVal(room.rent) + eTotal + wTotal + xTotal;
  const depositVal = getVal(room.deposit);
  
  // Full Date Format YYYY年MM月DD日
  const dateStr = useMemo(() => {
    if (!startDate || !endDate) return '';
    
    const formatFull = (s: string) => {
        const [y, m, d] = s.split('-');
        return `${y}年${parseInt(m)}月${parseInt(d)}日`;
    };
    
    return `${formatFull(startDate)} 至 ${formatFull(endDate)}`;
  }, [startDate, endDate]);
  
  // Text Content Construction
  const textContent = `【房租收据】\n日期：${dateStr}\n` + 
    `----------------\n` +
    `🏠 房号：${room.roomNo}\n` + 
    (room.tenantName ? `👤 租客：${room.tenantName}\n` : '') + 
    `💰 房租：${room.rent}元\n` + 
    (hasElec ? `⚡ 电费：${eTotal.toFixed(1)}元\n   读数：${ePrev} → ${eCurr}\n   计算：${eUsage.toFixed(1)}度 × ${ePrice}元/度\n` : '') + 
    (hasWater ? `💧 水费：${wTotal.toFixed(1)}元\n   读数：${wPrev} → ${wCurr}\n   计算：${wUsage.toFixed(1)}吨 × ${wPrice}元/吨\n` : '') + 
    (room.extraFees || []).map(f => getVal(f.amount) > 0 ? `🧾 ${f.name}：${f.amount}元\n` : '').join('') + 
    `----------------\n` + 
    `💵 总计：${total.toFixed(1)} 元\n` +
    (depositVal > 0 ? `(已收押金：${depositVal}元)\n` : '');

  useEffect(() => {
    if (mode === 'image' && canvasRef.current && dateStr) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // 1. Calculate Dynamic Height
      const PADDING_TOP = 160;
      const ITEM_HEIGHT = 50;
      // Utility block height: Main Row (50) + Reading Row (25) + Calc Row (25) + Padding (10)
      const UTILITY_HEIGHT = 110; 
      const TOTAL_BLOCK_HEIGHT = 120;
      const FOOTER_HEIGHT = 60;
      
      let calculatedHeight = PADDING_TOP;
      
      calculatedHeight += ITEM_HEIGHT; // Room No
      if (room.tenantName) calculatedHeight += ITEM_HEIGHT; // Tenant
      calculatedHeight += ITEM_HEIGHT; // Rent (New separate row)
      
      if (hasElec) calculatedHeight += UTILITY_HEIGHT;
      if (hasWater) calculatedHeight += UTILITY_HEIGHT;
      
      if (room.extraFees) calculatedHeight += (room.extraFees.length * ITEM_HEIGHT);
      
      calculatedHeight += TOTAL_BLOCK_HEIGHT;
      if (depositVal > 0) calculatedHeight += 40;
      calculatedHeight += FOOTER_HEIGHT;

      const width = 600;
      const height = calculatedHeight;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      // 2. Start Drawing
      
      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Top Border
      ctx.fillStyle = '#2563EB'; // Blue-600
      ctx.fillRect(0, 0, width, 16);
      
      // Title
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('房 屋 租 金 收 据', width / 2, 80);
      
      // Date
      ctx.font = '22px "PingFang SC", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(dateStr, width / 2, 120);
      
      // Divider Line
      ctx.beginPath();
      ctx.moveTo(40, 140);
      ctx.lineTo(width - 40, 140);
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      let y = 190;
      ctx.textAlign = 'left';
      
      // Helper function to draw a main row
      const drawRow = (icon: string, label: string, value: string, color: string = '#374151') => {
        ctx.font = '26px "PingFang SC", sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(`${icon} ${label}`, 40, y);
        
        if (value) {
            ctx.font = 'bold 26px "PingFang SC", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#111827';
            ctx.fillText(value, width - 40, y);
            ctx.textAlign = 'left';
        }
        
        y += ITEM_HEIGHT;
      };

      // --- Content ---
      
      // 1. Room No (Rent moved to separate line)
      drawRow('🏠', `房号：${room.roomNo}`, ''); 

      // 2. Tenant (Separate line, no duplicate value on right)
      if (room.tenantName) {
        drawRow('👤', `租客：${room.tenantName}`, '');
      }

      // 3. Rent (New separate row)
      drawRow('💰', '房租', `¥${room.rent}`);
      
      // 4. Electricity
      if (hasElec) {
        // Main line: Total
        drawRow('⚡', '电费', `¥${eTotal.toFixed(1)}`);
        
        // Sub lines adjustments (Manual drawing for better control)
        y -= 15; // Move back up under the main line
        
        ctx.font = '20px "PingFang SC", sans-serif';
        ctx.fillStyle = '#9CA3AF'; // Gray-400
        // Line 1: Readings
        ctx.fillText(`读数：${ePrev} → ${eCurr}`, 75, y); 
        y += 28;
        // Line 2: Calculation
        ctx.fillText(`计算：${eUsage.toFixed(1)}度 × ${ePrice}元/度`, 75, y);
        y += 37; // Space for next block
      }
      
      // 5. Water
      if (hasWater) {
        drawRow('💧', '水费', `¥${wTotal.toFixed(1)}`);
        
        y -= 15;
        ctx.font = '20px "PingFang SC", sans-serif';
        ctx.fillStyle = '#9CA3AF';
        
        ctx.fillText(`读数：${wPrev} → ${wCurr}`, 75, y);
        y += 28;
        ctx.fillText(`计算：${wUsage.toFixed(1)}吨 × ${wPrice}元/吨`, 75, y);
        y += 37;
      }
      
      // 6. Extras
      if (room.extraFees) {
        room.extraFees.forEach(f => {
          if (getVal(f.amount) > 0 || f.name) {
             drawRow('🧾', f.name || '杂费', `¥${f.amount}`);
          }
        });
      }
      
      // Total Section Background
      y += 10;
      ctx.fillStyle = '#FEF2F2'; // Red-50
      ctx.fillRect(30, y, width - 60, 90);
      
      // Total Text
      y += 55;
      ctx.fillStyle = '#DC2626'; // Red-600
      ctx.font = 'bold 32px "PingFang SC", sans-serif';
      ctx.fillText('总计应收', 60, y);
      
      ctx.textAlign = 'right';
      ctx.font = 'bold 40px "PingFang SC", sans-serif';
      ctx.fillText(`¥${total.toFixed(1)}`, width - 60, y);
      
      y += 60; // Move past the box

      if (depositVal > 0) {
        y += 10;
        ctx.font = '22px "PingFang SC", sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'right';
        ctx.fillText(`(已收押金: ¥${depositVal})`, width - 40, y);
        y += 40;
      }
      
      // Footer
      y += 30;
      ctx.textAlign = 'center';
      ctx.font = '18px "PingFang SC", sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('感谢您的配合，请及时转账', width / 2, y);
      
      // Convert to image
      setImgSrc(canvasRef.current.toDataURL("image/png"));
    }
  }, [mode, room, config, dateStr, eTotal, eUsage, total, wTotal, wUsage, ePrev, eCurr, wPrev, wCurr, depositVal, hasElec, hasWater, ePrice, wPrice]);

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
                  <img src={imgSrc} alt="Bill" className="w-full h-auto rounded shadow-lg border border-gray-100" />
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