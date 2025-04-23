import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Play, AlarmClock, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Purchase } from '@/api/entities';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PurchaseSearch() {
  const [email, setEmail] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }
    
    setLoading(true);
    setSearched(true);
    setError('');
    
    try {
      const data = await Purchase.filter({ email: email.toLowerCase().trim() });
      setPurchases(data);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      setError('Erro ao buscar compras. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchStream = (purchase) => {
    const now = new Date();
    const expirationDate = new Date(purchase.expiration_date);
    
    if (now > expirationDate) {
      alert("Acesso expirado. A transmissão não está mais disponível.");
      return;
    }
    
    navigate(createPageUrl('Watch') + `?id=${purchase.banner_id}&email=${encodeURIComponent(email)}&purchased=true`);
  };

  const isPurchaseExpired = (expirationDate) => {
    return new Date() > new Date(expirationDate);
  };

  return (
    <Card className="p-6 bg-white shadow-lg rounded-xl max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Buscar Minhas Compras</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-email" className="mb-2">Email</Label>
            <Input
              id="search-email"
              type="email"
              placeholder="Digite o email usado na compra"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando...
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {searched && !error && (
        <div className="space-y-4">
          <h3 className="font-semibold">{purchases.length === 0 ? 'Nenhuma compra encontrada' : 'Suas Compras'}</h3>
          
          {purchases.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">Nenhuma compra encontrada para este email.</p>
              <p className="text-gray-400 text-sm mt-1">Verifique se digitou o email corretamente.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {purchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  className={`border rounded-lg p-4 transition-colors ${
                    isPurchaseExpired(purchase.expiration_date) 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{purchase.banner_title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Compra: {format(new Date(purchase.purchase_date), 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Acesso até: {format(new Date(purchase.expiration_date), 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span className="flex items-center font-medium">
                          <AlarmClock className="w-4 h-4 mr-1" />
                          Status: {
                            isPurchaseExpired(purchase.expiration_date)
                              ? <span className="text-red-600">Expirado</span>
                              : <span className="text-green-600">Ativo</span>
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        R$ {purchase.price.toFixed(2)}
                      </span>
                      {!isPurchaseExpired(purchase.expiration_date) && (
                        <Button
                          onClick={() => handleWatchStream(purchase)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Assistir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}