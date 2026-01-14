export interface ExtraFee {
  id: number;
  name: string;
  amount: string;
}

export interface Room {
  id: string;
  roomNo: string;
  rent: string;
  deposit: string;
  payDay: number;
  fixedElecPrice?: string;
  fixedWaterPrice?: string;
  elecPrev: number;
  elecCurr: string;
  waterPrev: number;
  waterCurr: string;
  extraFees: ExtraFee[];
  status: 'paid' | 'unpaid';
  lastUpdated: string;
  // New fields for billing memory
  billStartDate?: string;
  billEndDate?: string;
}

export interface AppConfig {
  elecPrice: string;
  waterPrice: string;
  defaultRent: string;
}

export interface HistoryItem {
  data: Room[];
  desc: string;
  time: string;
}

export interface HistoryState {
  archives: HistoryItem[];
  present: Room[];
}

export interface ActionHandlers {
  addRoom: (data: Partial<Room>) => void;
  batchAddConfirmed: (previewRooms: Partial<Room>[]) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  saveRoom: (id: string, data: Partial<Room>) => void;
  deleteSingle: (id: string) => void;
  deleteBatch: () => void;
  updateBatchDate: (day: string) => void;
  newMonth: (targetDay: number | 'all') => void;
  moveOut: (id: string, returnDeposit: boolean) => void;
}

export type ModalType = 
  | 'history' 
  | 'bill' 
  | 'batchBill'
  | 'moveOut' 
  | 'newMonth' 
  | 'batchDate' 
  | 'genericConfirm' 
  | null;

export interface ModalState {
  type: ModalType;
  data?: any;
  onConfirm?: () => void;
  title?: string;
  content?: string;
}