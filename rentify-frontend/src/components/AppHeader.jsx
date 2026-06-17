import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import NotificationBell from '../pages/NotificationBell';
import { useNavigate, useLocation } from 'react-router-dom';

function AppHeader({ onLogout, role, userName }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Тепер кнопка перевіряє, чи співпадає її шлях з поточним URL у браузері
  const navBtnClass = (path) => 
    `font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
      location.pathname === path 
        ? 'text-[#ff204e] bg-[#ff204e]/10' 
        : 'text-white/70 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/5 z-50 px-8 flex justify-between items-center">
      
      {/* ЛОГОТИП */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/catalog')}>
        <div className="w-10 h-10 bg-[#ff204e] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#ff204e]/20">
          R
        </div>
        <span className="text-white font-black text-xl tracking-[0.2em]">RENTIFY</span>
      </div>

      {/* НАВІГАЦІЯ (Строго по ролях) */}
      <nav className="flex items-center gap-2">
        
        {/* 1. ГІСТЬ (Бачить Каталог та Мій кабінет, який перекидає на Вхід) */}
        {role === 'GUEST' && (
          <>
            <button onClick={() => navigate('/catalog')} className={navBtnClass('/')}>
              Каталог
            </button>
            {/* При натисканні викликається onLogout, що скидає сесію і відкриває вікно логіну */}
            <button onClick={onLogout} className={navBtnClass('/profile')}>
              Мій кабінет
            </button>
          </>
        )}

        {/* 2. КЛІЄНТ */}
        {role === 'CLIENT' && (
          <>
            <button onClick={() => navigate('/catalog')} className={navBtnClass('/catalog')}>Каталог</button>
            <button onClick={() => navigate('/profile')} className={navBtnClass('/profile')}>Мій кабінет</button>
            <NotificationBell />
          </>
        )}

        {/* 3. МЕНЕДЖЕР */}
        {role === 'MANAGER' && (
          <>
            <button onClick={() => navigate('/catalog')} className={navBtnClass('/catalog')}>Каталог</button>
            <button onClick={() => navigate('/orders')} className={navBtnClass('/orders')}>Замовлення</button>
            <button onClick={() => navigate('/clients')} className={navBtnClass('/clients')}>Клієнти</button>
            <NotificationBell />
          </>
        )}

        {/* 4. ТЕХНІК */}
        {role === 'TECH' && (
           <>
             <button onClick={() => navigate('/catalog')} className={navBtnClass('/catalog')}>Каталог</button>
             <button onClick={() => navigate('/maintenance')} className={navBtnClass('/maintenance')}>Журнал ТО</button>
             <NotificationBell />
           </>
        )}

        {/* 5. АДМІН */}
        {role === 'ADMIN' && (
          <>
            <button onClick={() => navigate('/catalog')} className={navBtnClass('/catalog')}>Каталог</button>
            <button onClick={() => navigate('/clients')} className={navBtnClass('/clients')}>Клієнти</button>
            <button onClick={() => navigate('/finance')} className={navBtnClass('/finance')}>Дашборд</button>
            <NotificationBell />
          </>
        )}
      </nav>

      {/* ПРОФІЛЬ ТА ВИХІД */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <FaUserCircle className="text-[#ff204e] text-xl" />
          <span className="text-white font-bold text-sm">
            {role === 'GUEST' ? 'Гість' : userName}
          </span>
        </div>
        
        <button 
          onClick={onLogout}
          className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Вийти"
        >
          <FaSignOutAlt size={18} />
        </button>
      </div>
      
    </header>
  );
}

export default AppHeader;