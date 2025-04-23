
import React, { useState, useEffect } from 'react';
import { StreamBanner } from '@/api/entities';
import { User } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Timer, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EmailCollectionModal from '../components/auth/EmailCollectionModal';
import PurchaseSearch from '../components/home/PurchaseSearch';

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners().catch(error => {
      console.error("Erro ao carregar banners:", error);
      setError("Erro ao carregar transmissões. Por favor, tente novamente.");
      setLoading(false);
    });
  }, []);

  const loadBanners = async () => {
    try {
      const now = new Date().toISOString();
      const data = await StreamBanner.list();
      const activeBanners = data.filter(banner => 
        banner.active && 
        new Date(banner.expiration_date) > new Date() &&
        banner.start_date <= now
      );
      setBanners(activeBanners);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (email) => {
    if (selectedBanner) {
      navigate(createPageUrl('Watch') + `?id=${selectedBanner.id}&email=${encodeURIComponent(email)}`);
    }
    setShowEmailModal(false);
  };

  const handleBannerClick = async (banner) => {
    // Incrementar contador de visualizações
    await StreamBanner.update(banner.id, {
      ...banner,
      view_count: (banner.view_count || 0) + 1
    });

    // Se for grátis, ir direto para o player
    if (banner.price === 0) {
      navigate(createPageUrl('Watch') + `?id=${banner.id}&free=true`);
    } else {
      setSelectedBanner(banner);
      setShowEmailModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Transmissões Ao Vivo
        </h1>

        <div className="mb-10">
          <PurchaseSearch />
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">
          Transmissões Disponíveis
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card 
              key={banner.id}
              className="group relative overflow-hidden rounded-xl transition-transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={banner.thumbnail || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&h=500'}
                  alt={banner.title}
                  className="w-full h-48 object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-16 h-16 text-white" />
                </div>
                {/* Contador de visualizações */}
                <div className="absolute top-2 right-2 bg-black/60 rounded-full px-3 py-1 text-white text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {banner.view_count || 0}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Timer className="w-4 h-4 mr-1" />
                  {format(new Date(banner.start_date), 'dd/MM HH:mm')}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-green-600">
                    {banner.price === 0 ? (
                      <span className="text-blue-600">Grátis</span>
                    ) : (
                      `R$ ${banner.price.toFixed(2)}`
                    )}
                  </span>
                  <Button
                    onClick={() => handleBannerClick(banner)}
                    className={`${banner.price === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    Assistir Agora
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <h2 className="text-2xl font-semibold mb-2">Nenhuma transmissão disponível</h2>
            <p>Volte mais tarde para novas transmissões!</p>
          </div>
        )}
      </div>

      <EmailCollectionModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
}
