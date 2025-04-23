
import React, { useState, useEffect } from 'react';
import { StreamBanner } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { 
  Play, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EditBannerModal from '../components/banners/EditBannerModal';
import DeleteBannerModal from '../components/banners/DeleteBannerModal';
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function ManageBannersPage() {
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated !== 'true') {
      window.location.href = createPageUrl("AdminLogin");
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const data = await StreamBanner.list('-created_date');
    setBanners(data);
    setLoading(false);
  };

  const getBannerStatus = (banner) => {
    const now = new Date();
    const startDate = new Date(banner.start_date);
    const expirationDate = new Date(banner.expiration_date);

    if (!banner.active) return { status: 'inactive', label: 'Inativo', color: 'bg-gray-100 text-gray-800' };
    if (now < startDate) return { status: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' };
    if (now > expirationDate) return { status: 'expired', label: 'Expirado', color: 'bg-red-100 text-red-800' };
    return { status: 'active', label: 'Ativo', color: 'bg-green-100 text-green-800' };
  };

  const handleEdit = async (updatedBanner) => {
    await StreamBanner.update(updatedBanner.id, updatedBanner);
    setEditingBanner(null);
    loadBanners();
  };

  const handleDelete = async (bannerId) => {
    await StreamBanner.delete(bannerId);
    setDeletingBanner(null);
    loadBanners();
  };

  const handlePlay = (banner) => {
    navigate(createPageUrl('Watch') + `?id=${banner.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Transmissões</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => {
                const status = getBannerStatus(banner);
                return (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {banner.price === 0 ? (
                        <Badge variant="secondary">Grátis</Badge>
                      ) : (
                        `R$ ${banner.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        {banner.view_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(banner.start_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{format(new Date(banner.expiration_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlay(banner)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBanner(banner)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingBanner(banner)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">Nenhuma transmissão encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          onSave={handleEdit}
          onClose={() => setEditingBanner(null)}
        />
      )}

      {deletingBanner && (
        <DeleteBannerModal
          banner={deletingBanner}
          onConfirm={() => handleDelete(deletingBanner.id)}
          onClose={() => setDeletingBanner(null)}
        />
      )}
    </div>
  );
}
