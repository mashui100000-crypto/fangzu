import React, { useState } from 'react';
import { X, Cloud, Lock, Settings2, LogIn, UserPlus, Save, AlertCircle } from 'lucide-react';
import { AppConfig } from '../types';

interface CloudAuthModalProps {
  config: AppConfig;
  onUpdateConfig: (cfg: Partial<AppConfig>) => void;
  onLogin: (email: string, pass: string, isSignup: boolean) => Promise<string | void>;
  onLogout: () => void;
  currentUser: any;
  onClose: () => void;
}

export const CloudAuthModal: React.FC<CloudAuthModalProps> = ({ 
  config, onUpdateConfig, onLogin, onLogout, currentUser, onClose 
}) => {
  const [tab, setTab] = useState<'login' | 'config'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'err' | 'success', text: string } | null>(null);

  // Config State
  const [url, setUrl] = useState(config.supabaseUrl || '');
  const [key, setKey] = useState(config.supabaseKey || '');

  const hasConfig = !!config.supabaseUrl && !!config.supabaseKey;

  const handleAuth = async (isSignup: boolean) => {
    if (!email || !password) return setMsg({ type: 'err', text: '请填写完整' });
    if (!hasConfig) return setMsg({ type: 'err', text: '请先配置服务器' });
    
    setLoading(true);
    setMsg(null);
    try {
      const err = await onLogin(email, password, isSignup);
      if (err) {
        setMsg({ type: 'err', text: typeof err === 'string' ? err : '操作失败' });
      } else {
        setMsg({ type: 'success', text: isSignup ? '注册成功! 请登录' : '登录成功' });
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message || 'Error' });
    }
    setLoading(false);
  };

  const saveConfig = () => {
    onUpdateConfig({ supabaseUrl: url, supabaseKey: key });
    setMsg({ type: 'success', text: '配置已保存' });
    setTab('login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Cloud className="text-blue-600"/> 云端同步
          </h3>
          <button onClick={onClose}><X className="text-gray-400"/></button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button 
            onClick={() => setTab('login')} 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <LogIn size={14}/> 登录账号
          </button>
          <button 
            onClick={() => setTab('config')} 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'config' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <Settings2 size={14}/> 服务器配置
          </button>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${msg.type === 'err' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <AlertCircle size={14}/> {msg.text}
          </div>
        )}

        {tab === 'config' ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg leading-relaxed">
              请使用 <a href="https://supabase.com" target="_blank" className="underline font-bold">Supabase</a> 创建项目。
              <br/>
              填入 Project URL 和 Anon Key。
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400">Project URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} className="w-full border-b py-2 text-sm outline-none" placeholder="https://xxx.supabase.co" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400">API Key (Anon)</label>
              <input value={key} onChange={e => setKey(e.target.value)} type="password" className="w-full border-b py-2 text-sm outline-none" placeholder="eyJhbG..." />
            </div>
            <button onClick={saveConfig} className="w-full py-3 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-4">
              <Save size={16}/> 保存配置
            </button>
          </div>
        ) : (
          <>
            {currentUser ? (
               <div className="text-center py-6">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Cloud size={32}/>
                 </div>
                 <p className="font-bold text-lg text-gray-800">已登录</p>
                 <p className="text-sm text-gray-500 mb-6">{currentUser.email}</p>
                 <p className="text-xs text-blue-500 bg-blue-50 p-2 rounded mb-6">数据变更将自动同步到云端</p>
                 <button onClick={onLogout} className="w-full py-3 border border-gray-200 text-gray-600 rounded-lg font-bold">
                   退出登录
                 </button>
               </div>
            ) : (
              <div className="space-y-4">
                {!hasConfig && (
                   <div onClick={() => setTab('config')} className="p-3 border border-yellow-200 bg-yellow-50 text-yellow-700 text-xs rounded-lg cursor-pointer">
                     ⚠️ 尚未配置服务器，点击此处去配置
                   </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-400">邮箱</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full border-b py-2 text-lg font-bold outline-none" 
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">密码</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full border-b py-2 text-lg font-bold outline-none" 
                    placeholder="******"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={() => handleAuth(false)} 
                    disabled={loading || !hasConfig}
                    className="py-3 bg-black text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? '...' : <><LogIn size={16}/> 登录</>}
                  </button>
                  <button 
                    onClick={() => handleAuth(true)} 
                    disabled={loading || !hasConfig}
                    className="py-3 border border-black text-black rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16}/> 注册
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};