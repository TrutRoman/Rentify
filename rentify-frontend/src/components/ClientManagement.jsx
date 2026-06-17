import React, { useState, useEffect } from 'react';
import { getAllClients, toggleBlockStatus } from '../services/api';
import { toast } from 'react-toastify';

export default function ClientManagement() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await getAllClients();
            setClients(data);
        } catch (error) {
            toast.error("Не вдалося завантажити список клієнтів");
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        try {
            await toggleBlockStatus(id, !currentStatus);
            toast.success(`Статус клієнта успішно змінено!`);
            // Оновлюємо статус локально, щоб не робити зайвий запит на сервер
            setClients(clients.map(client => 
                client.id === id ? { ...client, isBlocked: !currentStatus } : client
            ));
        } catch (error) {
            toast.error("Не вдалося змінити статус клієнта");
        }
    };

    if (loading) {
        return <div className="text-white text-center p-10">Завантаження...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-8">Керування клієнтами</h2>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200">
                                <th className="p-4 font-bold">ПІБ</th>
                                <th className="p-4 font-bold">Телефон</th>
                                <th className="p-4 font-bold">Статус</th>
                                <th className="p-4 font-bold">Дія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        Клієнтів ще немає в базі
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="border-b border-slate-200/50 hover:bg-slate-50 transition-colors">
                                        {/* ПІБ - обов'язково client.fullName */}
                                        <td className="p-4 text-slate-800 font-bold">
                                            {client.fullName || 'Ім\'я не вказано'}
                                        </td>
                                        
                                        {/* Телефон - обов'язково client.phone */}
                                        <td className="p-4 text-slate-500 font-medium">
                                            {client.phone || 'Телефон не вказано'}
                                        </td>
                                        
                                        {/* Статус */}
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${!client.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {!client.isBlocked ? 'Активний' : 'Заблокований'}
                                            </span>
                                        </td>
                                        
                                        {/* Кнопка дії */}
                                        <td className="p-4">
                                            <button 
                                                onClick={() => toggleBlock(client.id, client.isBlocked)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${!client.isBlocked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {!client.isBlocked ? 'Заблокувати' : 'Розблокувати'}
                                            </button>
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