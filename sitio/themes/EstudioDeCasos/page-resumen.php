<?php
/**
 *
 * Estudio de casos: Plantilla Resumen de caso.
 * Template Name: Página Resumen de caso
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

	add_action( 'wp_enqueue_scripts', 'maki_queue_resumen', 900 );

	function maki_queue_resumen(){

		wp_enqueue_style( 'estudiodecasos-resumen', get_template_directory_uri() . '/css/resumen.css', array(), null, 'all' );
		wp_enqueue_script( 'estudiodecasos-resumen', get_template_directory_uri() . '/js/resumen.js', array(), '', true );

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