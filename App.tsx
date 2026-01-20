import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeGetStorage, calculateBillPeriod } from './utils';
import { STORAGE_KEY_CONFIG, STORAGE_KEY_DATA, DEFAULT_CONFIG } from './constants';
import { Room, AppConfig, HistoryState, ActionHandlers, ModalState, InstallPromptEvent, BillRecord } from './types';

// Components
import { RoomListView } from './components/RoomListView';
import { RoomEditView } from './components/RoomEditView';
import { UserGuideView } from './components/UserGuideView';
import { AddRoomModal } from './components/AddRoomModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { BillPreviewModal } from './components/BillPreviewModal';
import { BillHistoryModal } from './components/BillHistoryModal';
import { NewMonthModal } from './components/NewMonthModal';
import { BatchDateModal } from './components/BatchDateModal';
import { GenericConfirmModal } from './components/GenericConfirmModal';
import { MoveOutModal } from './components/MoveOutModal';
import { BatchBillModal } from './components/BatchBillModal';
import { CloudAuthModal } from './components/CloudAuthModal';

export default function App() {
  // --- Core State ---
  const [history, setHistory] = useState<HistoryState>({ archives: [], present: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<'list' | 'edit' | 'add' | 'settings' | 'guide'>('list');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Search & Filter
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeBuilding, setActiveBuilding] = useState('all');
  const [activeDateTab, setActiveDateTab] = useState('all');

  // Batch Selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [modal, setModal] = useState<ModalState>({ type: null });

  // Config State (Local preferences only, connection details are constants)
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  // Cloud Sync State
  const [cloudClient, setCloudClient] = useState<SupabaseClient | null>(null);
  const [cloudUser, setCloudUser] = useState<any>(null);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  // --- Initialization ---
  useEffect(() => {
    try {
      const savedConfig = safeGetStorage(STORAGE_KEY_CONFIG, null);
      if (savedConfig) setConfig(savedConfig);

      let initialRooms = safeGetStorage<Room[]>(STORAGE_KEY_DATA, []);
      if (!initialRooms || initialRooms.length === 0) {
        initialRooms = safeGetStorage('landlord_data_v21_fresh', []); 
      }
      if (!Array.isArray(initialRooms)) initialRooms = [];

      setHistory({
        archives: [{ data: initialRooms, desc: '初始状态', time: new Date().toISOString() }],
        present: initialRooms
      });

      if (initialRooms.length === 0) setView('guide');
      setIsLoaded(true);
    } catch (e) {
      setIsLoaded(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- Auto Save to LocalStorage ---
  useEffect(() => {
    if (isLoaded && history.present) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(history.present));
    }
  }, [history.present, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config, isLoaded]);

  // --- Cloud Sync Logic ---
  
  // Initialize Client using HARDCODED constants (SaaS Mode)
  useEffect(() => {
    const url = DEFAULT_CONFIG.supabaseUrl?.trim();
    const key = DEFAULT_CONFIG.supabaseKey?.trim();

    // Check if configured properly
    const isValid = !!(url && key && url.startsWith('http') && key.length > 20);
    setIsCloudConfigured(isValid);

    if (isValid) {
      try {
        const client = createClient(url!, key!);
        setCloudClient(client);
        
        // Check session
        client.auth.getSession().then(({ data: { session } }) => {
          setCloudUser(session?.user || null);
          if (session?.user) {
             syncFromCloud(client, session.user.id);
          }
        });

        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
          const user = session?.user || null;
          setCloudUser(user);
          if (user) syncFromCloud(client, user.id);
        });

        return () => subscription.unsubscribe();
      } catch (e) {
        console.error("Supabase init failed", e);
      }
    }
  }, []);

  // 2. Download Data
  const syncFromCloud = async (client: SupabaseClient, userId: string) => {
    const { data, error } = await client
      .from('landlord_backup')
      .select('data')
      .eq('user_id', userId)
      .single();
    
    if (data && data.data) {
       // Cloud has data, overwrite local
       setHistory(prev => ({
           ...prev,
           present: data.data,
           archives: [{ data: data.data, desc: '云端同步', time: new Date().toISOString() }, ...prev.archives].slice(0, 50)
       }));
    } else if (!data && !error) {
       // No cloud data, upload local
       syncToCloud(client, userId, history.present);
    }
  };

  // 3. Upload Data
  const syncToCloud = async (client: SupabaseClient, userId: string, rooms: Room[]) => {
      await client.from('landlord_backup').upsert({
          user_id: userId,
          data: rooms,
          updated_at: new Date().toISOString()
      });
  };

  // --- Handlers ---

  const handleCloudLogin = async (email: string, pass: string, isSignup: boolean) => {
    if (!cloudClient) return '系统未配置数据库，请联系管理员。';
    
    if (isSignup) {
      const { data, error } = await cloudClient.auth.signUp({ email, password: pass });
      if (error) return error.message;
      // If email confirmation is enabled (default) and not clicked yet, session is null.
      if (data.user && !data.session) {
        return 'NEED_CONFIRMATION';
      }
      return;
    } else {
      const { error } = await cloudClient.auth.signInWithPassword({ email, password: pass });
      return error?.message;
    }
  };

  const handleCloudLogout = async () => {
      if (cloudClient) await cloudClient.auth.signOut();
  };

  // --- Calculation Helpers ---
  const calculateTotal = (r: Room, cfg: AppConfig): number => {
    const getVal = (v: any) => parseFloat(v) || 0;
    const ep = r.fixedElecPrice || cfg.elecPrice;
    const wp = r.fixedWaterPrice || cfg.waterPrice;
    const e = (getVal(r.elecCurr) - getVal(r.elecPrev)) * getVal(ep);
    const w = (getVal(r.waterCurr) - getVal(r.waterPrev)) * getVal(wp);
    const extra = (r.extraFees || []).reduce((sum, item) => sum + getVal(item.amount), 0);
    return Math.max(0, getVal(r.rent) + Math.max(0, e) + Math.max(0, w) + extra);
  };

  const processSettlement = (r: Room): Room => {
      const record: BillRecord = {
          id: Date.now().toString() + Math.random(),
          recordedAt: new Date().toISOString(),
          startDate: r.billStartDate || '',
          endDate: r.billEndDate || '',
          rent: r.rent,
          elecPrev: r.elecPrev,
          elecCurr: r.elecCurr,
          waterPrev: r.waterPrev,
          waterCurr: r.waterCurr,
          extraFees: [...(r.extraFees || [])],
          total: calculateTotal(r, config),
          tenantName: r.tenantName,
          tenantIdCard: r.tenantIdCard,
          roomNo: r.roomNo
      };
      const newHistory = [...(r.billHistory || []), record];
      const payDayInt = r.payDay ? parseInt(String(r.payDay)) : 1;
      const { start, end } = calculateBillPeriod(payDayInt, r.billEndDate);
      
      return {
        ...r,
        elecPrev: r.elecCurr ? parseFloat(r.elecCurr) : r.elecPrev,
        elecCurr: '',
        waterPrev: r.waterCurr ? parseFloat(r.waterCurr) : r.waterPrev,
        waterCurr: '',
        status: 'unpaid' as const,
        billStartDate: start,
        billEndDate: end,
        billHistory: newHistory
      };
  };

  // --- Core State Updates with Cloud Sync ---

  const commitChange = (newRooms: Room[], desc: string) => {
    setHistory(curr => ({
      archives: [{ data: newRooms, desc, time: new Date().toISOString() }, ...curr.archives].slice(0, 50),
      present: newRooms
    }));
    
    // Sync to cloud if logged in
    if (cloudClient && cloudUser) {
        syncToCloud(cloudClient, cloudUser.id, newRooms);
    }
  };

  const handleRestore = (index: number) => {
    const target = history.archives[index];
    if (target) {
      commitChange(target.data, `恢复至: ${target.desc}`);
      setModal({ type: null });
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const createRoomObj = (data: Partial<Room>, index = 0): Room => {
    const payDay = typeof data.payDay === 'number' ? data.payDay : 1;
    const { start, end } = calculateBillPeriod(payDay);

    return {
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      roomNo: data.roomNo || '未命名',
      rent: data.rent || config.defaultRent,
      deposit: data.deposit || '',
      payDay: payDay,
      moveInDate: data.moveInDate,
      tenantName: '',
      tenantPhone: '',
      tenantIdCard: '',
      fixedElecPrice: data.fixedElecPrice || '',
      fixedWaterPrice: data.fixedWaterPrice || '',
      elecPrev: 0,
      elecCurr: '',
      waterPrev: 0,
      waterCurr: '',
      extraFees: [],
      status: 'unpaid',
      lastUpdated: new Date().toISOString(),
      billStartDate: start,
      billEndDate: end,
      billHistory: []
    };
  };

  const actions: ActionHandlers = {
    addRoom: (data) => {
      if (history.present.some(r => r.roomNo === data.roomNo)) return alert("房间号已存在");
      commitChange([...history.present, createRoomObj(data)], `添加 ${data.roomNo}`);
      setView('list');
    },

    batchAddConfirmed: (previewRooms) => {
      const uniqueRooms = previewRooms.filter(n => !history.present.some(o => o.roomNo === n.roomNo));
      if (uniqueRooms.length === 0) return alert("没有生成新房间(可能全部已存在)");
      const newItems = uniqueRooms.map((d, i) => createRoomObj(d, i));
      commitChange([...history.present, ...newItems], `批量生成 ${newItems.length} 间`);
      setView('list');
    },

    updateRoom: (id, data) => {
      setHistory(curr => ({
        ...curr,
        present: curr.present.map(r => r.id === id ? { ...r, ...data } : r)
      }));
    },

    saveRoom: (id, data) => {
      commitChange(
        history.present.map(r => r.id === id ? { ...r, ...data } : r),
        "更新房间信息"
      );
    },

    deleteSingle: (id) => {
      commitChange(history.present.filter(r => r.id !== id), "删除房间");
      setView('list');
      setModal({ type: null });
    },

    deleteBatch: () => {
      commitChange(
        history.present.filter(r => !selectedIds.has(r.id)),
        `批量删除 ${selectedIds.size} 项`
      );
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setModal({ type: null });
    },

    updateBatchDate: (day) => {
      commitChange(
        history.present.map(r => selectedIds.has(r.id) ? { ...r, payDay: parseInt(day) } : r),
        "批量修改日期"
      );
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setModal({ type: null });
      setActiveDateTab('all');
    },

    newMonth: (targetDay) => {
      const updated = history.present.map(r => {
        if (targetDay !== 'all') {
            const rDay = r.payDay ? parseInt(String(r.payDay)) : 1;
            const tDay = parseInt(String(targetDay));
            if (rDay !== tDay) return r;
        }
        return processSettlement(r);
      });
      commitChange(updated, "批量开启新月份");
      setModal({ type: null });
    },

    settleSingleRoom: (id: string) => {
        const target = history.present.find(r => r.id === id);
        if (!target) return;
        const updated = history.present.map(r => r.id !== id ? r : processSettlement(r));
        commitChange(updated, `单个结算: ${target.roomNo}`);
    },

    moveOut: (id, returnDeposit) => {
      const target = history.present.find(r => r.id === id);
      if (!target) return;
      const updated: Room = { 
        ...target, 
        deposit: returnDeposit ? '0' : target.deposit, 
        tenantName: '',
        tenantPhone: '',
        tenantIdCard: '',
        status: 'unpaid', 
        extraFees: [] 
      };
      commitChange(
        history.present.map(r => r.id === id ? updated : r), 
        `房间 ${target.roomNo} 退租`
      );
      setModal({ type: null });
      setView('list');
    }
  };

  const handleSearch = () => setActiveSearch(searchInput);
  const clearSearch = () => { setSearchInput(''); setActiveSearch(''); };

  const confirmAction = (title: string, content: string, action: () => void) => {
    setModal({ type: 'genericConfirm', title, content, onConfirm: action });
  };
  
  const viewHistoryRecord = (record: BillRecord) => {
     const currentRoom = history.present.find(r => r.roomNo === record.roomNo);
     if (!currentRoom) return;

     const tempRoom: Room = {
         ...currentRoom, 
         id: record.id,
         roomNo: record.roomNo,
         rent: record.rent,
         elecPrev: record.elecPrev,
         elecCurr: record.elecCurr,
         waterPrev: record.waterPrev,
         waterCurr: record.waterCurr,
         extraFees: record.extraFees,
         billStartDate: record.startDate,
         billEndDate: record.endDate,
         tenantName: record.tenantName,
         tenantIdCard: record.tenantIdCard,
         deposit: '0', 
         payDay: 1, 
         status: 'paid',
         lastUpdated: record.recordedAt
     };
     setModal({ type: 'bill', data: tempRoom });
  };

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-gray-500">正在启动...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1A1A1A]">
      {view === 'list' && (
        <RoomListView
          rooms={history.present}
          search={{ input: searchInput, setInput: setSearchInput, active: activeSearch, run: handleSearch, clear: clearSearch }}
          filter={{ building: activeBuilding, setBuilding: setActiveBuilding, date: activeDateTab, setDate: setActiveDateTab }}
          batch={{ isMode: isSelectionMode, setMode: setIsSelectionMode, ids: selectedIds, setIds: setSelectedIds }}
          actions={actions}
          openSettings={() => setView('settings')}
          openGuide={() => setView('guide')}
          navigate={(v, id) => { setView(v); if (id) setActiveRoomId(id); }}
          setModal={setModal}
          confirmAction={confirmAction}
          config={config}
          installPrompt={installPrompt}
          onInstall={handleInstallApp}
        />
      )}

      {view === 'edit' && activeRoomId && (
        <RoomEditView
          room={history.present.find(r => r.id === activeRoomId)}
          config={config}
          actions={actions}
          onBack={() => setView('list')}
          setModal={setModal}
          confirmAction={confirmAction}
        />
      )}

      {view === 'guide' && <UserGuideView onClose={() => setView('list')} />}

      {view === 'add' && (
        <AddRoomModal 
          config={config} 
          onSave={actions.addRoom} 
          onBatchConfirmed={actions.batchAddConfirmed} 
          onCancel={() => setView('list')} 
          confirmAction={confirmAction} 
        />
      )}

      {view === 'settings' && (
        <SettingsModal config={config} setConfig={setConfig} onClose={() => setView('list')} />
      )}

      {/* Modals */}
      {modal.type === 'history' && (
        <HistoryModal archives={history.archives} onRestore={handleRestore} onClose={() => setModal({ type: null })} />
      )}
      
      {modal.type === 'bill' && modal.data && (
        <BillPreviewModal room={modal.data} config={config} onClose={() => setModal({ type: null })} />
      )}

      {modal.type === 'billHistory' && modal.data && (
        <BillHistoryModal 
            room={modal.data} 
            onSelect={viewHistoryRecord}
            onClose={() => setModal({ type: null })} 
        />
      )}

      {modal.type === 'batchBill' && modal.data && (
        <BatchBillModal 
          rooms={history.present.filter(r => modal.data.includes(r.id)).sort((a,b) => a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true }))} 
          config={config} 
          onClose={() => setModal({ type: null })} 
        />
      )}
      
      {modal.type === 'moveOut' && modal.data && (
        <MoveOutModal 
          room={modal.data} 
          config={config} 
          onConfirm={actions.moveOut} 
          onCancel={() => setModal({ type: null })} 
        />
      )}

      {modal.type === 'newMonth' && (
        <NewMonthModal rooms={history.present} onAction={actions.newMonth} onCancel={() => setModal({ type: null })} />
      )}
      
      {modal.type === 'batchDate' && (
        <BatchDateModal count={selectedIds.size} onConfirm={actions.updateBatchDate} onCancel={() => setModal({ type: null })} />
      )}

      {modal.type === 'genericConfirm' && modal.onConfirm && (
        <GenericConfirmModal
          title={modal.title}
          content={modal.content}
          onConfirm={() => { modal.onConfirm!(); setModal({ type: null }); }}
          onCancel={() => setModal({ type: null })}
        />
      )}

      {modal.type === 'cloudAuth' && (
        <CloudAuthModal 
          onLogin={handleCloudLogin}
          onLogout={handleCloudLogout}
          currentUser={cloudUser}
          onClose={() => setModal({ type: null })}
        />
      )}
    </div>
  );
}