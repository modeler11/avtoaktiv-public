import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const Logout: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    router.push('/admin');
  }, [router]);

  return null; // Можно вернуть пустой компонент или сообщение о выходе
};

export default Logout; 