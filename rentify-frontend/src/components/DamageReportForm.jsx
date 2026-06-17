import React, { useState } from 'react';
import { reportDamage } from '../services/api';
import { toast } from 'react-toastify';

export default function DamageReportForm({ orderId, onClose, onReportSuccess }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await reportDamage(orderId, {
                damageDescription: description,
                penaltyAmount: amount
            });
            toast.success("Акт пошкодження створено успішно! 🎉");
            onReportSuccess(); // Оновити список після успіху
            onClose();
        } catch (error) {
            toast.error("Помилка при створенні акту");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#111318] p-8 rounded-3xl border border-white/10 w-full max-w-md">
                <h2 className="text-2xl font-black text-white mb-4">Фіксація пошкоджень</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        className="w-full p-4 bg-[#1a1f2a] text-white rounded-xl border border-white/10 outline-none"
                        placeholder="Опис пошкоджень..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input 
                        type="number"
                        className="w-full p-4 bg-[#1a1f2a] text-white rounded-xl border border-white/10 outline-none"
                        placeholder="Сума штрафу (грн)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-700 text-white rounded-xl">Скасувати</button>
                        <button type="submit" className="flex-1 py-3 bg-[#ff204e] text-white rounded-xl font-bold">Зберегти акт</button>
                    </div>
                </form>
            </div>
        </div>
    );
}