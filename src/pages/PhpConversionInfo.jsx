import React from 'react';
import { Card } from '@/components/ui/card';

export default function WordPressPluginGuide() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Guia de Instalação - WordPress Plugin</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Estrutura do Plugin</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto mb-4">
          <pre>
            streaming-plus/
            ├── streaming-plus.php         # Arquivo principal do plugin
            ├── includes/                  # Classes e funções principais
            │   ├── class-admin.php       # Painel administrativo
            │   ├── class-banners.php     # Gerenciamento de transmissões
            │   ├── class-purchases.php   # Gerenciamento de compras
            │   └── class-payments.php    # Processamento de pagamentos
            ├── templates/                 # Templates das páginas
            │   ├── admin/
            │   │   ├── dashboard.php
            │   │   ├── create-banner.php
            │   │   └── manage-banners.php
            │   └── public/
            │       ├── banners-list.php
            │       └── watch.php
            ├── assets/
            │   ├── css/
            │   ├── js/
            │   └── img/
            └── languages/                 # Arquivos de tradução
          </pre>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">2. Requisitos</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>WordPress 5.0 ou superior</li>
          <li>PHP 7.4 ou superior</li>
          <li>MySQL 5.6 ou superior</li>
          <li>Extensão PHP cURL ativada</li>
          <li>Permissão para criar tabelas no banco de dados</li>
        </ul>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">3. Tabelas do Banco de Dados</h2>
        <p className="text-gray-600 mb-4">O plugin criará as seguintes tabelas:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>wp_streaming_banners</code> - Armazena as transmissões</li>
          <li><code>wp_streaming_purchases</code> - Registra as compras</li>
          <li><code>wp_streaming_payments</code> - Registra os pagamentos</li>
        </ul>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">4. Instalação</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">4.1. Upload Manual</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Baixe o arquivo ZIP do plugin</li>
              <li>Acesse o painel WordPress</li>
              <li>Vá para Plugins &gt; Adicionar Novo &gt; Enviar Plugin</li>
              <li>Selecione o arquivo ZIP e clique em "Instalar Agora"</li>
              <li>Após a instalação, clique em "Ativar Plugin"</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-lg">4.2. Via FTP</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Extraia o arquivo ZIP</li>
              <li>Upload da pasta "streaming-plus" para /wp-content/plugins/</li>
              <li>Acesse o painel WordPress</li>
              <li>Vá para Plugins e ative o "Streaming Plus"</li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">5. Configuração</h2>
        <div className="space-y-4">
          <p>Após a instalação:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Acesse "Streaming Plus" no menu do WordPress</li>
            <li>Configure as opções de pagamento (PIX, etc.)</li>
            <li>Defina as páginas do plugin:
              <ul className="list-disc pl-5 mt-2">
                <li>Página de Listagem (shortcode: [streaming_plus_list])</li>
                <li>Página de Visualização (shortcode: [streaming_plus_watch])</li>
              </ul>
            </li>
            <li>Configure as permissões de usuário se necessário</li>
          </ol>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">6. Shortcodes Disponíveis</h2>
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <code>[streaming_plus_list]</code>
            <p className="text-sm text-gray-600 mt-1">Exibe a lista de transmissões disponíveis</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <code>[streaming_plus_watch id="banner_id"]</code>
            <p className="text-sm text-gray-600 mt-1">Exibe a página de visualização de uma transmissão específica</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <code>[streaming_plus_purchases]</code>
            <p className="text-sm text-gray-600 mt-1">Exibe a lista de compras do usuário atual</p>
          </div>
        </div>
      </Card>
    </div>
  );
}