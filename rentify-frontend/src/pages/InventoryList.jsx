import React, { useState, useEffect } from 'react';
import { getAvailableInventory, createOrder, sendSystemNotification, addInventoryItem, deleteInventoryItem, getBookedDatesForItem } from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaRegClock, FaTrash, FaPlus, FaShoppingCart, FaTimes, FaInfoCircle } from 'react-icons/fa';
import './InventoryList.css'; 

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [filter, setFilter] = useState('ALL'); 
    const [searchQuery, setSearchQuery] = useState(''); 

    // --- СТАНИ КОШИКА (КЛІЄНТ) ---
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Стани для модалки вибору дати (Бронювання)
    const [orderModal, setOrderModal] = useState({ isOpen: false, item: null });
    const [rentalDate, setRentalDate] = useState('');
    const [rentalTime, setRentalTime] = useState('');
    const [rentalDuration, setRentalDuration] = useState(1);
    const [bookedDates, setBookedDates] = useState([]); 

    // НОВИЙ СТАН: Вікно деталей предмета (Опис)
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, item: null });

    // --- СТАНИ АДМІНА ---
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '', type: 'VEHICLE', serialNumber: '', pricePerHour: '', pricePerDay: '', imageUrl: '', description: ''
    });

    const role = localStorage.getItem('role') || 'GUEST';

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await getAvailableInventory();
            setInventory(data);
        } catch (error) {
            console.error("Помилка завантаження інвентарю", error);
        }
    };

    // --- ФУНКЦІЇ АДМІНА ---
    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await addInventoryItem(newItem);
            toast.success("Новий предмет успішно додано до бази! ✅");
            setAdminModalOpen(false);
            setNewItem({ name: '', type: 'VEHICLE', serialNumber: '', pricePerHour: '', pricePerDay: '', imageUrl: '', description: '' });
            loadInventory();
        } catch (error) {
            toast.error("Не вдалося додати предмет.");
        }
    };

    const handleDeleteItem = async (id, e) => {
        e.stopPropagation(); // Щоб клік на видалення не відкривав модалку деталей
        if (window.confirm("Ви впевнені, що хочете назавжди видалити цей предмет?")) {
            try {
                await deleteInventoryItem(id);
                toast.success("Предмет видалено! 🗑️");
                loadInventory();
            } catch (error) {
                toast.error("Помилка видалення.");
            }
        }
    };

    // --- ФУНКЦІЇ МЕНЕДЖЕРА ---
    const handleIssue = async (itemId) => {
        const clientPhone = window.prompt("Введіть номер телефону клієнта для перевірки:");
        if (!clientPhone) return;

        try {
            await createOrder({ inventoryItem: { id: itemId }, managerId: 1, clientId: 1 });
            toast.success("Оренда успішно оформлена! 🎉");
            loadInventory();
        } catch (error) {
            toast.error("Помилка бази даних! Спробуйте ще раз.");
        }
    };

    // --- ФУНКЦІЇ КЛІЄНТА ---
    const handleOpenOrderModal = async (item) => {
        const today = new Date().toISOString().split('T')[0];
        setRentalDate(today);
        setRentalTime('12:00');
        setRentalDuration(1);
        
        try {
            const dates = await getBookedDatesForItem(item.id);
            setBookedDates(dates || []);
        } catch (error) {
            setBookedDates([]);
        }

        setOrderModal({ isOpen: true, item: item });
    };

    const handleAddToCart = () => {
        if (bookedDates.includes(rentalDate)) {
            toast.error("❌ Цей предмет вже заброньовано на обрану дату! Оберіть іншу.");
            return;
        }

        const item = orderModal.item;
        const cartItem = {
            ...item,
            cartId: Date.now(), 
            rentalDate,
            rentalTime,
            rentalDuration,
            totalPrice: item.pricePerHour * rentalDuration
        };

        setCart([...cart, cartItem]);
        toast.success(`${item.name} додано в кошик! 🛒`);
        setOrderModal({ isOpen: false, item: null });
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            for (const item of cart) {
                await createOrder({
                    inventoryItem: { id: item.id },
                    clientId: 1, 
                    managerId: 1,
                    startTime: `${item.rentalDate}T${item.rentalTime}:00`,
                    status: 'PENDING',
                    totalPrice: item.totalPrice
                });
            }

            let msg = `🛒 НОВЕ ЗАМОВЛЕННЯ (${cart.length} од.):\n`;
            cart.forEach(item => {
                msg += `🔸 ${item.name} | 📅 ${item.rentalDate} о ${item.rentalTime}\n`;
            });
            await sendSystemNotification('/topic/manager', msg);

            toast.success("Замовлення успішно оформлено! Очікуйте підтвердження менеджера. 🎉");
            setCart([]); 
            setIsCartOpen(false); 
        } catch (error) {
            toast.error("Помилка бази даних! Замовлення не збережено.");
        }
    };

    const cartTotalSum = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const filteredInventory = safeInventory.filter(item => {
        const matchesCategory = filter === 'ALL' || item.type === filter;
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <section className="max-w-[1320px] mx-auto px-4 py-10 relative">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-white brand-display text-3xl font-bold">Доступний парк інвентарю</h2>
                
                {role === 'ADMIN' && (
                    <button onClick={() => setAdminModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-[#ff204e] hover:bg-[#da103c] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#ff204e]/30">
                        <FaPlus /> Додати предмет
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#111318] p-4 rounded-2xl border border-white/10">
                <input type="text" placeholder="🔍 Пошук за назвою або серійним номером..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-4 bg-[#1a1f2a] rounded-xl border border-white/10 text-white outline-none focus:border-[#ff204e] transition-all" />
                
                <select className="p-4 rounded-xl bg-[#1a1f2a] border border-white/10 text-white outline-none cursor-pointer" onChange={(e) => setFilter(e.target.value)}>
                    <option value="ALL">Всі категорії</option>
                    <option value="VEHICLE">Транспорт</option>
                    <option value="GEAR">Спорядження</option>
                    <option value="PHOTO">Фото та Техніка</option>
                    <option value="TOOLS">Інструменти</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredInventory.map(item => (
                    <div className="glass-surface p-6 rounded-2xl border border-white/10 hover:border-[#ff204e]/50 transition-all group flex flex-col" key={item.id}>
                        {/* Клікабельна картинка для перегляду деталей */}
                        <div 
                            className="h-48 mb-4 overflow-hidden rounded-xl flex-shrink-0 relative cursor-pointer"
                            onClick={() => setDetailsModal({ isOpen: true, item: item })}
                        >
                            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={`/images/${item.imageUrl || 'default.jpg'}`} alt={item.name} />
                            
                            {/* Оверлей при наведенні */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <span className="flex items-center gap-2 text-white font-bold px-4 py-2 border border-white/20 rounded-xl bg-[#111318]/80 shadow-lg">
                                    <FaInfoCircle /> Детальніше
                                </span>
                            </div>

                            {role === 'ADMIN' && (
                                <button onClick={(e) => handleDeleteItem(item.id, e)} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-[#ff204e] text-white rounded-lg flex items-center justify-center transition-colors z-10" title="Видалити">
                                    <FaTrash size={12} />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">{item.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">SN: {item.serialNumber}</p>
                        </div>
                        
                        <div className="flex justify-between items-end mt-auto pt-4">
                            <div className="flex flex-col">
                                <span className="text-[#ff204e] font-black text-xl leading-none mb-1">
                                    {item.pricePerHour} <span className="text-sm font-medium">грн/год</span>
                                </span>
                                <span className="text-slate-400 text-sm font-medium">{item.pricePerDay || item.pricePerHour * 10} грн/доба</span>
                            </div>
                            
                            {role === 'MANAGER' && (
                                <button className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 hover:scale-105 transition-all shadow-lg" onClick={() => handleIssue(item.id)}>Видати</button>
                            )}

                            {role === 'CLIENT' && (
                                <button className="px-5 py-2.5 bg-[#ff204e] text-white font-bold rounded-xl hover:bg-[#da103c] hover:scale-105 transition-all shadow-lg shadow-[#ff204e]/30" onClick={() => handleOpenOrderModal(item)}>
                                    Замовити
                                </button>
                            )}

                            {role === 'GUEST' && (
                                <button className="px-4 py-2.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-not-allowed" disabled>Увійдіть для<br/>замовлення</button>
                            )}
                            
                            {role === 'ADMIN' && (
                                <span className="px-4 py-2 bg-white/10 text-slate-300 text-xs font-bold rounded-xl">В наявності</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* === ПЛАВАЮЧА КНОПКА КОШИКА ДЛЯ КЛІЄНТА === */}
            {role === 'CLIENT' && (
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-10 right-10 w-16 h-16 bg-[#ff204e] hover:bg-[#da103c] rounded-full shadow-[0_0_20px_rgba(255,32,78,0.4)] flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 z-[5000]"
                >
                    <FaShoppingCart />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-[#ff204e] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#ff204e]">
                            {cart.length}
                        </span>
                    )}
                </button>
            )}

            {/* === БІЧНА ПАНЕЛЬ КОШИКА === */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[9999] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#111318] h-full shadow-2xl flex flex-col border-l border-white/10 slide-in-right">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FaShoppingCart className="text-[#ff204e] text-2xl" />
                                <h3 className="text-white text-2xl font-black">Кошик</h3>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-2xl p-2"><FaTimes /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <FaShoppingCart className="text-6xl mb-4 opacity-20" />
                                    <p className="font-bold text-lg">Кошик порожній</p>
                                    <p className="text-sm mt-2">Додайте щось із каталогу</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartId} className="bg-[#1a1f2a] border border-white/5 p-4 rounded-2xl relative group">
                                        <button onClick={() => removeFromCart(item.cartId)} className="absolute top-3 right-3 text-slate-500 hover:text-[#ff204e] transition-colors"><FaTrash /></button>
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={`/images/${item.imageUrl || 'default.jpg'}`} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm leading-tight pr-5">{item.name}</p>
                                                <p className="text-[#f39c12] font-black text-sm mt-1">{item.totalPrice} грн</p>
                                                <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                                                    <p>📅 {item.rentalDate} о {item.rentalTime}</p>
                                                    <p>⏳ Тривалість: {item.rentalDuration} год.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-[#151821]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-400 font-bold">Разом до сплати:</span>
                                    <span className="text-white text-2xl font-black">{cartTotalSum} грн</span>
                                </div>
                                <button onClick={handleCheckout} className="w-full py-4 bg-[#ff204e] hover:bg-[#da103c] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-[#ff204e]/20 transition-all transform hover:-translate-y-0.5">
                                    Оформити замовлення
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* === МОДАЛКА АДМІНА (ДОДАВАННЯ ПРЕДМЕТУ) === */}
            {adminModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setAdminModalOpen(false)}>
                    <div className="bg-[#111318] border border-white/10 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white text-2xl font-black mb-6">Додати новий інвентар</h3>
                        
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Назва предмету</label>
                                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none" placeholder="Напр. Електросамокат Xiaomi"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Категорія</label>
                                    <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none">
                                        <option value="VEHICLE">Транспорт</option>
                                        <option value="GEAR">Спорядження</option>
                                        <option value="PHOTO">Фото та Техніка</option>
                                        <option value="TOOLS">Інструменти</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Серійний номер</label>
                                    <input required type="text" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none" placeholder="Напр. SN-12345"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Ціна за годину (грн)</label>
                                    <input required type="number" value={newItem.pricePerHour} onChange={e => setNewItem({...newItem, pricePerHour: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none" placeholder="100"/>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Ціна за добу (грн)</label>
                                    <input required type="number" value={newItem.pricePerDay} onChange={e => setNewItem({...newItem, pricePerDay: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none" placeholder="800"/>
                                </div>
                            </div>

                            {/* НОВЕ ПОЛЕ: Опис предмета */}
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Детальний опис</label>
                                <textarea rows="3" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none custom-scrollbar" placeholder="Характеристики, комплектація..."></textarea>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Назва картинки (URL)</label>
                                <input type="text" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} className="w-full bg-[#1a1f2a] border border-white/10 text-white p-3 rounded-xl focus:border-[#ff204e] outline-none" placeholder="напр. scooter.jpg"/>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setAdminModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">Скасувати</button>
                                <button type="submit" className="flex-1 py-3 bg-[#ff204e] hover:bg-[#da103c] text-white font-bold rounded-xl transition-all">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === НОВА МОДАЛКА: ДЕТАЛІ ПРЕДМЕТА (ДЛЯ ВСІХ) === */}
            {detailsModal.isOpen && detailsModal.item && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setDetailsModal({ isOpen: false, item: null })}>
                    <div className="bg-[#111318] border border-white/10 p-0 rounded-[2rem] w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDetailsModal({ isOpen: false, item: null })} className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-[#ff204e] text-white rounded-full flex items-center justify-center text-xl transition-colors z-10">&times;</button>
                        
                        {/* Ліва частина - Велике фото */}
                        <div className="md:w-1/2 h-[250px] md:h-auto bg-[#1a1f2a] relative border-r border-white/10">
                            <img src={`/images/${detailsModal.item.imageUrl || 'default.jpg'}`} alt={detailsModal.item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/10">
                                {detailsModal.item.type === 'VEHICLE' ? 'Транспорт' : detailsModal.item.type === 'GEAR' ? 'Спорядження' : detailsModal.item.type === 'PHOTO' ? 'Фото/Відео' : 'Інструменти'}
                            </div>
                        </div>

                        {/* Права частина - Інформація */}
                        <div className="md:w-1/2 p-8 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
                            <h3 className="text-white text-2xl font-black mb-1">{detailsModal.item.name}</h3>
                            <p className="text-slate-400 text-sm font-mono mb-6">Серійний номер: {detailsModal.item.serialNumber}</p>
                            
                            <div className="flex-1 mb-8">
                                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Опис та характеристики:</h4>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {detailsModal.item.description ? detailsModal.item.description : 'Опис для цього предмета поки не додано. Ви можете звернутися до менеджера для уточнення характеристик.'}
                                </p>
                            </div>

                            <div className="bg-[#1a1f2a] p-4 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">За годину</p>
                                    <p className="text-[#ff204e] font-black text-xl leading-none">{detailsModal.item.pricePerHour} <span className="text-sm">грн</span></p>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">За добу</p>
                                    <p className="text-white font-black text-xl leading-none">{detailsModal.item.pricePerDay || detailsModal.item.pricePerHour * 10} <span className="text-sm">грн</span></p>
                                </div>
                            </div>

                            {/* Кнопка швидкого замовлення для клієнта */}
                            {role === 'CLIENT' && (
                                <button 
                                    onClick={() => {
                                        setDetailsModal({ isOpen: false, item: null });
                                        handleOpenOrderModal(detailsModal.item);
                                    }}
                                    className="w-full py-4 bg-[#ff204e] hover:bg-[#da103c] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-[#ff204e]/20 transition-all transform hover:-translate-y-0.5"
                                >
                                    Оформити оренду
                                </button>
                            )}
                            {role === 'GUEST' && (
                                <p className="text-center text-slate-500 text-xs font-bold uppercase">Увійдіть, щоб замовити</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === МОДАЛКА ВИБОРУ ДАТИ ДЛЯ КЛІЄНТА (З ПЕРЕВІРКОЮ) === */}
            {orderModal.isOpen && orderModal.item && (
                 <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setOrderModal({ isOpen: false, item: null })}>
                    <div className="bg-[#111318] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-white text-2xl font-black leading-tight">Параметри оренди</h3>
                                <p className="text-[#f39c12] font-bold text-sm mt-1">{orderModal.item.name}</p>
                            </div>
                            <button onClick={() => setOrderModal({ isOpen: false, item: null })} className="w-8 h-8 bg-white/5 hover:bg-[#ff204e] text-slate-400 hover:text-white rounded-xl flex items-center justify-center text-xl transition-colors">&times;</button>
                        </div>
                        <div className="space-y-5">
                            
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Дата початку оренди</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaCalendarAlt className="text-slate-400" /></div>
                                    <input 
                                        type="date" 
                                        value={rentalDate} 
                                        onChange={(e) => setRentalDate(e.target.value)} 
                                        className={`w-full bg-[#1a1f2a] border ${bookedDates.includes(rentalDate) ? 'border-[#ff204e] text-[#ff204e] ring-1 ring-[#ff204e]' : 'border-white/10 text-white'} text-sm rounded-xl focus:ring-2 focus:ring-[#f39c12] focus:border-transparent block pl-11 p-3.5 transition-all custom-calendar-icon`}
                                    />
                                </div>
                                {bookedDates.length > 0 && (
                                    <div className="mt-3 p-3 bg-[#ff204e]/10 border border-[#ff204e]/30 rounded-xl">
                                        <p className="text-[#ff204e] text-xs font-bold mb-1">⚠️ Вже заброньовано на ці дати:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {bookedDates.map((date, idx) => (
                                                <span key={idx} className="bg-[#ff204e]/20 text-[#ff204e] px-2 py-0.5 rounded text-[10px] font-mono">
                                                    {date}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Час видачі</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaRegClock className="text-slate-400" /></div>
                                    <input type="time" value={rentalTime} onChange={(e) => setRentalTime(e.target.value)} className="w-full bg-[#1a1f2a] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-[#f39c12] focus:border-transparent block pl-11 p-3.5 transition-all custom-clock-icon"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">На скільки годин?</label>
                                <div className="flex items-center gap-3 bg-[#1a1f2a] border border-white/10 rounded-xl p-2">
                                    <button onClick={() => setRentalDuration(Math.max(1, rentalDuration - 1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors">-</button>
                                    <div className="flex-1 text-center text-white font-bold text-lg">{rentalDuration} {rentalDuration === 1 ? 'година' : rentalDuration > 4 ? 'годин' : 'години'}</div>
                                    <button onClick={() => setRentalDuration(rentalDuration + 1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400 text-sm">Орієнтовна вартість:</span>
                                <span className="text-[#f39c12] text-xl font-black">{orderModal.item.pricePerHour ? (orderModal.item.pricePerHour * rentalDuration) : '0'} грн</span>
                            </div>
                            
                            <button onClick={handleAddToCart} className="w-full py-4 bg-gradient-to-r from-[#f39c12] to-[#e67e22] hover:from-[#e67e22] hover:to-[#d35400] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-[#f39c12]/20 transition-all transform hover:-translate-y-0.5">
                                Додати в кошик
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default InventoryList;