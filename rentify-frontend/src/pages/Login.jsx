import React, { useState } from 'react';
import { loginUser } from '../services/api';

function Login({ onLoginSuccess }) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser({ phone, password });
            
            // Зберігаємо токен і роль у пам'ять браузера
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('fullName', data.fullName);

            // Передаємо роль в App.js, щоб змінити інтерфейс
            onLoginSuccess(data.role);
            
        } catch (err) {
            setError('Невірний номер телефону або пароль');
        }
    };

    return (
        <div className="login-container" style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
            <h2 style={{ textAlign: 'center' }}>Вхід у Rentify</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Номер телефону:</label>
                    <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div>
                    <label>Пароль:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#f39c12', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Увійти
                </button>
            </form>
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
        </div>
    );
}

export default Login;