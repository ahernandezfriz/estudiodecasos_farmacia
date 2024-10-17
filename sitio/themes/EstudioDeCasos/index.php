<?php
/**
 *
 * Estudio de casos: despliegue del fichero principal de la plantilla.
 *
 * @package WordPress
 * @subpackage Maki
 * @author Pablo Masquiarán <pablo.masquiaran@osborn.cl>
 * @since 1.0
 * @license https://www.gnu.org/licenses/lgpl-3.0-standalone.html Licencia Pública General Reducida de GNU
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 * ================================================================================
 */
?>
<?php if( ! defined( 'ABSPATH' ) ) exit; ?>
<?php

	/**
	 * @function maki_queue_index()
	 * @description función para ...
	 * ================================================================================
	 */
	add_action( 'wp_enqueue_scripts', 'maki_queue_index', 900 );

	function maki_queue_index(){

		wp_enqueue_style( 'estudiodecasos-index', get_template_directory_uri() . '/css/index.css', array(), null, 'all' );
		//wp_enqueue_script( 'estudiodecasos-index', get_template_directory_uri() . '/js/index.js', array(), '', true );

	};

?>
<?php get_header(); ?>

		<section class="container">
         <div>
            <img src="<?php echo get_template_directory_uri(); ?>/images/logos/logo-facultad-de-farmacia-blanco.svg" alt="Logo Facultad de Farmacia">
            <pre>
\                               /
 \ Perdido dentro del misterio /
  \    del cuarto amarillo    /
   ]           ...           [
   ]                         [
   ]____                 ____[
   ]   ]\               /[   [
   ]   ] \             / [   [
   ]   ]  ]__       __[  [   [
   ]   ]  ] ]\     /[ [  [   [
   ]   ]  ] ]       [ [  [   [
   ]   ]  ]_]/ (#) \[_[  [   [
   ]   ]  ]   .nHn.   [  [   [
   ]   ]  ]   HHHHH.  [  [   [
   ]   ] /    `HH("N   \ [   [
   ]___]/      HHH  "   \[___[
   ]           NNN           [
   ]           N/"           [
   ]           N H           [
  /            N              \
 /             q,              \
/                               \

   Prototipo - Estudio de casos
            </pre>
         </div>
		</section>

<?php get_footer(); ?>