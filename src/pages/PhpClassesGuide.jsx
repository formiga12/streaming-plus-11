import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PhpClassesGuide() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Classes PHP para o Plugin WordPress</h1>
      
      <Tabs defaultValue="admin" className="mb-6">
        <TabsList>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="shortcodes">Shortcodes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admin" className="mt-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">includes/class-admin.php</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto mb-4">
              <pre className="whitespace-pre-wrap">
{`<?php
/**
 * Classe para gerenciar funcionalidades administrativas
 */
class Streaming_Plus_Admin {
    
    /**
     * Inicializa a classe Admin
     */
    public function __construct() {
        // Inicializa hooks de admin
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Registra configurações do plugin
     */
    public function register_settings() {
        register_setting('streaming_plus_options', 'streaming_plus_options');
        
        add_settings_section(
            'streaming_plus_payment_settings',
            'Configurações de Pagamento',
            array($this, 'payment_settings_section'),
            'streaming-plus-settings'
        );
        
        add_settings_field(
            'pix_key',
            'Chave PIX',
            array($this, 'pix_key_callback'),
            'streaming-plus-settings',
            'streaming_plus_payment_settings'
        );
    }
    
    /**
     * Callback para seção de configurações de pagamento
     */
    public function payment_settings_section() {
        echo '<p>Configure as opções de pagamento abaixo.</p>';
    }
    
    /**
     * Callback para campo Chave PIX
     */
    public function pix_key_callback() {
        $options = get_option('streaming_plus_options');
        $pix_key = isset($options['pix_key']) ? $options['pix_key'] : '';
        echo '<input type="text" id="pix_key" name="streaming_plus_options[pix_key]" value="' . esc_attr($pix_key) . '" class="regular-text" />';
    }

    /**
     * Renderiza página principal do admin
     */
    public static function render_admin_page() {
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/admin/dashboard.php';
    }
    
    /**
     * Renderiza página de criar banner
     */
    public static function render_new_banner_page() {
        // Processar o formulário se submetido
        if (isset($_POST['submit_banner'])) {
            $banner = array(
                'title' => sanitize_text_field($_POST['title']),
                'price' => floatval($_POST['price']),
                'stream_url' => esc_url_raw($_POST['stream_url']),
                'embed_code' => wp_kses_post($_POST['embed_code']),
                'start_date' => sanitize_text_field($_POST['start_date']),
                'expiration_date' => sanitize_text_field($_POST['expiration_date']),
                'active' => isset($_POST['active']) ? 1 : 0
            );
            
            // Lidar com o upload da thumbnail
            if (!empty($_FILES['thumbnail']['tmp_name'])) {
                $upload = wp_handle_upload($_FILES['thumbnail'], array('test_form' => false));
                if (!isset($upload['error'])) {
                    $banner['thumbnail'] = $upload['url'];
                }
            }
            
            Streaming_Plus_Banners::create_banner($banner);
            echo '<div class="notice notice-success is-dismissible"><p>Banner criado com sucesso!</p></div>';
        }
        
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/admin/create-banner.php';
    }
    
    /**
     * Renderiza página de gerenciar banners
     */
    public static function render_manage_banners_page() {
        // Processar exclusão se solicitado
        if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
            $banner_id = intval($_GET['id']);
            Streaming_Plus_Banners::delete_banner($banner_id);
            echo '<div class="notice notice-success is-dismissible"><p>Banner excluído com sucesso!</p></div>';
        }
        
        // Processar atualização se submetido
        if (isset($_POST['update_banner']) && isset($_POST['banner_id'])) {
            $banner_id = intval($_POST['banner_id']);
            $banner = array(
                'title' => sanitize_text_field($_POST['title']),
                'price' => floatval($_POST['price']),
                'stream_url' => esc_url_raw($_POST['stream_url']),
                'embed_code' => wp_kses_post($_POST['embed_code']),
                'start_date' => sanitize_text_field($_POST['start_date']),
                'expiration_date' => sanitize_text_field($_POST['expiration_date']),
                'active' => isset($_POST['active']) ? 1 : 0
            );
            
            // Lidar com o upload da thumbnail
            if (!empty($_FILES['thumbnail']['tmp_name'])) {
                $upload = wp_handle_upload($_FILES['thumbnail'], array('test_form' => false));
                if (!isset($upload['error'])) {
                    $banner['thumbnail'] = $upload['url'];
                }
            }
            
            Streaming_Plus_Banners::update_banner($banner_id, $banner);
            echo '<div class="notice notice-success is-dismissible"><p>Banner atualizado com sucesso!</p></div>';
        }
        
        // Obter todos os banners
        $banners = Streaming_Plus_Banners::get_banners();
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/admin/manage-banners.php';
    }
    
    /**
     * Renderiza página de vendas
     */
    public static function render_sales_page() {
        // Processar filtros
        $filters = array();
        if (isset($_GET['email']) && !empty($_GET['email'])) {
            $filters['email'] = sanitize_email($_GET['email']);
        }
        
        // Obter compras
        $purchases = Streaming_Plus_Purchases::get_purchases($filters);
        
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/admin/sales.php';
    }
}

// Inicializar a classe Admin
$streaming_plus_admin = new Streaming_Plus_Admin();

// Funções de callback para as páginas de administração
function streaming_plus_admin_page() {
    Streaming_Plus_Admin::render_admin_page();
}

function streaming_plus_new_banner_page() {
    Streaming_Plus_Admin::render_new_banner_page();
}

function streaming_plus_manage_banners_page() {
    Streaming_Plus_Admin::render_manage_banners_page();
}

function streaming_plus_sales_page() {
    Streaming_Plus_Admin::render_sales_page();
}`}
              </pre>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="banners" className="mt-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">includes/class-banners.php</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto mb-4">
              <pre className="whitespace-pre-wrap">
{`<?php
/**
 * Classe para gerenciar banners de streaming
 */
class Streaming_Plus_Banners {
    
    /**
     * Cria um novo banner
     *
     * @param array $banner Dados do banner
     * @return int|false ID do banner criado ou false em caso de erro
     */
    public static function create_banner($banner) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        $result = $wpdb->insert(
            $table,
            array(
                'title' => $banner['title'],
                'price' => $banner['price'],
                'thumbnail' => isset($banner['thumbnail']) ? $banner['thumbnail'] : '',
                'stream_url' => $banner['stream_url'],
                'embed_code' => isset($banner['embed_code']) ? $banner['embed_code'] : '',
                'start_date' => $banner['start_date'],
                'expiration_date' => $banner['expiration_date'],
                'active' => isset($banner['active']) ? $banner['active'] : 1,
                'view_count' => isset($banner['view_count']) ? $banner['view_count'] : 0,
                'created_at' => current_time('mysql')
            )
        );
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Atualiza um banner existente
     *
     * @param int $id ID do banner
     * @param array $banner Dados do banner
     * @return bool Sucesso da operação
     */
    public static function update_banner($id, $banner) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        $data = array(
            'title' => $banner['title'],
            'price' => $banner['price'],
            'stream_url' => $banner['stream_url'],
            'embed_code' => isset($banner['embed_code']) ? $banner['embed_code'] : '',
            'start_date' => $banner['start_date'],
            'expiration_date' => $banner['expiration_date'],
            'active' => isset($banner['active']) ? $banner['active'] : 1
        );
        
        // Atualizar thumbnail apenas se fornecida
        if (!empty($banner['thumbnail'])) {
            $data['thumbnail'] = $banner['thumbnail'];
        }
        
        $result = $wpdb->update(
            $table,
            $data,
            array('id' => $id)
        );
        
        return $result !== false;
    }
    
    /**
     * Deleta um banner
     *
     * @param int $id ID do banner
     * @return bool Sucesso da operação
     */
    public static function delete_banner($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        return $wpdb->delete(
            $table,
            array('id' => $id)
        );
    }
    
    /**
     * Obtém um banner pelo ID
     *
     * @param int $id ID do banner
     * @return object|null Dados do banner ou null se não encontrado
     */
    public static function get_banner($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id)
        );
    }
    
    /**
     * Obtém todos os banners
     *
     * @param array $args Argumentos de consulta (ex: ordenação, filtros)
     * @return array Lista de banners
     */
    public static function get_banners($args = array()) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        $default_args = array(
            'orderby' => 'start_date',
            'order' => 'DESC',
            'where' => ''
        );
        
        $args = wp_parse_args($args, $default_args);
        
        $query = "SELECT * FROM $table";
        
        // Adicionar cláusula WHERE se fornecida
        if (!empty($args['where'])) {
            $query .= " WHERE {$args['where']}";
        }
        
        // Adicionar ordenação
        $query .= " ORDER BY {$args['orderby']} {$args['order']}";
        
        return $wpdb->get_results($query);
    }
    
    /**
     * Obtém banners ativos
     *
     * @return array Lista de banners ativos
     */
    public static function get_active_banners() {
        $current_time = current_time('mysql');
        
        return self::get_banners(array(
            'where' => "active = 1 AND start_date <= '$current_time' AND expiration_date >= '$current_time'"
        ));
    }
    
    /**
     * Incrementa contador de visualizações
     *
     * @param int $id ID do banner
     * @return bool Sucesso da operação
     */
    public static function increment_view_count($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_banners';
        
        return $wpdb->query(
            $wpdb->prepare("UPDATE $table SET view_count = view_count + 1 WHERE id = %d", $id)
        );
    }
}
`}
              </pre>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases" className="mt-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">includes/class-purchases.php</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto mb-4">
              <pre className="whitespace-pre-wrap">
{`<?php
/**
 * Classe para gerenciar compras
 */
class Streaming_Plus_Purchases {
    
    /**
     * Registra uma nova compra
     *
     * @param array $purchase Dados da compra
     * @return int|false ID da compra ou false em caso de erro
     */
    public static function create_purchase($purchase) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_purchases';
        
        $result = $wpdb->insert(
            $table,
            array(
                'email' => $purchase['email'],
                'banner_id' => $purchase['banner_id'],
                'price' => $purchase['price'],
                'purchase_date' => isset($purchase['purchase_date']) ? $purchase['purchase_date'] : current_time('mysql'),
                'stream_url' => $purchase['stream_url'],
                'banner_title' => $purchase['banner_title'],
                'expiration_date' => $purchase['expiration_date'],
                'created_at' => current_time('mysql')
            )
        );
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Registra um pagamento para uma compra
     *
     * @param array $payment Dados do pagamento
     * @return int|false ID do pagamento ou false em caso de erro
     */
    public static function create_payment($payment) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_payments';
        
        $result = $wpdb->insert(
            $table,
            array(
                'purchase_id' => $payment['purchase_id'],
                'payment_method' => $payment['payment_method'],
                'payment_date' => isset($payment['payment_date']) ? $payment['payment_date'] : current_time('mysql'),
                'status' => $payment['status'],
                'transaction_id' => isset($payment['transaction_id']) ? $payment['transaction_id'] : '',
                'amount' => $payment['amount'],
                'payment_details' => isset($payment['payment_details']) ? json_encode($payment['payment_details']) : '',
                'created_at' => current_time('mysql')
            )
        );
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Verifica se um email tem acesso a um banner
     *
     * @param string $email Email do usuário
     * @param int $banner_id ID do banner
     * @return bool Se o usuário tem acesso
     */
    public static function check_access($email, $banner_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_purchases';
        $current_time = current_time('mysql');
        
        $result = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table 
                WHERE email = %s AND banner_id = %d AND expiration_date >= %s",
                $email,
                $banner_id,
                $current_time
            )
        );
        
        return $result > 0;
    }
    
    /**
     * Obtém compras de um usuário
     *
     * @param string $email Email do usuário
     * @return array Lista de compras
     */
    public static function get_user_purchases($email) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_purchases';
        
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE email = %s ORDER BY purchase_date DESC",
                $email
            )
        );
    }
    
    /**
     * Obtém todas as compras com opção de filtragem
     *
     * @param array $filters Filtros (ex: por email, banner)
     * @return array Lista de compras
     */
    public static function get_purchases($filters = array()) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'streaming_purchases';
        
        $query = "SELECT * FROM $table";
        $where = array();
        
        if (isset($filters['email']) && !empty($filters['email'])) {
            $where[] = $wpdb->prepare("email = %s", $filters['email']);
        }
        
        if (isset($filters['banner_id']) && !empty($filters['banner_id'])) {
            $where[] = $wpdb->prepare("banner_id = %d", $filters['banner_id']);
        }
        
        if (!empty($where)) {
            $query .= " WHERE " . implode(" AND ", $where);
        }
        
        $query .= " ORDER BY purchase_date DESC";
        
        return $wpdb->get_results($query);
    }
    
    /**
     * Obtém estatísticas de vendas
     *
     * @param string $period Período (day, week, month, year)
     * @return array Estatísticas de vendas
     */
    public static function get_sales_stats($period = 'month') {
        global $wpdb;
        
        $purchases_table = $wpdb->prefix . 'streaming_purchases';
        
        $current_time = current_time('mysql');
        $stats = array(
            'total_revenue' => 0,
            'total_purchases' => 0,
            'average_price' => 0,
            'period_revenue' => 0,
            'period_purchases' => 0
        );
        
        // Calcular estatísticas totais
        $total_stats = $wpdb->get_row(
            "SELECT 
                SUM(price) as total_revenue, 
                COUNT(*) as total_purchases,
                AVG(price) as average_price
            FROM $purchases_table"
        );
        
        if ($total_stats) {
            $stats['total_revenue'] = floatval($total_stats->total_revenue);
            $stats['total_purchases'] = intval($total_stats->total_purchases);
            $stats['average_price'] = floatval($total_stats->average_price);
        }
        
        // Determinar data para filtro por período
        $period_date = null;
        switch ($period) {
            case 'day':
                $period_date = date('Y-m-d 00:00:00', strtotime('today'));
                break;
            case 'week':
                $period_date = date('Y-m-d 00:00:00', strtotime('monday this week'));
                break;
            case 'month':
                $period_date = date('Y-m-d 00:00:00', strtotime('first day of this month'));
                break;
            case 'year':
                $period_date = date('Y-01-01 00:00:00');
                break;
        }
        
        // Calcular estatísticas do período
        if ($period_date) {
            $period_stats = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT 
                        SUM(price) as period_revenue, 
                        COUNT(*) as period_purchases
                    FROM $purchases_table
                    WHERE purchase_date >= %s",
                    $period_date
                )
            );
            
            if ($period_stats) {
                $stats['period_revenue'] = floatval($period_stats->period_revenue);
                $stats['period_purchases'] = intval($period_stats->period_purchases);
            }
        }
        
        return $stats;
    }
}
`}
              </pre>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="shortcodes" className="mt-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">includes/class-shortcodes.php</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-auto mb-4">
              <pre className="whitespace-pre-wrap">
{`<?php
/**
 * Classe para gerenciar shortcodes do plugin
 */
class Streaming_Plus_Shortcodes {
    
    /**
     * Inicializa os shortcodes
     */
    public static function init() {
        add_shortcode('streaming_plus_list', array('Streaming_Plus_Shortcodes', 'list_shortcode'));
        add_shortcode('streaming_plus_watch', array('Streaming_Plus_Shortcodes', 'watch_shortcode'));
        add_shortcode('streaming_plus_purchases', array('Streaming_Plus_Shortcodes', 'purchases_shortcode'));
    }
    
    /**
     * Shortcode para listar banners/transmissões
     *
     * @param array $atts Atributos do shortcode
     * @return string HTML gerado
     */
    public static function list_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => -1,
            'columns' => 3,
        ), $atts, 'streaming_plus_list');
        
        $banners = Streaming_Plus_Banners::get_active_banners();
        
        ob_start();
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/public/banners-list.php';
        return ob_get_clean();
    }
    
    /**
     * Shortcode para mostrar uma transmissão específica
     *
     * @param array $atts Atributos do shortcode
     * @return string HTML gerado
     */
    public static function watch_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
        ), $atts, 'streaming_plus_watch');
        
        $banner_id = isset($_GET['id']) ? intval($_GET['id']) : intval($atts['id']);
        
        if (!$banner_id) {
            return '<div class="streaming-plus-error">ID da transmissão não fornecido</div>';
        }
        
        $banner = Streaming_Plus_Banners::get_banner($banner_id);
        
        if (!$banner) {
            return '<div class="streaming-plus-error">Transmissão não encontrada</div>';
        }
        
        // Verificar se é gratuito
        $is_free = ($banner->price == 0);
        
        // Verificar se o usuário tem acesso
        $has_access = $is_free;
        $email = isset($_GET['email']) ? sanitize_email($_GET['email']) : '';
        $purchased = isset($_GET['purchased']) && $_GET['purchased'] == 'true';
        
        if (!$has_access && $email) {
            $has_access = Streaming_Plus_Purchases::check_access($email, $banner_id);
        }
        
        if (!$has_access && $purchased && $email) {
            $has_access = true;
        }
        
        // Incrementar contador de visualizações
        Streaming_Plus_Banners::increment_view_count($banner_id);
        
        ob_start();
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/public/watch.php';
        return ob_get_clean();
    }
    
    /**
     * Shortcode para mostrar compras do usuário
     *
     * @param array $atts Atributos do shortcode
     * @return string HTML gerado
     */
    public static function purchases_shortcode($atts) {
        $atts = shortcode_atts(array(), $atts, 'streaming_plus_purchases');
        
        $email = isset($_GET['email']) ? sanitize_email($_GET['email']) : '';
        $purchases = array();
        
        if ($email) {
            $purchases = Streaming_Plus_Purchases::get_user_purchases($email);
        }
        
        ob_start();
        include STREAMING_PLUS_PLUGIN_DIR . 'templates/public/purchases.php';
        return ob_get_clean();
    }
}

// Inicializar shortcodes
Streaming_Plus_Shortcodes::init();
`}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Como Implementar</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Crie uma pasta chamada <code>streaming-plus</code> no diretório <code>wp-content/plugins/</code> do WordPress</li>
          <li>Dentro desta pasta, crie o arquivo principal <code>streaming-plus.php</code> (conforme mostrado anteriormente)</li>
          <li>Crie uma pasta <code>includes</code> e coloque os quatro arquivos de classe acima</li>
          <li>Crie as pastas <code>templates/admin</code> e <code>templates/public</code> para os templates</li>
          <li>Crie as pastas <code>assets/css</code> e <code>assets/js</code> para os arquivos de estilo e script</li>
        </ol>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Próximos Passos</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Crie os templates HTML para o admin (dashboard.php, create-banner.php, manage-banners.php, sales.php)</li>
          <li>Crie os templates HTML para o front-end (banners-list.php, watch.php, purchases.php)</li>
          <li>Adicione CSS e JavaScript para estilizar e adicionar interatividade</li>
          <li>Implemente o processamento de pagamentos (PIX, etc.)</li>
          <li>Configure o player de vídeo com suporte a diferentes formatos (HLS, MP4)</li>
        </ol>
      </Card>
    </div>
  );
}