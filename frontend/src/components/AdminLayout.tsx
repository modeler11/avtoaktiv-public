import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useRouter } from 'next/router';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();

  // Проверяем наличие токена при монтировании компонента
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar isOpen={true} />
      <div className="flex-1 ml-64">
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 