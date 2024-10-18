<?php
/**
 *
 * Estudio de casos: Plantilla Portada de caso.
 * Template Name: Página Portada de caso
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

	add_action( 'wp_enqueue_scripts', 'maki_queue_caso', 900 );

	function maki_queue_caso(){

		wp_enqueue_style( 'estudiodecasos-caso', get_template_directory_uri() . '/css/caso.css', array(), null, 'all' );
		//wp_enqueue_script( 'estudiodecasos-caso', get_template_directory_uri() . '/js/caso.js', array(), '', true );

	};

?>
<?php get_header(); ?>

		<section class="container">
		<?php if ( have_posts() ): ?>
			<?php while( have_posts() ): the_post(); ?>
			<div class="animate__animated animate__fadeIn animate__slow">
				<nav>
					<!-- <a href="#" class="brand"><img src="<?php echo get_stylesheet_directory_uri(); ?>/images/logos/logo-facultad-de-farmacia-blanco.svg" alt="Logo Facultad de Farmacia"></a> -->
					<ul class="left">
						<li><a class="waves-effect waves-light btn-floating" title="Ver todos los casos" href="<?php echo get_permalink( wp_get_post_parent_id() ); ?>"><i class="material-icons">home_filled</i></a></li>
					</ul>
					<ul class="right">
						<!-- <li><a class="waves-effect waves-light btn-floating" href="<?php echo get_permalink( wp_get_post_parent_id() ); ?>"><i class="material-icons">home_filled</i></a></li> -->
						<?php $preguntas_pages = get_pages( array( 'child_of' => get_the_ID(), 'parent' => get_the_ID(), 'sort_column' => 'menu_order' ) ); ?>
						<li><a class="waves-effect waves-light btn" href="<?php echo get_permalink( $preguntas_pages[0]->ID ); ?>">Preguntas<i class="material-icons right">arrow_forward_ios</i></a></li>
					</ul>
				</nav>
				<div class="row">
					<div class="col s4">
						<div class="card z-depth-3">
							<div class="card-content">
								<span class="card-title">
									<strong><?php echo get_the_title(); ?></strong>
									<small><?php echo get_field( 'nombre' ); ?></small>
								</span>
								<?php if ( has_post_thumbnail() ): ?>
								<p><img src="<?php the_post_thumbnail_url(); ?>" alt=""></p>
								<?php else: ?>
								<p><img src="<?php echo get_stylesheet_directory_uri(); ?>/images/related-caso-generica.jpg" alt=""></p>
								<?php endif; ?>
								<span class="card-title">
									<small>Descripción</small>
								</span>
								<div class="descripción-caso"><?php echo get_field( 'descripcion' ); ?></div>
								
							</div>
						</div>
					</div>
					<div class="col s8">
						<div class="card z-depth-3 ficha">
							<div class="card-content">
								
								<div>
								
								<?php the_content(); ?>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<?php endwhile; ?>
		<?php else: ?>
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
		<?php endif; ?>
		</section>

<?php get_footer(); ?>