import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Página não encontrada</h2>
        <p className="text-gray-500 mb-8">A página que você está procurando não existe ou foi removida.</p>
        <Button 
          onClick={() => navigate(createPageUrl('Home'))}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Voltar para página inicial
        </Button>
      </div>
    </div>
  );
}