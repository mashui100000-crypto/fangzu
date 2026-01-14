
export const safeGetStorage = <T,>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

export const formatTime = (isoString?: string): string => {
  try {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return '--:--';
  }
};

export const formatDateStr = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const calculateBillPeriod = (payDay: number, lastEndDate?: string) => {
  const targetDay = payDay || 1;
  let start: Date;

  if (lastEndDate) {
    // If there is a previous end date, continue from there
    start = new Date(lastEndDate);
  } else {
    // Otherwise, calculate based on today relative to the move-in day
    const now = new Date();
    // Create a date for this month on the target day
    start = new Date(now.getFullYear(), now.getMonth(), targetDay);
    
    // If today is before the target day (e.g., Today 5th, Move-in 13th), 
    // the period likely started last month (e.g., Last Month 13th - This Month 13th)
    if (now.getDate() < targetDay) {
      start.setMonth(start.getMonth() - 1);
    }
  }

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return {
    start: formatDateStr(start),
    end: formatDateStr(end)
  };
};

export const getBuildingName = (roomNo?: string): string => {
  if (!roomNo) return '其他';
  const match = roomNo.match(/^(\D+)\d+/);
  return match ? match[1].replace(/[-_]/g, '') : '其他';
};
