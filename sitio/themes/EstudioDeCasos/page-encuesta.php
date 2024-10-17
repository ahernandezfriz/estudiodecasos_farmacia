<?php
/**
 *
 * Estudio de casos: Plantilla Encuesta de caso.
 * Template Name: Página Encuesta de caso
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

	add_action( 'wp_enqueue_scripts', 'maki_queue_encuesta', 900 );

	function maki_queue_encuesta(){

		wp_enqueue_style( 'estudiodecasos-encuesta', get_template_directory_uri() . '/css/encuesta.css', array(), null, 'all' );
		wp_enqueue_script( 'estudiodecasos-encuesta', get_template_directory_uri() . '/js/encuesta.js', array(), '', true );

	};

?>
<?php get_header(); ?>
	<?php while( have_posts() ): ?>

		<section>
			<?php the_content(); ?>
		</section>

		<?php the_post(); ?>
	<?php endwhile; ?>
<?php get_footer(); ?>