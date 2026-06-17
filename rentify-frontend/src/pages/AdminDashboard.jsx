import React, { useState, useEffect } from 'react';
import { getTransactions, logTransaction } from '../services/api';
import { toast } from 'react-toastify';
import { FaChartLine, FaArrowDown, FaArrowUp, FaWallet, FaPlus } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Стан для ручного додавання транзакції (наприклад, купівля нового інвентарю)
    const [newTx, setNewTx] = useState({ amount: '', type: 'INCOME', description: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            toast.error("Помилка завантаження фінансів");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await logTransaction({
                amount: parseFloat(newTx.amount),
                type: newTx.type,
                description: newTx.description
            });
            toast.success("Транзакцію успішно додано! 💰");
            setShowModal(false);
            setNewTx({ amount: '', type: 'INCOME', description: '' });
            loadData();
        } catch (error) {
            toast.error("Помилка збереження транзакції");
        }
    };

    // --- ПІДРАХУНКИ ---
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Дані для графіка Recharts
    const chartData = [
        { name: 'Прибуток', value: totalIncome, color: '#2ecc71' },
        { name: 'Витрати', value: totalExpense, color: '#e74c3c' }
    ];

    if (loading) return <div className="text-white text-center mt-20">Завантаження фінансів...</div>;

    return (
        <section className="max-w-[1320px] mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center text-xl border border-blue-500/30">
                        <FaChartLine />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white">Фінансовий Дашборд</h2>
                        <p className="text-slate-400 text-sm mt-0.5">Аналітика прибутковості парку інвентарю</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                >
                    <FaPlus /> Додати запис
                </button>
            </div>

            {/* КАРТКИ З ЦИФРАМИ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111318] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><FaArrowUp className="text-6xl text-green-500" /></div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Загальний дохід</p>
                    <p className="text-3xl font-black text-green-400">{totalIncome.toLocaleString()} ₴</p>
                </div>
                <div className="bg-[#111318] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><FaArrowDown className="text-6xl text-red-500" /></div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Витрати (Ремонт/Закупки)</p>
                    <p className="text-3xl font-black text-red-400">{totalExpense.toLocaleString()} ₴</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900 to-[#111318] border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><FaWallet className="text-6xl text-blue-300" /></div>
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Чистий прибуток</p>
                    <p className="text-4xl font-black text-white">{netProfit.toLocaleString()} ₴</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ГРАФІК (Ліва колонка) */}
                <div className="lg:col-span-1 bg-[#111318] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-white font-bold mb-6 w-full text-left">Співвідношення</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a1f2a', border: 'none', borderRadius: '10px', color: 'white'}} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ТАБЛИЦЯ ІСТОРІЇ (Права колонка) */}
                <div className="lg:col-span-2 bg-[#111318] border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-white font-bold">Останні транзакції</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[350px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1a1f2a] text-slate-400 text-xs uppercase tracking-widest">
                                    <th className="p-4 font-bold">Дата</th>
                                    <th className="p-4 font-bold">Опис</th>
                                    <th className="p-4 font-bold text-right">Сума</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-slate-500">Транзакцій ще немає</td></tr>
                                ) : (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm">
                                                {tx.date ? tx.date.substring(0, 16).replace('T', ' ') : ''}
                                            </td>
                                            <td className="p-4 text-white text-sm font-medium">{tx.description}</td>
                                            <td className={`p-4 text-right font-black ${tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} ₴
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* МОДАЛКА РУЧНОГО ДОДАВАННЯ */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111318] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white text-2xl font-black mb-6">Нова транзакція</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Тип операції</label>
                                <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-blue-500 outline-none">
                                    <option value="INCOME">🟢 Прибуток (Оренда, Штрафи)</option>
                                    <option value="EXPENSE">🔴 Витрата (Ремонт, Закупівля)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Сума (грн)</label>
                                <input required type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-blue-500 outline-none" placeholder="Напр. 1500"/>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Опис / Коментар</label>
                                <input required type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-blue-500 outline-none" placeholder="Оренда електросамоката..."/>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">Скасувати</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}