import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, FileDown, Github, Chrome, FolderOpen } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DownloadPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Download e Instalação</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="w-6 h-6" />
          Opções de Download
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Via GitHub
            </h3>
            <p className="text-gray-600 mb-4">
              Clone o repositório diretamente do GitHub:
            </p>
            <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-4">
              git clone https://github.com/seu-usuario/streaming-plus-wp.git
            </div>
            <Button className="w-full bg-black hover:bg-gray-800">
              <Github className="w-4 h-4 mr-2" />
              Acessar Repositório
            </Button>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Download Direto
            </h3>
            <p className="text-gray-600 mb-4">
              Baixe o arquivo ZIP com todos os arquivos do plugin:
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download ZIP
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Estrutura de Arquivos</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-auto">
          <pre>
{`streaming-plus/
├── streaming-plus.php         # Arquivo principal
├── includes/                  # Classes PHP
│   ├── class-admin.php
│   ├── class-banners.php
│   ├── class-purchases.php
│   └── class-shortcodes.php
├── templates/                 # Templates
│   ├── admin/
│   │   ├── dashboard.php
│   │   ├── create-banner.php
│   │   └── manage-banners.php
│   └── public/
│       ├── banners-list.php
│       └── watch.php
└── assets/                    # Recursos
    ├── css/
    ├── js/
    └── img/`}
          </pre>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Chrome className="w-6 h-6" />
          Instalação no WordPress
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Método 1: Upload via Painel</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Faça o download do arquivo ZIP</li>
              <li>Acesse o painel WordPress</li>
              <li>Vá para Plugins &gt; Adicionar Novo &gt; Enviar Plugin</li>
              <li>Selecione o arquivo ZIP e clique em "Instalar Agora"</li>
              <li>Após a instalação, clique em "Ativar Plugin"</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Método 2: Upload via FTP</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Extraia o arquivo ZIP no seu computador</li>
              <li>Conecte-se ao seu servidor via FTP</li>
              <li>Navegue até a pasta wp-content/plugins/</li>
              <li>Faça upload da pasta streaming-plus</li>
              <li>Acesse o painel WordPress</li>
              <li>Vá para Plugins e ative o Streaming Plus</li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FolderOpen className="w-6 h-6" />
          Próximos Passos
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Após a instalação, você precisará:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Configurar as opções do plugin no painel administrativo</li>
            <li>Criar as páginas necessárias com os shortcodes apropriados</li>
            <li>Configurar as opções de pagamento (PIX)</li>
            <li>Testar a criação e visualização de transmissões</li>
          </ol>

          <div className="mt-6">
            <Button 
              onClick={() => window.location.href = createPageUrl('PhpClassesGuide')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Ver Documentação Completa
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}