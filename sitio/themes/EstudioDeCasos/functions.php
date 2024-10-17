<?php
/**
 *
 * Estudio de casos: Funciones y definiciones globales.
 *
 * @package WordPress
 * @subpackage Maki
 * @author Pablo Masquiarán <pablo.masquiaran@osborn.cl>
 * @since 1.0
 * @license https://www.gnu.org/licenses/lgpl-3.0-standalone.html Licencia Pública General Reducida de GNU
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * When using a child theme you can override certain functions (those wrapped
 * in a function_exists() call) by defining them first in your child theme's
 * functions.php file. The child theme's functions.php file is included before
 * the parent theme's file, so the child theme functions would be used.
 *
 * @link https://codex.wordpress.org/Theme_Development
 * @link https://codex.wordpress.org/Child_Themes
 *
 * Functions that are not pluggable (not wrapped in function_exists()) are
 * instead attached to a filter or action hook.
 *
 * For more information on hooks, actions, and filters,
 * {@link https://codex.wordpress.org/Plugin_API}
 * ================================================================================
 */

 add_theme_support( 'post-thumbnails', array( 'page' ) ); 

/**
 * @description función que desactiva la barra de administración del frontend
 * ================================================================================
 */
add_filter( 'show_admin_bar' , '__return_false' );

/**
 * @description función que deshabilita la funcionalidad XML RPC
 * ================================================================================
 */
add_filter( 'xmlrpc_enabled', '__return_false' );

/**
 * @description función que deshabilita el escalado de imágenes grandes
 * ================================================================================
 */
add_filter( 'big_image_size_threshold', '__return_false' );

/**
 * @description función que deshabilita el editor Gutenberg de la administración
 * ================================================================================
 */
add_filter('use_block_editor_for_post', '__return_false' );

/**
 * @description función que deshabilita ...
 * ================================================================================
 */
add_filter( 'gutenberg_use_widgets_block_editor', '__return_false' );

/**
 * @description función que deshabilita ...
 * ================================================================================
 */
add_filter( 'use_widgets_block_editor', '__return_false' );

/**
 * @description función que deshabilita el encabezado de respuesta X-Redirect-By
 * ================================================================================
 */
add_filter( 'x_redirect_by', '__return_false' );

/**
 * @function maki_limpiar_admin_bar()
 * @description función que elimina elementos del navbar en el backend
 * 
 * ( 'search' ) => Para eliminar la caja de búsqueda.
 * ( 'comments' ) => Para eliminar el aviso de comentarios
 * ( 'updates' ) => Para eliminar el aviso de actualizaciones
 * ( 'edit' ) => Elimina editar entrada y páginas
 * ( 'get-shortlink' ) => Proporciona un enlace corto a esa página/post
 * ( 'my-sites' ) => Elimina el menu my sitios, si utilizas la función multisitios de wordpress
 * ( 'site-name' ) => Elimina el nombre de la web
 * ( 'wp-logo' ) => Elimina el logo(y el sub Menú)
 * ( 'my-account' ) => Elimina los enlaces a su cuenta. El ID depende de si usted tiene Avatar habilitado o no.
 * ( 'view-site' ) => Elimina el sub menú que aparece al pasar el cursor sobre el nombre de la web
 * ( 'about' ) => Elimina el enlace “Sobre WordPress”
 * ( 'wporg' ) => Elimina el enlace a wordpress.org
 * ( 'documentation' ) => Elimina el enlace a la documentación oficial (Codex)
 * ( 'support-forums' ) => Elimina el enlace a los foros de ayuda
 * ( 'feedback' ) => Elimina el enlace “Sugerencias”
 * ( '_options' ) => Elimina el enlace ...
 * ( 'tribe-events' ) => Elimina el enlace ...
 *
 * ================================================================================
 */
add_action( 'wp_before_admin_bar_render', 'maki_limpiar_admin_bar' );

function maki_limpiar_admin_bar(){

	global $wp_admin_bar;

	$wp_admin_bar->remove_menu ( 'new-content' );
	$wp_admin_bar->remove_menu ( 'search' );
	$wp_admin_bar->remove_menu ( 'comments' );
	$wp_admin_bar->remove_menu ( 'updates' );
	$wp_admin_bar->remove_menu ( 'edit' );
	$wp_admin_bar->remove_menu ( 'get-shortlink' );
	$wp_admin_bar->remove_menu ( 'my-sites' );
	$wp_admin_bar->remove_menu ( 'wp-logo' );
	$wp_admin_bar->remove_menu ( 'view-site' );
	$wp_admin_bar->remove_menu ( 'about' );
	$wp_admin_bar->remove_menu ( 'wporg' );
	$wp_admin_bar->remove_menu ( 'documentation' );
	$wp_admin_bar->remove_menu ( 'support-forums' );
	$wp_admin_bar->remove_menu ( 'feedback' );
	$wp_admin_bar->remove_menu ( '_options' );
	$wp_admin_bar->remove_menu ( 'tribe-events' );

}

/**
 * @function maki_limpiar_dashboard ( void )
 * @descripción función que restringe el dashboard del backend
 * ================================================================================
 */
add_action( 'wp_dashboard_setup', 'maki_limpiar_dashboard' );

function maki_limpiar_dashboard(){

	remove_meta_box ( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box ( 'dashboard_recent_drafts', 'dashboard', 'side' );
	remove_meta_box ( 'dashboard_primary', 'dashboard', 'side' );
	remove_meta_box ( 'dashboard_secondary', 'dashboard', 'side' );
	remove_meta_box ( 'dashboard_incoming_links', 'dashboard', 'normal' );
	remove_meta_box ( 'dashboard_plugins', 'dashboard', 'normal' );
	remove_meta_box ( 'dashboard_recent_comments', 'dashboard', 'normal' );
	remove_meta_box ( 'dashboard_right_now', 'dashboard', 'normal' );
	remove_meta_box ( 'dashboard_browser_nag', 'dashboard', 'normal' );
	remove_meta_box ( 'dashboard_activity', 'dashboard', 'normal' );

}

/**
 * @function maki_queue_style()
 * @description función para incorporar el estilo del tema hijo encolado al padre
 * ================================================================================
 */
add_action( 'wp_enqueue_scripts', 'maki_queue_style', 100 );

function maki_queue_style(){

	wp_dequeue_style( 'ionicons' );
	wp_dequeue_style( 'classic-theme-styles' );
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'wc-block-style' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'h5p-plugin-styles' );

	wp_deregister_style( 'ionicons' );
	wp_deregister_style( 'classic-theme-styles' );
	wp_deregister_style( 'wp-block-library' );
	wp_deregister_style( 'wp-block-library-theme' );
	wp_deregister_style( 'wc-block-style' );
	wp_deregister_style( 'global-styles' );
	wp_deregister_style( 'h5p-plugin-styles' );

	wp_enqueue_style( 'estudiodecasos-google-fonts', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&family=Material+Icons&display=swap', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-materialize', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-animate', 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-estilo', get_template_directory_uri() . '/style.css', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-maki', get_stylesheet_directory_uri() . '/css/maki.css', array(), null, 'all' );

}

/**
 * @function maki_queue_script()
 * @description función para incorporar el estilo del tema hijo encolado al padre
 * ================================================================================
 */
add_action( 'wp_enqueue_scripts', 'maki_queue_script', 900 );

function maki_queue_script(){

	wp_dequeue_script( 'jquery' );
	wp_dequeue_script( 'jquery-migrate' );
	wp_dequeue_script( 'comment-reply' );

	wp_deregister_script( 'jquery' );
	wp_deregister_script( 'jquery-migrate' );
	wp_deregister_script( 'comment-reply' );

	wp_enqueue_script( 'estudiodecasos-jquery', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js', array(), '', true );
	wp_enqueue_script( 'estudiodecasos-materialize', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js', array(), '', true );
	wp_enqueue_script( 'estudiodecasos-maki', get_stylesheet_directory_uri() . '/js/maki.js', array(), '', true );

}

/**
 * @function maki_cusmtom_login()
 * @description función para personalizar diseño del formulario de login
 * ================================================================================
 */
add_action( 'login_enqueue_scripts', 'maki_custom_login', 100 );

function maki_custom_login(){
	wp_enqueue_style( 'estudiodecasos-google-fonts', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-estilo', get_template_directory_uri() . '/style.css', array(), null, 'all' );
	wp_enqueue_style( 'estudiodecasos-login', get_stylesheet_directory_uri() . '/login.css', array(), null, 'all' );
}

/**
 * @function maki_remove_html5_tags()
 * @description función para remover atributos innecesarios de los .js/.css
 * ================================================================================
 */
add_action( 'template_redirect', 'maki_remove_html5_tags', 100 );

function maki_remove_html5_tags(){

	ob_start( function( $buffer ){

		$buffer = str_replace( array( ' type="text/javascript"', " type='text/javascript'" ), '', $buffer );
		$buffer = str_replace( array( ' type="text/css"', " type='text/css'" ), '', $buffer );
		$buffer = str_replace( array( ' frameborder="0"', " frameborder='0'" ), '', $buffer );
		$buffer = str_replace( array( ' scrolling="no"', " scrolling='no'" ), '', $buffer );
		//$buffer = str_replace( array( ' /', ' / ', '/ ' ), '', $buffer );

		return $buffer;

	});

}

/**
 * @function maki_remove_version()
 * @description función para remover el argumento de la versión de los .js/.css
 * ================================================================================
 */
add_filter( 'style_loader_src', 'maki_remove_version', 100 );
add_filter( 'script_loader_src', 'maki_remove_version', 100 );

function maki_remove_version( $src ){
	if( strpos( $src, '?ver=' ) )
		$src = remove_query_arg( 'ver', $src );
	return $src;
}

/**
 * @function maki_disable_rest_api()
 * @description función para deshabilitar completamente la API REST de WordPress
 * ================================================================================
 */
add_action( 'rest_authentication_errors', 'maki_disable_rest_api' );

function maki_disable_rest_api( $result ){

	if ( ! empty( $result ) )
		return $result;

	if ( ! current_user_can( 'administrator' ) )
		return new WP_Error( 'rest_not_admin', __( 'La REST API está desactivada en este sitio.' ),  ['status' => 401] );

	return $result;

}

/**
 * @function maki_cache_http_header()
 * @description función para especificar cabeceras CORS
 * ================================================================================
 */
//add_action( 'send_headers', 'maki_cache_http_header' );

function osborn_cache_http_header(){
	header( 'Cache-Control: max-age=31536000' );
	header( 'Cache-Control: public' );
	//header( 'Cache-Control: post-check=0, pre-check=0', false );
	header( 'Expires: 31536000' );
	//header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s' ) . ' GMT' );
	header( 'Pragma: cache' );
}

/**
 * @function maki_cors_http_header()
 * @description función para especificar cabeceras CORS
 * ================================================================================
 */
//add_action( 'send_headers', 'maki_cors_http_header' );

function maki_cors_http_header(){

	header( 'Access-Control-Allow-Credentials: true' );
	header( 'Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method' );
	header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
	header( 'Access-Control-Allow-Origin: ' . esc_url( home_url( '/' ) ) . '' );
	header( 'Access-Control-Expose-Headers: Link', false );
	header( 'Content-Security-Policy: upgrade-insecure-requests' );
	//header( 'Content-Security-Policy: form-action self; frame-src self ' . esc_url( home_url( '/' ) ) . '; frame-ancestors self ' . esc_url( home_url( '/' ) ) . ';' );
	header( 'Permissions-Policy: geolocation=(), midi=(), sync-xhr=(), accelerometer=(), gyroscope=(), magnetometer=(), payment=(), camera=(), microphone=(), usb=(), fullscreen=(self)' );
	header( 'Referrer-Policy: no-referrer, strict-origin-when-cross-origin' );
	header( 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' );
	header( 'X-Content-Security-Policy: allow "self"' );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'X-Permitted-Cross-Domain-Policies: none' );
	header( 'X-Powered-By: Pablo Masquiarán' );
	header( 'X-XSS-Protection: 1; mode=block' );

}

/**
 * @function maki_limpiar_head()
 * @description función que elimina y sobreescribe los metadatos del header
 * ================================================================================
 */
add_action( 'init', 'maki_limpiar_head', 100 );

function maki_limpiar_head(){

	remove_action( 'wp_head', 'rsd_link' ); // Removes the RSD link
	remove_action( 'wp_head', 'wp_generator' ); // Removes the WordPress version i.e. -
	remove_action( 'wp_head', 'index_rel_link' ); // Removes the index link
	remove_action( 'wp_head', 'wlwmanifest_link' ); // Removes the wlwmanifest link
	remove_action( 'wp_head', 'feed_links', 2 ); // Removes links to the general feeds: Post and Comment Feed
	remove_action( 'wp_head', 'feed_links_extra', 3 ); // Removes the links to the extra feeds such as category feeds
	remove_action( 'wp_head', 'start_post_rel_link' ); // Removes the start link
	remove_action( 'wp_head', 'parent_post_rel_link' ); // Removes the prev link
	remove_action( 'wp_head', 'wp_shortlink_wp_head' ); // Removes the WP shortlink
	remove_action( 'wp_head', 'adjacent_posts_rel_link' );
	remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head' ); // Removes the relational links for the posts adjacent to the current post
	remove_action( 'wp_head', 'insert_og_meta' );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_head', 'wp_resource_hints', 2 );

	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );

}

/**
 * @function maki_favicon_remover()
 * @description función para redireccionar ícono de "favoritos" por defecto
 * ================================================================================
 */
add_action( 'do_faviconico', 'maki_favicon_remover' );

function maki_favicon_remover(){

	wp_redirect( get_stylesheet_directory_uri() . '/images/ico/favicon.ico' );
	exit;

}

/**
 * @function maki_web_favicons()
 * @description función para incorporar íconos de "favoritos" y para móviles
 * ================================================================================
 */
add_action( 'admin_head', 'maki_web_favicons' );
add_action( 'login_head', 'maki_web_favicons' );
add_action( 'wp_head', 'maki_web_favicons', 100 );

function maki_web_favicons(){

	echo '
		<!-- Área de íconos favoritos :
		================================================================================ -->
		<link rel="apple-touch-icon" sizes="180x180" href="' . get_stylesheet_directory_uri() . '/images/ico/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="' . get_stylesheet_directory_uri() . '/images/ico/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="' . get_stylesheet_directory_uri() . '/images/ico/favicon-16x16.png">
		<link rel="manifest" href="' . get_stylesheet_directory_uri() . '/images/ico/site.webmanifest">
		<link rel="mask-icon" href="' . get_stylesheet_directory_uri() . '/images/ico/safari-pinned-tab.svg" color="#0b0e13">
		<link rel="shortcut icon" href="' . get_stylesheet_directory_uri() . '/images/ico/favicon.ico">
		<meta name="msapplication-TileColor" content="#0b0e13">
		<meta name="msapplication-config" content="' . get_stylesheet_directory_uri() . '/images/ico/browserconfig.xml">
		<meta name="theme-color" content="#0b0e13">' . "\n";

}

/**
 * @function maki_mime_type()
 * @description función para incluir formato de compresión de imagen webp
 * ================================================================================
 */
add_filter( 'mime_types', 'maki_mime_type' );

function maki_mime_type( $existing_mimes ) {
	// añade webp a la lista de mime types
	$existing_mimes['svg'] = 'image/svg+xml';
	$existing_mimes['webp'] = 'image/webp';
	// devuelve el array a la funcion con el nuevo mime type
	return $existing_mimes;
}

/**
 * @function maki_menu_extra_atts()
 * @description función para incorporar el atributo acceskey a los ítems de menú
 * ================================================================================
 */
add_filter( 'nav_menu_link_attributes', 'maki_menu_extra_atts', 10, 3 );

function maki_menu_extra_atts( $atts, $item, $args ){

	$atts['acceskey'] = $item->rel;
	return $atts;

}

/**
 * @function maki_logo_url()
 * @description función para cambiar el enlace al inicio de sesión de WordPress
 * ================================================================================
 */
add_filter( 'login_headerurl', 'maki_logo_url' );

function maki_logo_url(){
	return 'https://pmasquiaran.dev/';
}

/**
 * @function maki_logo_title()
 * @description función para cambiar el título al inicio de sesión de WordPress
 * ================================================================================
 */
add_filter( 'login_headertext', 'maki_logo_title' );

function maki_logo_title(){
	return 'Pablo Masquiarán >_ Full Stack Developer';
}

/**
 * @function maki_widgets_init()
 * @description Enables the Excerpt meta box in post type edit screen
 * ===============================================================================================
 */
//add_action( 'widgets_init', 'maki_widgets_init' );

function maki_widgets_init(){

    register_sidebar(
        array(
            'name' => 'Widgets Herramientas',
            'id' => 'widgets-herramientas',
            'description' => 'Área de widgets para la sección de herramientas',
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="widget-title">',
            'after_title'   => '</h2>'
        )
    );

}

