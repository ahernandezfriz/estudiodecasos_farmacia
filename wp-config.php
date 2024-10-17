<?php
/** 
 * Configuración básica de WordPress.
 *
 * Este archivo contiene las siguientes configuraciones: ajustes de MySQL, prefijo de tablas,
 * claves secretas, idioma de WordPress y ABSPATH. Para obtener más información,
 * visita la página del Codex{@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} . Los ajustes de MySQL te los proporcionará tu proveedor de alojamiento web.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

/* Environment */
define( 'WP_ENVIRONMENT_TYPE', 'production' );

/* Database connection */
define( 'DB_NAME', 'estudiocasos' );
define( 'DB_USER', 'estudiocasos' );
define( 'DB_PASSWORD', 'p7o)SD6)b4IuVpgg' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', 'utf8mb4_general_ci' );

/* Tables */
$table_prefix  = 'h5p_';
define( 'CUSTOM_USER_TABLE',      $table_prefix . 'usuarios' );
define( 'CUSTOM_USER_META_TABLE', $table_prefix . 'usuariometadatos' );

/**#@+
 * Claves únicas de autentificación.
 *
 * Define cada clave secreta con una frase aleatoria distinta.
 * Puedes generarlas usando el {@link https://api.wordpress.org/secret-key/1.1/salt/ servicio de claves secretas de WordPress}
 * Puedes cambiar las claves en cualquier momento para invalidar todas las cookies existentes. Esto forzará a todos los usuarios a volver a hacer login.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'lneU<Gi0C+w;M#9rJ?B0wRH&]KG9{gV%u:|{SX}_NoKOq-XE@kv_j,D3q)-/D6[w' );
define( 'SECURE_AUTH_KEY',  ')/P;Zr0/q<moSXgZW^&+<h_#|a+:Yi+H3jj*LNgX5-tio S|6AvG>;1Yt9Y+);(%' );
define( 'LOGGED_IN_KEY',    'n{vsQ~Gxywq<}IWLW++[TI(rKbuJ9T >yO}U]VhYJRC+9~BOy-&Fu%k]Q<4Ml:Jr' );
define( 'NONCE_KEY',        'SG^k%u. N&7!=h|uXt3lq`X+?(.?L%i1UuAoQ`Hax5IH8Du0AY[Zd>gE-k6w|8d$' );
define( 'AUTH_SALT',        'q-b(vA`h_QlP%Qfyt<X`|4Z):DQ^U k]BW?8GvI,E#kwj+SAxHDPj+U3b`(Qsnd~' );
define( 'SECURE_AUTH_SALT', '&|!v)]u>;y=XPC;N]>Ao.,T4ii)|h*kW]g-q5($-Jmf~mos xx<d+mL*2l|RS]n:' );
define( 'LOGGED_IN_SALT',   '~e!G,u,Tb`|N9!b!|wZn7]l.w&n1xb?PT^hv`%qHiE+t(8qIx,+-VkQ|5*!@L=B0' );
define( 'NONCE_SALT',       'PKvS]W:TLsOl[xeOVC[.OYjC6~x+niTJB}o)D1XBkX{mg3>~X4.+~&hv`!pakB1+' );

/**#@-*/

/* HTTPS */
define( 'FORCE_SSL_LOGIN', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'WP_DISABLE_FATAL_ERROR_HANDLER', false );
define( 'WP_DISABLE_ADMIN_EMAIL_VERIFY_SCREEN', false );

/* URL / Path */
define( 'WP_SITEURL', 'https://estudiodecasos.udec.cl' );
define( 'WP_HOME', 'https://estudiodecasos.udec.cl' );
define( 'WP_CONTENT_DIR', '/home/estudiocasos/sitio' );
define( 'WP_CONTENT_URL', 'https://estudiodecasos.udec.cl/sitio' );
define( 'WP_PLUGIN_DIR', '/home/estudiocasos/sitio/plugins' );
define( 'PLUGINDIR', '/home/estudiocasos/sitio/plugins' );
define( 'WP_PLUGIN_URL', 'https://estudiodecasos.udec.cl/sitio/plugins' );
define( 'UPLOADS', 'sitio/uploads' );

/* Content */
define( 'AUTOSAVE_INTERVAL', 60 );
define( 'WP_POST_REVISIONS', false );
define( 'MEDIA_TRASH', false );
define( 'EMPTY_TRASH_DAYS', 7 );
define( 'WP_MAIL_INTERVAL', 86400 );

/* Memory */
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '256M' );

/* Updating */
define( 'AUTOMATIC_UPDATER_DISABLED', false );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
define( 'CORE_UPGRADE_SKIP_NEW_BUNDLED', false );

/* File edition */
define( 'DISALLOW_FILE_MODS', false );
define( 'DISALLOW_FILE_EDIT', true );
define( 'IMAGE_EDIT_OVERWRITE', true );

/* Performance */
//define( 'WP_CACHE_KEY_SALT', 'a4217j8tdllpfepaxd:' );
//define( 'COMPRESS_CSS', true );
//define( 'COMPRESS_SCRIPTS', true );
//define( 'CONCATENATE_SCRIPTS', false );
//define( 'ENFORCE_GZIP', false );

/* Cron */
define( 'DISABLE_WP_CRON', true );
define( 'ALTERNATE_WP_CRON', false );
define( 'WP_CRON_LOCK_TIMEOUT', 60 );

/* FTP Access */
define( 'FS_METHOD', 'ssh2' );
define( 'FTP_BASE', '/home/estudiocasos/' );
define( 'FTP_CONTENT_DIR', '/home/estudiocasos/sitio/' );
define( 'FTP_PLUGIN_DIR', '/home/estudiocasos/sitio/plugins/' );
define( 'FTP_USER', 'estudiocasos' );
define( 'FTP_PASS', 'p7o)SD6)b4IuVpgg' );
define( 'FTP_HOST', '152.74.17.187' );
define( 'FTP_SSL', true ); // Sólo en el caso que tengamos SFTP 

/* MultiSite */
define( 'WP_ALLOW_MULTISITE', false );
//define( 'WP_DEFAULT_THEME', 'estudiodecasos' );

/* Debug */
define( 'WP_DEBUG', false );
if ( WP_DEBUG ) {
   define( 'WP_DEBUG_DISPLAY', true );
   define( 'WP_DEBUG_LOG', true );
}
define( 'SCRIPT_DEBUG', true );
define( 'SAVEQUERIES', true );

/* ¡Eso es todo, deja de editar! Feliz blogging */

/** WordPress absolute path to the Wordpress directory. */
if ( !defined('ABSPATH') )
   define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
