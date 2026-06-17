import React, { useState, useEffect } from 'react';
import { getActiveMaintenanceLogs, resolveMaintenanceLog, sendSystemNotification } from '../services/api';
import { toast } from 'react-toastify';
import DamageReportForm from '../components/DamageReportForm';

function TechDashboard() {
    const [logs, setLogs] = useState([]); 
    const [repairingId, setRepairingId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [damageOrderId, setDamageOrderId] = useState(null);

    // Нові стани для введення вартості та коментаря перед стартом прогрес-бару
    const [activeActionId, setActiveActionId] = useState(null);
    const [repairCost, setRepairCost] = useState('');
    const [techComment, setTechComment] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await getActiveMaintenanceLogs();
            setLogs(data);
        } catch (error) {
            console.error("Помилка завантаження СТО", error);
        }
    };

    const handlePrepareRepair = (logId) => {
        setActiveActionId(logId);
        setRepairCost('');
        setTechComment('');
    };

    const handleStartRepair = (logId) => {
        if (!repairCost || isNaN(repairCost)) {
            toast.error("Будь ласка, вкажіть вартість ремонту!");
            return;
        }

        setActiveActionId(null);
        setRepairingId(logId);
        setProgress(0);
        let currentProgress = 0;
        
        const timer = setInterval(() => {
            currentProgress += 2; 
            setProgress(currentProgress);
            
            if (currentProgress >= 100) {
                clearInterval(timer);
                finishRepair(logId);
            }
        }, 50);
    };

    const finishRepair = async (logId) => {
        try {
            const repairedLog = logs.find(l => l.id === logId);
            const item = repairedLog?.inventoryItem;
            
            await resolveMaintenanceLog(logId, parseFloat(repairCost), techComment);
            
            if (item) {
                await sendSystemNotification(
                    '/topic/manager', 
                    `✅ Технік полагодив майно: ${item.name} (SN: ${item.serialNumber}). Витрати: ${repairCost} грн.`
                );
            }

            toast.success("ТО пройдено, майно знову доступне! 🛠️");
            setRepairingId(null);
            setProgress(0);
            loadLogs();
        } catch (error) {
            toast.error("Помилка бази даних при ремонті.");
            setRepairingId(null);
        }
    };

    return (
        <section className="max-w-[1320px] mx-auto px-4 py-10">
            <h2 className="text-white brand-display text-3xl font-bold mb-8">Журнал технічного обслуговування (ТО)</h2>
            
            {logs.length === 0 ? (
                <div className="glass-surface p-10 rounded-2xl border border-white/10 text-center">
                    <p className="text-slate-400 text-lg">Немає зламаного майна. Все працює ідеально! ✅</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {logs.map(log => {
                        const item = log.inventoryItem;
                        if (!item) return null;

                        return (
                            <div className="glass-surface p-6 rounded-2xl border border-[#f39c12]/50 relative flex flex-col justify-between" key={log.id}>
                                <div>
                                    <div className="absolute top-0 right-0 bg-[#f39c12] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                        Потребує ремонту
                                    </div>
                                    
                                    <h3 className="text-white text-xl font-bold mb-1 mt-2">{item.name}</h3>
                                    <p className="text-slate-400 text-sm mb-3">SN: {item.serialNumber}</p>
                                    
                                    <div className="bg-[#1a1f2a] p-3 rounded-xl border border-white/5 text-sm text-slate-300 mb-6">
                                        <span className="block text-[#f39c12] text-[10px] font-bold uppercase tracking-wider mb-1">Причина звернення:</span>
                                        {log.issueDescription || "Планове ТО"}
                                    </div>
                                </div>
                                
                                {repairingId === log.id ? (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-[#f39c12]">Йде ремонт...</span>
                                            <span className="text-white">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-[#1a1f2a] rounded-full h-2.5 overflow-hidden border border-white/5">
                                            <div 
                                                className="bg-[#f39c12] h-2.5 rounded-full transition-all duration-75 ease-linear" 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : activeActionId === log.id ? (
                                    <div className="mt-4 space-y-3 bg-black/20 p-3 rounded-xl">
                                        <input 
                                            type="number" 
                                            placeholder="Вартість ремонту (грн)" 
                                            value={repairCost} 
                                            onChange={e => setRepairCost(e.target.value)} 
                                            className="w-full bg-[#1a1f2a] border border-white/10 text-white p-2.5 text-sm rounded-lg outline-none focus:border-[#f39c12]" 
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Коментар (що замінили?)" 
                                            value={techComment} 
                                            onChange={e => setTechComment(e.target.value)} 
                                            className="w-full bg-[#1a1f2a] border border-white/10 text-white p-2.5 text-sm rounded-lg outline-none focus:border-[#f39c12]" 
                                        />
                                        <div className="flex gap-2 pt-1">
                                            <button 
                                                className="flex-1 py-2 bg-white/5 text-white font-bold text-xs rounded-lg hover:bg-white/10 transition-all"
                                                onClick={() => setActiveActionId(null)}
                                            >
                                                Скасувати
                                            </button>
                                            <button 
                                                className="flex-1 py-2 bg-[#f39c12] text-black font-bold text-xs rounded-lg hover:bg-[#e67e22] transition-all"
                                                onClick={() => handleStartRepair(log.id)}
                                            >
                                                Почати ремонт
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 mt-4">
                                        <button 
                                            className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50" 
                                            onClick={() => handlePrepareRepair(log.id)}
                                            disabled={repairingId !== null}
                                        >
                                            Полагодити
                                        </button>
                                        <button 
                                            className="flex-1 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl hover:bg-red-500/40 transition-all" 
                                            onClick={() => setDamageOrderId(item.activeOrderId || item.id)} 
                                        >
                                            Штраф
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {damageOrderId && (
                <DamageReportForm 
                    orderId={damageOrderId} 
                    onClose={() => setDamageOrderId(null)} 
                    onReportSuccess={() => loadLogs()} 
                />
            )}
        </section>
    );
}

export default TechDashboard;