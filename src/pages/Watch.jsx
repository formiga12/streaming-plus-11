import React, { useState, useEffect } from 'react';
import { StreamBanner } from '@/api/entities';
import { User } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import VideoPlayer from '../components/VideoPlayer';
import PaymentModal from '../components/PaymentModal';
import { Purchase } from '@/api/entities';

export default function WatchPage() {
  const [banner, setBanner] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      // Tentar carregar o usuário, mas não interromper se não estiver autenticado
      try {
        await User.me();
      } catch (error) {
        // Usuário não está autenticado, mas podemos continuar para transmissões gratuitas
        console.log("Usuário não autenticado, mas página pode estar disponível para transmissões gratuitas");
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const bannerId = urlParams.get('id');
      const email = urlParams.get('email');
      const isFree = urlParams.get('free') === 'true';
      const purchased = urlParams.get('purchased') === 'true';
      
      if (email) {
        setUserEmail(email);
      }
      
      if (bannerId) {
        const data = await StreamBanner.list();
        const found = data.find(b => b.id === bannerId);
        if (found) {
          setBanner(found);
          
          // Set paid if free or purchased
          if (isFree || purchased || found.price === 0) {
            setIsPaid(true);
          }
        } else {
          setError("Banner não encontrado");
        }
      } else {
        setError("ID de transmissão não fornecido");
      }
    } catch (error) {
      console.error("Erro ao carregar transmissão:", error);
      setError("Erro ao carregar a transmissão. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaid(true);
    setShowPayment(false);
    
    // Save purchase record
    try {
      await Purchase.create({
        email: userEmail,
        banner_id: banner.id,
        price: banner.price,
        purchase_date: new Date().toISOString(),
        stream_url: banner.stream_url,
        banner_title: banner.title,
        expiration_date: banner.expiration_date
      });
    } catch (error) {
      console.error("Erro ao salvar registro de compra:", error);
    }
  };

  // Função de formatação segura para datas
  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return "Data não disponível";
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Erro na data";
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Erro</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para página inicial
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!banner) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Transmissão não encontrada</h2>
            <p className="text-gray-500 mb-6">A transmissão solicitada não existe ou foi removida.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para página inicial
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{banner.title}</h1>
          
          {isPaid ? (
            <div className="space-y-6">
              <VideoPlayer url={banner.stream_url} embedCode={banner.embed_code} />
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                  <CheckCircle className="w-5 h-5" />
                  {banner.price === 0 ? 'Transmissão Gratuita' : 'Pagamento Confirmado'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {userEmail && (
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-semibold">{userEmail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Valor</p>
                    <p className="font-semibold">{banner.price === 0 ? 'Grátis' : `R$ ${banner.price.toFixed(2)}`}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data da Transmissão</p>
                    <p className="font-semibold">{safeFormatDate(banner.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Disponível até</p>
                    <p className="font-semibold">{safeFormatDate(banner.expiration_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-semibold mb-4">
                    Faça o pagamento para assistir
                  </h3>
                  <div className="text-gray-300 mb-4">
                    Email: {userEmail}
                  </div>
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Pagar R$ {banner.price.toFixed(2)}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Informações da Transmissão</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Data de Início</p>
                      <p className="font-medium">
                        {safeFormatDate(banner.start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Disponível até</p>
                      <p className="font-medium">
                        {safeFormatDate(banner.expiration_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        amount={banner?.price || 0}
        email={userEmail}
        pixKey={banner?.pix_key || ''}
      />
    </div>
  );
}