import React, { useState, useEffect } from 'react';
import { getClientOrders } from '../services/api';
import { toast } from 'react-toastify';
import { FaBoxOpen, FaRegClock, FaCheckCircle, FaTimesCircle, FaFlagCheckered } from 'react-icons/fa';

export default function ClientDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Отримуємо ім'я користувача для привітання
    const userName = localStorage.getItem('userName') || 'Клієнт';
    // Тимчасово використовуємо ID 1, оскільки під час додавання в кошик ми ставили clientId: 1
    const clientId = 1; 

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await getClientOrders(clientId);
            // Сортуємо: нові зверху
            setOrders(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            toast.error("Не вдалося завантажити історію замовлень");
        } finally {
            setLoading(false);
        }
    };

    // Дизайн статусів для Клієнта
    const getStatusDisplay = (status) => {
        switch(status) {
            case 'PENDING': 
                return { icon: <FaRegClock />, text: 'Очікує підтвердження', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
            case 'ACTIVE': 
                return { icon: <FaCheckCircle />, text: 'В оренді', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
            case 'COMPLETED': 
                return { icon: <FaFlagCheckered />, text: 'Завершено', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
            case 'REJECTED': 
                return { icon: <FaTimesCircle />, text: 'Відхилено', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
            default: 
                return { icon: <FaBoxOpen />, text: status || 'Невідомо', color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' };
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Завантаження кабінету...</div>;

    return (
        <section className="max-w-[1000px] mx-auto px-4 py-10 relative">
            
            {/* Хедер профілю */}
            <div className="bg-[#111318] border border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">Привіт, {userName}! 👋</h2>
                    <p className="text-slate-400">Тут знаходиться вся історія ваших замовлень та бронювань.</p>
                </div>
                <div className="bg-[#1a1f2a] px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ff204e]/20 text-[#ff204e] rounded-xl flex items-center justify-center text-xl font-black border border-[#ff204e]/30">
                        {orders.length}
                    </div>
                    <div>
                        <p className="text-white font-bold">Всього замовлень</p>
                        <p className="text-slate-500 text-sm">За весь час</p>
                    </div>
                </div>
            </div>

            {/* Список замовлень */}
            <h3 className="text-xl font-bold text-white mb-6">Ваші бронювання</h3>
            
            {orders.length === 0 ? (
                <div className="bg-[#111318] border border-white/10 rounded-3xl p-12 text-center">
                    <FaBoxOpen className="text-6xl text-slate-600 mx-auto mb-4" />
                    <p className="text-white font-bold text-lg">У вас ще немає замовлень</p>
                    <p className="text-slate-500 text-sm mt-2">Перейдіть до каталогу, щоб знайти потрібний інвентар.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const statusConfig = getStatusDisplay(order.status);
                        
                        return (
                            <div key={order.id} className="bg-[#111318] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                                
                                {/* Картинка предмета */}
                                <div className="w-24 h-24 bg-[#1a1f2a] rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                    <img 
                                        src={`/images/${order.inventoryItem?.imageUrl || 'default.jpg'}`} 
                                        alt={order.inventoryItem?.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                
                                {/* Інформація */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h4 className="text-white font-bold text-lg">{order.inventoryItem?.name || 'Предмет недоступний'}</h4>
                                        <span className="text-slate-500 text-xs font-mono bg-white/5 px-2 py-1 rounded-md">
                                            SN: {order.inventoryItem?.serialNumber}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
                                        <div>
                                            <p className="text-slate-500 mb-1">Початок оренди</p>
                                            <p className="text-white font-medium">
                                                {order.startTime ? order.startTime.substring(0, 16).replace('T', ' о ') : 'Не вказано'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 mb-1">Загальна вартість</p>
                                            <p className="text-[#f39c12] font-black">{order.totalPrice || 0} грн</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 mb-1">Номер замовлення</p>
                                            <p className="text-white font-mono">#{order.id}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Статус */}
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} md:w-48 justify-center`}>
                                    {statusConfig.icon}
                                    <span className="font-bold text-sm tracking-wide">{statusConfig.text}</span>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>
            )}
            
        </section>
    );
}