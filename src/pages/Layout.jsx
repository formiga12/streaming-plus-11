
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, 
  Menu, 
  X, 
  FilePlus, 
  List,
  Users,
  LogOut,
  BarChart2
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Define páginas públicas
  const publicPages = ['Home', 'AdminLogin', 'index', '404'];
  const isPublicPage = publicPages.includes(currentPageName);
  const isAdminPage = currentPageName?.startsWith('Admin') || currentPageName === 'ManageBanners' || currentPageName === 'ManageCustomers';
  
  useEffect(() => {
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    setIsAdmin(adminAuthenticated === 'true');

    // Só redireciona se for página administrativa e não estiver autenticado
    if (!adminAuthenticated && isAdminPage && currentPageName !== 'AdminLogin') {
      window.location.href = createPageUrl("AdminLogin");
    }
  }, [currentPageName, isAdminPage]);

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = createPageUrl("Home");
  };

  // Se for página pública, não aplica o layout
  if (isPublicPage) {
    return children;
  }

  // Layout para páginas administrativas
  if (isAdmin && isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        {/* Admin Sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 transform ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 transition duration-200 ease-in-out w-64 bg-gray-900 text-white shadow-xl`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Painel Admin</span>
              <button
                onClick={() => setIsAdminSidebarOpen(false)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="mt-8 space-y-1">
              <Link 
                to={createPageUrl("AdminDashboard")} 
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${currentPageName === 'AdminDashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <BarChart2 className="w-5 h-5" />
                Dashboard
              </Link>
            
              <Link 
                to={createPageUrl("Home")} 
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                <Home className="w-5 h-5" />
                Página Inicial
              </Link>
              
              <Link 
                to={createPageUrl("Admin")} 
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${currentPageName === 'Admin' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <FilePlus className="w-5 h-5" />
                Criar Banner
              </Link>
              
              <Link 
                to={createPageUrl("ManageBanners")} 
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${currentPageName === 'ManageBanners' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <List className="w-5 h-5" />
                Gerenciar Banners
              </Link>
              
              <Link 
                to={createPageUrl("ManageCustomers")} 
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${currentPageName === 'ManageCustomers' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <Users className="w-5 h-5" />
                Gerenciar Clientes
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 w-full text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
        
        {/* Admin Content */}
        <div className="flex-1">
          {/* Admin Topbar */}
          <div className="bg-white shadow-sm p-4 md:hidden">
            <button
              onClick={() => setIsAdminSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <main className="p-4">
            {children}
          </main>
        </div>
        
        {/* Mobile backdrop */}
        {isAdminSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 md:hidden z-20"
            onClick={() => setIsAdminSidebarOpen(false)}
          />
        )}
      </div>
    );
  }

  // Layout padrão para outras páginas
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="font-bold text-xl">
              Streaming Plus
            </Link>
            
            {isAdmin && (
              <Link
                to={createPageUrl("Admin")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Área Administrativa
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
}
