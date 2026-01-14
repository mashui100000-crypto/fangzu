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

export const getBuildingName = (roomNo?: string): string => {
  if (!roomNo) return '其他';
  const match = roomNo.match(/^(\D+)\d+/);
  return match ? match[1].replace(/[-_]/g, '') : '其他';
};