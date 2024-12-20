import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import AdminSidebar from '../components/AdminSidebar';
import API_URL from '../config/api';

const Admin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token in Admin component:', token);
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        console.log('Login successful, token set:', response.data.token);
      }
    } catch (error: any) {
      console.error('Ошибка авторизации:', error);
      setError(error.response?.data?.message || 'Ошибка при попытке входа');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/admin');
    console.log('Logout successful, token removed');
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <AdminSidebar isOpen={true} />
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Привет, Админ!
          </h1>
          <button className="mt-4 bg-blue-500 text-white p-2 px-4 rounded hover:bg-blue-600" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход в админ-панель</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            placeholder="Пароль"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline"
        >
          Войти
        </button>
      </form>
    </div>
  );
};

export default Admin; 