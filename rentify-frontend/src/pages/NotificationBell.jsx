import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
// і для БД, і для каталогу
import { getNotificationHistory, clearNotificationHistory, getAvailableInventory, sendSystemNotification, createMaintenanceLog } from '../services/api';

function NotificationBell() {
    const [messages, setMessages] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Стани для шорткату Менеджера
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [inventory, setInventory] = useState([]);
    
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!role || role === 'GUEST') return;

        let isMounted = true;

        // Визначаємо, чию історію тягнути (Адмін дивиться канал Менеджера)
        const fetchRole = role === 'ADMIN' ? 'MANAGER' : role;

        // 1. ЗАВАНТАЖУЄМО ІСТОРІЮ З БАЗИ ДАНИХ
        const loadHistory = async () => {
            try {
                const history = await getNotificationHistory(fetchRole);
                if (isMounted) {
                    setMessages(history.map(item => item.message));
                }
            } catch (error) {
                console.error("Не вдалося завантажити історію сповіщень", error);
            }
        };
        loadHistory();

        // 2. ПІДКЛЮЧАЄМО WEBSOCKET ДЛЯ НОВИХ СПОВІЩЕНЬ
        const stompClient = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        stompClient.debug = () => {}; 

        stompClient.connect({}, () => {
            if (!isMounted) {
                stompClient.disconnect();
                return;
            }

            // Визначаємо топік для підписки
            let topic = `/topic/${role.toLowerCase()}`;
            if (role === 'ADMIN') topic = '/topic/manager';

            stompClient.subscribe(topic, (message) => {
                const newMsg = message.body;
                if (role === 'TECH') console.log("🚀 ПРИЛЕТІЛО ПОВІДОМЛЕННЯ ТЕХНІКУ:", newMsg);
                
                setMessages((prev) => prev.includes(newMsg) ? prev : [newMsg, ...prev]);
            });
        });

        return () => {
            isMounted = false;
            if (stompClient !== null) {
                stompClient.disconnect();
            }
        };
    }, [role]);

    // Функція очищення бази та екрану
    const handleClearAll = async () => {
        const clearRole = role === 'ADMIN' ? 'MANAGER' : role;
        try {
            await clearNotificationHistory(clearRole);
            setMessages([]);
            setShowDropdown(false);
        } catch (error) {
            console.error("Помилка очищення", error);
        }
    };

    // Функція відкриття міні-каталогу (для Менеджера)
    const handleOpenCatalog = async () => {
        try {
            const data = await getAvailableInventory();
            setInventory(data);
            setShowCatalogModal(true);
            setShowDropdown(false); 
        } catch (error) {
            toast.error("Помилка завантаження каталогу");
        }
    };

    // Функція відправки повідомлення Техніку
    const handleSendToTech = async (item) => {
        try {
            const description = `Планове ТО предмета через дзвіночок менеджера.`;
            
            // 1. Спочатку створюємо офіційний лог ремонту в MySQL
            await createMaintenanceLog(item.id, description);

            // 2. Потім шлемо повідомлення на екран техніка через сокет
            const msg = `🔧 Потребує ТО: ${item.name} (SN: ${item.serialNumber})`;
            await sendSystemNotification('/topic/tech', msg);
            
            toast.success('Запит успішно внесено в журнал та відправлено техспеціалісту!');
            setShowCatalogModal(false);
        } catch (error) {
            toast.error("Не вдалося створити запис ремонту");
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            
            {/* Кнопка Сповіщень */}
            <div 
                className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white font-medium transition-colors duration-300"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <div style={{ position: 'relative' }}>
                    <FaBell size={22} />
                    {messages.length > 0 && (
                        <span className="absolute -top-2 left-2.5 bg-[#ff204e] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            {messages.length}
                        </span>
                    )}
                </div>
                <span>Сповіщення</span>
            </div>

            {/* Випадаючий список з повідомленнями */}
            {showDropdown && (
                <div className="absolute top-[45px] right-0 w-[320px] bg-[#111318] border border-white/10 rounded-2xl shadow-2xl p-4 text-white z-[1000]">
                    <h4 className="m-0 mb-3 border-b border-white/10 pb-2 text-white font-bold">Нові події</h4>
                    
                    {messages.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center my-4">Немає нових сповіщень</p>
                    ) : (
                        <ul className="list-none p-0 m-0 max-h-[250px] overflow-y-auto">
                            {messages.map((msg, idx) => (
                                <li key={idx} className="p-3 border-b border-white/5 text-sm text-slate-200">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {/* КНОПКА ШОРТКАТУ ТІЛЬКИ ДЛЯ МЕНЕДЖЕРА / АДМІНА */}
                    {(role === 'MANAGER' || role === 'ADMIN') && (
                        <button 
                            onClick={handleOpenCatalog}
                            className="w-full mt-3 py-2.5 bg-[#f39c12]/20 hover:bg-[#f39c12]/40 text-[#f39c12] rounded-xl transition-colors font-bold text-xs uppercase tracking-wider border border-[#f39c12]/30"
                        >
                            🛠️ Запит техспеціалісту
                        </button>
                    )}

                    {/* Кнопка очищення */}
                    {messages.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold text-xs"
                        >
                            Очистити все
                        </button>
                    )}
                </div>
            )}

            {/* МОДАЛКА МІНІ-КАТАЛОГУ */}
            {showCatalogModal && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm flex items-start justify-center p-4 pt-20"
                    onClick={() => setShowCatalogModal(false)} 
                >
                    <div 
                        className="bg-[#111318] border border-white/10 rounded-[2rem] max-w-4xl w-full flex flex-col shadow-2xl relative max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex justify-between items-center p-8 border-b border-white/10">
                            <div>
                                <h3 className="text-white text-2xl font-black">Виберіть предмет для ТО</h3>
                                <p className="text-slate-400 text-sm mt-1">Цей запит буде миттєво надіслано Техспеціалісту</p>
                            </div>
                            <button 
                                onClick={() => setShowCatalogModal(false)} 
                                className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center text-2xl transition-colors"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 pt-8 grid grid-cols-1 gap-3 custom-scrollbar">
                            {inventory.map(item => (
                                <div key={item.id} className="bg-[#1a1f2a] p-4 rounded-xl border border-white/5 flex justify-between items-center hover:border-[#f39c12]/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                                src={`/images/${item.imageUrl || 'default.jpg'}`} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-300" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{item.name}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">SN: {item.serialNumber}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSendToTech(item)}
                                        className="ml-4 px-4 py-2 bg-[#f39c12]/20 text-[#f39c12] font-bold text-xs rounded-lg hover:bg-[#f39c12] transition-colors"
                                    >
                                        Надіслати
                                    </button>
                                </div>
                            ))}
                            {inventory.length === 0 && <p className="text-slate-400 text-center py-6">Каталог порожній</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;