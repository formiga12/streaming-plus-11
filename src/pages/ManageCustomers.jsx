import React, { useState, useEffect } from 'react';
import { Purchase } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Search, 
  UserCheck, 
  Mail, 
  Calendar, 
  DollarSign,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SendEmail } from '@/api/integrations';

export default function ManageCustomersPage() {
  // Add authentication check
  useEffect(() => {
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated !== 'true') {
      window.location.href = "/AdminLogin";
    }
  }, []);

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    loadCustomerData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers, sortOrder]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const purchases = await Purchase.list('-purchase_date');
      
      // Group purchases by email
      const customerMap = {};
      purchases.forEach(purchase => {
        if (!customerMap[purchase.email]) {
          customerMap[purchase.email] = {
            email: purchase.email,
            totalSpent: 0,
            purchaseCount: 0,
            firstPurchase: new Date(purchase.purchase_date),
            lastPurchase: new Date(purchase.purchase_date),
            purchases: []
          };
        }
        
        const customer = customerMap[purchase.email];
        customer.totalSpent += purchase.price;
        customer.purchaseCount++;
        
        const purchaseDate = new Date(purchase.purchase_date);
        if (purchaseDate < customer.firstPurchase) {
          customer.firstPurchase = purchaseDate;
        }
        if (purchaseDate > customer.lastPurchase) {
          customer.lastPurchase = purchaseDate;
        }
        
        customer.purchases.push(purchase);
      });
      
      // Convert to array
      const customersArray = Object.values(customerMap);
      setCustomers(customersArray);
      setFilteredCustomers(customersArray);
    } catch (error) {
      console.error("Erro ao carregar dados dos clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => b.lastPurchase - a.lastPurchase);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.firstPurchase - b.firstPurchase);
        break;
      case 'highest':
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'most':
        filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
        break;
    }
    
    setFilteredCustomers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleExportCustomers = () => {
    // Create CSV content
    const headers = ['Email', 'Total Gasto (R$)', 'Número de Compras', 'Primeira Compra', 'Última Compra'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.email,
        customer.totalSpent.toFixed(2),
        customer.purchaseCount,
        format(customer.firstPurchase, 'dd/MM/yyyy HH:mm'),
        format(customer.lastPurchase, 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = async (email) => {
    setSelectedEmail(email);
    setSendingEmail(true);
    
    try {
      await SendEmail({
        to: email,
        subject: "Novidades em StreamingPlus",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #3b82f6;">StreamingPlus - Novas Transmissões Disponíveis</h2>
            <p>Olá,</p>
            <p>Temos novas transmissões disponíveis que podem ser do seu interesse.</p>
            <p>Acesse nossa plataforma para conferir as novidades:</p>
            <a href="https://streamingplus.com" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px;">Ver Transmissões</a>
            <p style="margin-top: 20px;">Atenciosamente,<br>Equipe StreamingPlus</p>
          </div>
        `
      });
      
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setSendingEmail(false);
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      setSendingEmail(false);
    }
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
      <h1 className="text-2xl font-bold mb-6">Gerenciar Clientes</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Buscar por email"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="w-full md:w-48">
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="highest">Maior valor</SelectItem>
              <SelectItem value="most">Mais compras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleExportCustomers}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Primeira Compra</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.email}>
                  <TableCell className="font-medium">{customer.email}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      R$ {customer.totalSpent.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.purchaseCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {format(customer.firstPurchase, 'dd/MM/yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {format(customer.lastPurchase, 'dd/MM/yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendEmail(customer.email)}
                      disabled={sendingEmail && selectedEmail === customer.email}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {sendingEmail && selectedEmail === customer.email ? (
                        emailSent ? (
                          <UserCheck className="w-4 h-4 mr-2" />
                        ) : (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                          </span>
                        )
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      {sendingEmail && selectedEmail === customer.email
                        ? emailSent
                          ? "Enviado"
                          : "Enviando..."
                        : "Email"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">Nenhum cliente encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}