import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Імпорти сторінок ---
import InventoryList from './pages/InventoryList';
import ClientManagement from './components/ClientManagement'; 
import TechDashboard from './pages/TechDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// --- Компоненти та API ---
import AuthScreen from './components/AuthScreen';
import AppHeader from './components/AppHeader';
import OrderManagement from './components/OrderManagement';
import { loginUser } from './services/api';
import './App.css';

// 1. Компонент для захисту роутів (Перевіряє, чи має користувач потрібну роль)
const ProtectedRoute = ({ role, allowedRoles, children }) => {
  if (!role) {
    return <Navigate to="/login" replace />; // Якщо не залогінений - на екран входу
  }
  // GUEST має доступ тільки до каталогу. Інші ролі перевіряються за масивом allowedRoles
  if (role !== 'GUEST' && allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/catalog" replace />; // Якщо немає прав - кидаємо на головну
  }
  return children;
};

// 2. Внутрішній компонент додатку (щоб працював useNavigate)
function AppContent() {
  const [currentRole, setCurrentRole] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Щоб підсвічувати активну вкладку в хедері

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    const savedName = localStorage.getItem('userName');
    if (savedRole) setCurrentRole(savedRole);
    if (savedName) setUserName(savedName);
  }, []);

  const handleLogin = async (phone, password) => {
    try {
      const data = await loginUser(phone, password);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.fullName); 
      setCurrentRole(data.role);
      setUserName(data.fullName);
      navigate('/catalog'); // Після логіну перекидаємо на Каталог
    } catch (error) {
      alert("Невірний логін або пароль");
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    setCurrentRole(null);
    setUserName('');
    navigate('/login'); // Після виходу кидаємо на екран входу
  };

  const handleGuestAccess = () => {
    setCurrentRole('GUEST');
    navigate('/catalog');
  };

  // Якщо користувач не визначений і він не на сторінці логіну - перекидаємо на логін
  if (!currentRole && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="App">
      {/* Хедер показуємо тільки якщо ми не на сторінці логіну */}
      {location.pathname !== '/login' && (
        <AppHeader 
            onLogout={handleLogout} 
            role={currentRole}
            userName={userName}
        />
      )}

      <main className={location.pathname !== '/login' ? "pt-24 px-4 pb-10" : ""}>
        <Routes>
          {/* ЕКРАН АВТОРИЗАЦІЇ */}
          <Route path="/login" element={
            currentRole && currentRole !== 'GUEST' 
              ? <Navigate to="/catalog" replace /> 
              : <AuthScreen onLogin={handleLogin} onGuestAccess={handleGuestAccess} />
          } />

          {/* КАТАЛОГ (Доступний всім, включно з GUEST) */}
          <Route path="/catalog" element={<InventoryList />} />
          {/* ТИМЧАСОВИЙ РЕДИРЕКТ З ГОЛОВНОЇ */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />

          {/* КАБІНЕТ КЛІЄНТА */}
          <Route path="/profile" element={
            <ProtectedRoute role={currentRole} allowedRoles={['CLIENT']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />

          {/* КЛІЄНТИ (Менеджер та Адмін) */}
          <Route path="/clients" element={
            <ProtectedRoute role={currentRole} allowedRoles={['MANAGER', 'ADMIN']}>
              <ClientManagement />
            </ProtectedRoute>
          } />

          {/* ЗАМОВЛЕННЯ (Менеджер) */}
          <Route path="/orders" element={
            <ProtectedRoute role={currentRole} allowedRoles={['MANAGER', 'ADMIN']}>
              <OrderManagement />
            </ProtectedRoute>
          } />

          {/* ЖУРНАЛ ТО (Технік) */}
          <Route path="/maintenance" element={
            <ProtectedRoute role={currentRole} allowedRoles={['TECH']}>
              <TechDashboard />
            </ProtectedRoute>
          } />

          {/* ФІНАНСОВИЙ ДАШБОРД (Тільки Адмін) */}
          <Route path="/finance" element={
            <ProtectedRoute role={currentRole} allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* 404 - Якщо ввели неіснуючий URL */}
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </main>

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}

// 3. Головний обгортач (Router)
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;