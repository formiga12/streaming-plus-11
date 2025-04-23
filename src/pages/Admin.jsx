import React, { useState, useEffect } from 'react';
import { StreamBanner } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UploadFile } from '@/api/integrations';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPage() {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    price: '',
    stream_url: '',
    embed_code: '',
    start_date: '',
    expiration_date: '',
    pix_key: '',
    active: true
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Verificar autenticação do admin
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated !== 'true') {
      window.location.href = "/AdminLogin";
      return;
    }

    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await StreamBanner.list();
      setBanners(data);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await UploadFile({ file });
        setNewBanner({ ...newBanner, thumbnail: file_url });
      } catch (error) {
        console.error("Erro ao fazer upload de arquivo:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await StreamBanner.create(newBanner);
      setNewBanner({
        title: '',
        price: '',
        stream_url: '',
        embed_code: '',
        start_date: '',
        expiration_date: '',
        pix_key: '',
        active: true
      });
      setSuccessMessage('Banner criado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadBanners();
    } catch (error) {
      console.error("Erro ao criar banner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Banner</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              placeholder="Título da transmissão"
              required
            />
          </div>

          <div>
            <Label>Valor</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newBanner.price}
                onChange={(e) => setNewBanner({ ...newBanner, price: parseFloat(e.target.value) })}
                placeholder="99.90"
                required
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={newBanner.price === 0}
                  onCheckedChange={(checked) => setNewBanner({ ...newBanner, price: checked ? 0 : 99.90 })}
                />
                <Label>Grátis</Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Chave PIX</Label>
            <Input
              value={newBanner.pix_key}
              onChange={(e) => setNewBanner({ ...newBanner, pix_key: e.target.value })}
              placeholder="Sua chave PIX para recebimento"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe sua chave PIX para recebimento dos pagamentos (CPF, CNPJ, e-mail, etc.)
            </p>
          </div>

          <div >
            <Label>URL da Transmissão</Label>
            <Input
              value={newBanner.stream_url}
              onChange={(e) => setNewBanner({ ...newBanner, stream_url: e.target.value })}
              placeholder="URL do stream (m3u8, m3u, ts, mp4)"
              required
            />
          </div>

          <div>
            <Label>Código de Incorporação (opcional)</Label>
            <Textarea
              value={newBanner.embed_code}
              onChange={(e) => setNewBanner({ ...newBanner, embed_code: e.target.value })}
              placeholder="<iframe src='...'></iframe> ou outro código de incorporação"
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Adicione código HTML personalizado para incorporar vídeos de plataformas como YouTube, Vimeo, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newBanner.start_date ? 
                      format(new Date(newBanner.start_date), 'PPP HH:mm') : 
                      'Selecione a data e hora'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newBanner.start_date ? new Date(newBanner.start_date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const datetime = new Date(date);
                        datetime.setHours(new Date().getHours());
                        datetime.setMinutes(new Date().getMinutes());
                        setNewBanner({ ...newBanner, start_date: datetime.toISOString() });
                      }
                    }}
                  />
                  <Input
                    type="time"
                    className="m-2"
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const date = new Date(newBanner.start_date || new Date());
                      date.setHours(parseInt(hours || 0));
                      date.setMinutes(parseInt(minutes || 0));
                      setNewBanner({ ...newBanner, start_date: date.toISOString() });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Expiração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newBanner.expiration_date ? 
                      format(new Date(newBanner.expiration_date), 'PPP HH:mm') : 
                      'Selecione a data e hora'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newBanner.expiration_date ? new Date(newBanner.expiration_date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const datetime = new Date(date);
                        datetime.setHours(23);
                        datetime.setMinutes(59);
                        setNewBanner({ ...newBanner, expiration_date: datetime.toISOString() });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Imagem de Prévia</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newBanner.active}
              onCheckedChange={(checked) => setNewBanner({ ...newBanner, active: checked })}
            />
            <Label>Ativo</Label>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Banner
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}