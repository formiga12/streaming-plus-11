import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';

export default function EditBannerModal({ banner, onSave, onClose }) {
  const [editedBanner, setEditedBanner] = useState(banner);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedBanner);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Transmissão</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input
              value={editedBanner.title}
              onChange={(e) => setEditedBanner({ ...editedBanner, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              step="0.01"
              value={editedBanner.price}
              onChange={(e) => setEditedBanner({ ...editedBanner, price: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <Label>Chave PIX</Label>
            <Input
              value={editedBanner.pix_key || ''}
              onChange={(e) => setEditedBanner({ ...editedBanner, pix_key: e.target.value })}
              placeholder="Sua chave PIX para recebimento"
            />
          </div>

          <div>
            <Label>URL da Transmissão</Label>
            <Input
              value={editedBanner.stream_url}
              onChange={(e) => setEditedBanner({ ...editedBanner, stream_url: e.target.value })}
            />
          </div>

          <div>
            <Label>Código de Incorporação (opcional)</Label>
            <Textarea
              value={editedBanner.embed_code || ''}
              onChange={(e) => setEditedBanner({ ...editedBanner, embed_code: e.target.value })}
              placeholder="<iframe src='...'></iframe> ou outro código de incorporação"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(editedBanner.start_date), 'PPP HH:mm')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(editedBanner.start_date)}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setHours(new Date(editedBanner.start_date).getHours());
                        newDate.setMinutes(new Date(editedBanner.start_date).getMinutes());
                        setEditedBanner({ ...editedBanner, start_date: newDate.toISOString() });
                      }
                    }}
                  />
                  <Input
                    type="time"
                    className="m-2"
                    value={format(new Date(editedBanner.start_date), 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const date = new Date(editedBanner.start_date);
                      date.setHours(parseInt(hours));
                      date.setMinutes(parseInt(minutes));
                      setEditedBanner({ ...editedBanner, start_date: date.toISOString() });
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
                    {format(new Date(editedBanner.expiration_date), 'PPP HH:mm')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(editedBanner.expiration_date)}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setHours(23);
                        newDate.setMinutes(59);
                        setEditedBanner({ ...editedBanner, expiration_date: newDate.toISOString() });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={editedBanner.active}
              onCheckedChange={(checked) => setEditedBanner({ ...editedBanner, active: checked })}
            />
            <Label>Ativo</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}