
import React, { useState, useEffect } from 'react';
import { StreamBanner } from '@/api/entities';
import { Purchase } from '@/api/entities';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, startOfDay, endOfDay, subDays, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Activity,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Add authentication check
  useEffect(() => {
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated !== 'true') {
      window.location.href = "/AdminLogin";
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    activeBanners: 0,
    uniqueUsers: 0
  });
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [bannersByStatus, setBannersByStatus] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data
      const banners = await StreamBanner.list();
      const purchases = await Purchase.list();
      
      // Calculate basic stats
      calculateStats(banners, purchases);
      
      // Calculate revenue by day (last 7 days)
      calculateRevenueByDay(purchases);
      
      // Calculate banners by status
      calculateBannersByStatus(banners);
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (banners, purchases) => {
    const now = new Date();
    
    // Total revenue
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    
    // Total purchases
    const totalPurchases = purchases.length;
    
    // Active banners
    const activeBanners = banners.filter(banner => 
      banner.active && 
      new Date(banner.expiration_date) > now
    ).length;
    
    // Unique users (emails)
    const uniqueUsers = new Set(purchases.map(purchase => purchase.email)).size;
    
    setStats({
      totalRevenue,
      totalPurchases,
      activeBanners,
      uniqueUsers
    });
  };

  const calculateRevenueByDay = (purchases) => {
    const today = new Date();
    const days = 7; // Last 7 days
    
    // Initialize daily revenue data
    const dailyRevenue = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dailyRevenue.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        revenue: 0,
        purchaseCount: 0
      });
    }
    
    // Calculate revenue for each day
    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.purchase_date);
      const daysDiff = differenceInDays(today, purchaseDate);
      
      if (daysDiff >= 0 && daysDiff < days) {
        const index = days - 1 - daysDiff;
        dailyRevenue[index].revenue += purchase.price;
        dailyRevenue[index].purchaseCount += 1;
      }
    });
    
    setRevenueByDay(dailyRevenue);
  };

  const calculateBannersByStatus = (banners) => {
    const now = new Date();
    
    // Count banners by status
    let active = 0;
    let scheduled = 0;
    let expired = 0;
    let inactive = 0;
    
    banners.forEach(banner => {
      const startDate = new Date(banner.start_date);
      const expirationDate = new Date(banner.expiration_date);
      
      if (!banner.active) {
        inactive++;
      } else if (now < startDate) {
        scheduled++;
      } else if (now > expirationDate) {
        expired++;
      } else {
        active++;
      }
    });
    
    setBannersByStatus([
      { name: 'Ativos', value: active, color: '#22c55e' },
      { name: 'Agendados', value: scheduled, color: '#3b82f6' },
      { name: 'Expirados', value: expired, color: '#ef4444' },
      { name: 'Inativos', value: inactive, color: '#9ca3af' }
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Faturamento Total</p>
              <p className="text-2xl font-bold text-green-900">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Compras Realizadas</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalPurchases}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Activity className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Transmissões Ativas</p>
              <p className="text-2xl font-bold text-amber-900">{stats.activeBanners}</p>
            </div>
            <div className="p-3 bg-amber-200 rounded-full">
              <Calendar className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Usuários Únicos</p>
              <p className="text-2xl font-bold text-purple-900">{stats.uniqueUsers}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="text-gray-500" />
            <h2 className="font-bold text-lg">Faturamento (Últimos 7 dias)</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueByDay}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Bar 
                  dataKey="revenue" 
                  name="Faturamento" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Banners by Status */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="text-gray-500" />
            <h2 className="font-bold text-lg">Transmissões por Status</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bannersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {bannersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Transmissões']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
