import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaFlagCheckered } from 'react-icons/fa';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await getAllOrders();
            // Сортуємо: спочатку нові (великий ID)
            setOrders(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            toast.error("Не вдалося завантажити замовлення");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus, itemName) => {
        try {
            await updateOrderStatus(id, newStatus);
            toast.success(`Статус оновлено: ${newStatus}`);
            loadOrders(); // Оновлюємо таблицю
        } catch (error) {
            toast.error("Помилка зміни статусу");
        }
    };

    // Допоміжна функція для кольорів статусів
    const getStatusBadge = (status) => {
        switch(status) {
            case 'PENDING': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold">Очікує</span>;
            case 'ACTIVE': return <span className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full text-xs font-bold">В оренді</span>;
            case 'COMPLETED': return <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-bold">Завершено</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-bold">Відхилено</span>;
            default: return <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs">{status}</span>;
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Завантаження бази замовлень...</div>;

    return (
        <div className="max-w-[1320px] mx-auto p-4">
            <h2 className="text-3xl font-bold text-white mb-8">Керування Замовленнями</h2>
            
            <div className="bg-[#111318] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#1a1f2a] text-slate-400 text-xs uppercase tracking-widest border-b border-white/10">
                                <th className="p-4 font-bold">ID</th>
                                <th className="p-4 font-bold">Предмет</th>
                                <th className="p-4 font-bold">Дата видачі</th>
                                <th className="p-4 font-bold">Сума</th>
                                <th className="p-4 font-bold">Статус</th>
                                <th className="p-4 font-bold text-center">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Замовлень ще немає</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono">#{order.id}</td>
                                        <td className="p-4 text-white font-bold">
                                            {order.inventoryItem?.name || 'Предмет видалено'}
                                            <div className="text-xs text-slate-500 font-normal">SN: {order.inventoryItem?.serialNumber}</div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {order.startTime ? order.startTime.substring(0, 16).replace('T', ' ') : 'Не вказано'}
                                        </td>
                                        <td className="p-4 text-[#f39c12] font-black">{order.totalPrice || 0} грн</td>
                                        <td className="p-4">{getStatusBadge(order.status || 'PENDING')}</td>
                                        
                                        {/* Кнопки керування */}
                                        <td className="p-4 flex justify-center gap-2">
                                            {(order.status === 'PENDING' || !order.status) && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'ACTIVE')} className="p-2 bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all" title="Схвалити та видати">
                                                        <FaCheck />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'REJECTED')} className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all" title="Відхилити">
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            
                                            {order.status === 'ACTIVE' && (
                                                <button onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} className="px-4 py-2 bg-[#ff204e]/20 hover:bg-[#ff204e] text-[#ff204e] hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                                                    <FaFlagCheckered /> Завершити оренду
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}