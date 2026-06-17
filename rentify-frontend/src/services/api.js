import axios from 'axios';

// 1. Створюємо єдиний екземпляр для всіх запитів (чистий і правильний конфіг)
const API = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json' // Примусово кажемо відправляти JSON
    }
});

// --- ІНВЕНТАР ТА КАТАЛОГ ---
export const getAvailableInventory = async () => {
    const response = await API.get('/inventory/available');
    return response.data;
};

// --- АВТОРИЗАЦІЯ ТА КЛІЄНТИ ---
export const registerClient = (userData) => API.post('/users/register', userData);

// ВАЖЛИВО: Тепер функція приймає два параметри і сама пакує їх в JSON-об'єкт
export const loginUser = async (phone, password) => {
    const response = await API.post('/auth/login', { phone, password });
    return response.data; 
};

export const getAllClients = async () => {
    const response = await API.get('/users/clients');
    return response.data; // віддаємо чистий масив клієнтів
};
export const toggleBlockStatus = (id, isBlocked) => API.put(`/users/${id}/block`, isBlocked);

// --- ОРЕНДА ТА ЗАМОВЛЕННЯ ---
export const createOrder = (orderData) => API.post('/orders/create', orderData);

export const returnOrder = async (orderId) => {
    const response = await API.put(`/orders/${orderId}/return`);
    return response.data;
};

// --- ТЕХНІК ТА РЕМОНТ ---
export const getMaintenanceItems = async () => {
    const response = await API.get('/inventory/maintenance');
    return response.data;
};

export const reportDamage = async (orderId, reportData) => {
    const response = await API.post(`/orders/${orderId}/report-damage`, reportData);
    return response.data;
};

export const repairItem = async (itemId) => {
    const response = await API.put(`/inventory/${itemId}/repair`);
    return response.data;
};

// --- АДМІН ТА АНАЛІТИКА ---
export const getRentalStats = async () => {
    const response = await API.get('/orders/stats');
    return response.data;
};

// --- КЕРУВАННЯ ЗАМОВЛЕННЯМИ (МЕНЕДЖЕР) ---
export const getAllOrders = async () => {
    const response = await API.get('/orders/all');
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await API.put(`/orders/${id}/status`, status, {
        headers: { 'Content-Type': 'text/plain' } // Відправляємо як чистий текст
    });
    return response.data;
};

// --- КАБІНЕТ КЛІЄНТА ---
export const getClientOrders = async (clientId) => {
    const response = await API.get(`/orders/client/${clientId}`);
    return response.data;
};

// Отримання зайнятих дат для конкретного предмету
export const getBookedDatesForItem = async (itemId) => {
    const response = await API.get(`/orders/item/${itemId}/booked-dates`);
    return response.data;
};

// --- СИСТЕМНІ СПОВІЩЕННЯ (WebSockets Bridge) ---
export const sendSystemNotification = async (topic, message) => {
    const response = await API.post(`/notifications/send?topic=${topic}`, message, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
};

// --- СПОВІЩЕННЯ (БАЗА ДАНИХ) ---
export const getNotificationHistory = async (role) => {
    const response = await API.get(`/notifications/${role}`);
    return response.data;
};

export const clearNotificationHistory = async (role) => {
    const response = await API.delete(`/notifications/clear/${role}`);
    return response.data;
};

// --- ЖУРНАЛ ТО (ТЕХНІК) ---
export const createMaintenanceLog = async (itemId, description) => {
    // URLSearchParams безпечно кодує пробіли та символи для URL
    const params = new URLSearchParams({ itemId, description });
    const response = await API.post(`/maintenance/create?${params.toString()}`);
    return response.data;
};

export const getActiveMaintenanceLogs = async () => {
    const response = await API.get('/maintenance/active');
    return response.data;
};

export const resolveMaintenanceLog = async (id, cost, comment) => {
    const params = new URLSearchParams({ cost });
    if (comment) params.append('finalComment', comment);
    
    const response = await API.put(`/maintenance/${id}/resolve?${params.toString()}`);
    return response.data;
};

// --- КЕРУВАННЯ ІНВЕНТАРЕМ (АДМІН) ---
export const addInventoryItem = async (itemData) => {
    const response = await API.post('/inventory/add', itemData);
    return response.data;
};

export const deleteInventoryItem = async (id) => {
    const response = await API.delete(`/inventory/${id}`);
    return response.data;
};

// --- ФІНАНСИ (АДМІН) ---
export const getTransactions = async () => {
    const response = await API.get('/finance/transactions');
    return response.data;
};

export const logTransaction = async (transactionData) => {
    const response = await API.post('/finance/log', transactionData);
    return response.data;
};

export const getFinancialReport = () => API.get('/orders/financial-report');

export default API;