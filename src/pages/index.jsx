import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IndexPage() {
  const navigate = useNavigate();
  
  // Redirecionar automaticamente para a página Home
  React.useEffect(() => {
    navigate(createPageUrl('Home'));
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Streaming Plus</h1>
        <p className="text-gray-300 mb-6">Carregando...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}