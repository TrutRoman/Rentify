import React, { useState } from 'react';
import { registerClient } from '../services/api';

function ClientRegistration() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // стан для пароля
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ДОДАНО: тепер ми відправляємо і пароль на сервер
            await registerClient({ fullName, phone, password }); 
            setMessage('Клієнта успішно зареєстровано!');
            setFullName('');
            setPhone('');
            setPassword(''); // Очищаємо поле після успіху
        } catch (error) {
            setMessage('Помилка. Можливо, номер телефону вже використовується.');
        }
    };

    return (
        <div className="form-container">
            <h2>Реєстрація нового клієнта (UC1)</h2>
            <form onSubmit={handleSubmit}>
                <label>Повне ПІБ клієнта:</label>
                <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                />
                
                <label>Номер телефону:</label>
                <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                />

                {/* ДОДАНО: Нове поле для пароля */}
                <label>Тимчасовий пароль (для входу клієнта):</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Введіть пароль..."
                />
                
                <button type="submit">Зберегти в CRM</button>
            </form>
            {message && <p className="status-msg">{message}</p>}
        </div>
    );
}

export default ClientRegistration;