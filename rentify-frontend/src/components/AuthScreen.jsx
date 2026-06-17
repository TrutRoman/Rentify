import React, { useState } from 'react';
import { FaLock, FaUserAlt, FaPhoneAlt, FaArrowRight } from 'react-icons/fa';
import { registerClient } from '../services/api';
import { toast } from 'react-toastify';

export default function AuthScreen({ onLogin, onGuestAccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
        onLogin(phone, password);
    } else {
        try {
            // Очищаємо номер від зайвих пробілів перед відправкою
            const cleanPhone = phone.trim();
            await registerClient({ fullName, phone: cleanPhone, password });
            
            toast.success("Акаунт створено! Тепер ви можете увійти. 🎉");
            setIsLogin(true); 
            setFullName('');
            setPhone('');
            setPassword('');
        } catch (error) {
            // Виводимо помилку в консоль браузера для діагностики
            console.error("Деталі помилки реєстрації:", error);

            if (error.response && error.response.status === 400) {
                // Перевіряємо, чи помилка прийшла як об'єкт, чи як чистий текст
                const serverError = error.response.data;
                const errorMsg = typeof serverError === 'object' && serverError.message 
                    ? serverError.message 
                    : serverError;
                
                toast.error(errorMsg || "Цей номер телефону вже зайнято!");
            } else {
                toast.error("Помилка реєстрації! Можливо, цей номер телефону вже зареєстровано.");
            }
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-2xl border border-white/10" style={{ minHeight: '600px' }}>
        
        {/* ЛІВА ЧАСТИНА (Брендинг) */}
        <div className="md:w-5/12 bg-[#0f1219] p-10 flex flex-col justify-center relative edge-frame m-2 rounded-[1.5rem]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#ff204e] rounded-lg flex items-center justify-center">
              <span className="text-white font-black brand-display text-xl">R</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-widest">RENTIFY</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6 brand-display">
            Повернення до <br/>
            <span className="hero-gradient-text">вашого простору.</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-10">
            Увійдіть, щоб продовжити роботу з каталогом, орендою та вашим інвентарем.
          </p>

          <div className="mt-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs mono-ui">
              <FaLock className="text-teal-400" /> End-to-End Encryption
            </div>
          </div>
        </div>

        {/* ПРАВА ЧАСТИНА (Форма) */}
        <div className="md:w-7/12 bg-[#f8fafc] p-10 flex flex-col justify-center rounded-[1.5rem] m-2">
          
          <div className="flex justify-end mb-10">
            <div className="bg-slate-200 rounded-full p-1 flex">
              <button 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isLogin ? 'bg-[#ff204e] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setIsLogin(true)}
              >
                Вхід
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isLogin ? 'bg-[#ff204e] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setIsLogin(false)}
              >
                Реєстрація
              </button>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-2 brand-display">
              {isLogin ? 'Вхід у систему' : 'Створити акаунт'}
            </h2>
            <p className="text-slate-500 mb-8">Вкажіть ваші дані для доступу до кабінету.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUserAlt className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Вкажіть ваше ПІБ" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-4 bg-[#eff2f6] border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#ff204e] outline-none font-medium transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhoneAlt className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="+380991234567" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#eff2f6] border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#ff204e] outline-none font-medium transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#eff2f6] border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#ff204e] outline-none font-medium transition-all"
                />
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline text-sm font-medium">
                    Забули пароль?
                  </button>
                </div>
              )}

              <button type="submit" className="w-full bg-[#ff204e] hover:bg-[#da103c] text-white py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-[#ff204e]/30">
                {isLogin ? 'Увійти' : 'Зареєструватись'} <FaArrowRight />
              </button>
            </form>

            {/* === НОВИЙ БЛОК: ШВИДКИЙ ДЕМО-ВХІД === */}
            {isLogin && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center mb-4">
                  Демо-доступ (швидкий вхід)
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    type="button"
                    onClick={() => onLogin('admin', 'admin123')} 
                    className="px-4 py-2 bg-slate-200 hover:bg-[#ff204e] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    👑 Адмін
                  </button>
                  <button 
                    type="button"
                    onClick={() => onLogin('manager', 'manager123')} 
                    className="px-4 py-2 bg-slate-200 hover:bg-[#ff204e] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    💼 Менеджер
                  </button>
                  <button 
                    type="button"
                    onClick={() => onLogin('tech', 'tech123')} 
                    className="px-4 py-2 bg-slate-200 hover:bg-[#ff204e] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    🛠️ Технік
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button 
                onClick={onGuestAccess} 
                className="text-slate-500 hover:text-slate-800 text-sm font-bold mono-ui uppercase tracking-widest border-b border-slate-300 pb-1"
              >
                👀 Переглянути каталог як гість
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}