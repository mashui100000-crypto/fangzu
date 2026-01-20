import React, { useState } from 'react';
import { X, Cloud, LogIn, UserPlus, AlertCircle, HelpCircle } from 'lucide-react';
import { AppConfig } from '../types';

interface CloudAuthModalProps {
  onLogin: (email: string, pass: string, isSignup: boolean) => Promise<string | void>;
  onLogout: () => void;
  currentUser: any;
  onClose: () => void;
}

export const CloudAuthModal: React.FC<CloudAuthModalProps> = ({ 
  onLogin, onLogout, currentUser, onClose 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'err' | 'success', text: string } | null>(null);

  const handleAuth = async (isSignup: boolean) => {
    if (!email || !password) return setMsg({ type: 'err', text: '请填写邮箱和密码' });
    
    setLoading(true);
    setMsg(null);
    try {
      const res = await onLogin(email, password, isSignup);
      
      if (res === 'NEED_CONFIRMATION') {
        setMsg({ 
          type: 'success', 
          text: '注册成功！请前往邮箱验证，或联系管理员后台直接通过。' 
        });
      } else if (res) {
        setMsg({ type: 'err', text: typeof res === 'string' ? res : '操作失败' });
      } else {
        setMsg({ type: 'success', text: isSignup ? '注册并登录成功' : '登录成功' });
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message || 'Error' });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Cloud className="text-blue-600"/> 
            {currentUser ? '账号中心' : '登录/注册'}
          </h3>
          <button onClick={onClose}><X className="text-gray-400"/></button>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-start gap-2 ${msg.type === 'err' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/> <span className="break-all">{msg.text}</span>
          </div>
        )}

        {currentUser ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud size={32}/>
              </div>
              <p className="font-bold text-lg text-gray-800">已登录</p>
              <p className="text-sm text-gray-500 mb-6">{currentUser.email}</p>
              <p className="text-xs text-blue-500 bg-blue-50 p-2 rounded mb-6">您的数据正在自动同步到云端</p>
              <button onClick={onLogout} className="w-full py-3 border border-gray-200 text-gray-600 rounded-lg font-bold">
                退出登录
              </button>
            </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
               登录账号以实现多设备数据同步。
            </div>
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
                disabled={loading}
                className="py-3 bg-black text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '...' : <><LogIn size={16}/> 登录</>}
              </button>
              <button 
                onClick={() => handleAuth(true)} 
                disabled={loading}
                className="py-3 border border-black text-black rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus size={16}/> 注册
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><HelpCircle size={12}/> 提示</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  新用户注册后即可使用。如果遇到问题，请联系管理员。
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};