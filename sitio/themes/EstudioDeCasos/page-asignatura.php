<?php
/**
 *
 * Estudio de casos: Plantilla Home asignatura.
 * Template Name: Página Home asignatura
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

	add_action( 'wp_enqueue_scripts', 'maki_queue_asignatura', 900 );

	function maki_queue_asignatura(){

		wp_enqueue_style( 'estudiodecasos-asignatura', get_template_directory_uri() . '/css/asignatura.css', array(), null, 'all' );
		wp_enqueue_script( 'estudiodecasos-asignatura', get_template_directory_uri() . '/js/asignatura.js', array(), '', true );

	};

?>
<?php get_header(); ?>

		<section class="container">
		<?php if ( have_posts() ): ?>
			<?php while( have_posts() ): the_post(); ?>

			
			<!--
			<div class="preloader animate__animated animate__fadeIn animate__slow">
				<img src="<?php echo get_template_directory_uri(); ?>/images/logos/logo-facultad-de-farmacia-blanco.svg" alt="Logo Facultad de Farmacia">
				<h1>
					Estudio de Casos
					<small><?php the_title(); ?></small>
				</h1>
				<a class="ingresar waves-effect waves-light btn-large" href="#">Ingresar<i class="material-icons right">arrow_forward_ios</i></a>
			</div>
		    -->


			<div class="casos animate__animated animate__slow animate__delay-2s">
				<nav>
					<a href="#" class="brand"><img src="<?php echo get_stylesheet_directory_uri(); ?>/images/logos/logo-facultad-de-farmacia-blanco.svg" alt="Logo Facultad de Farmacia"></a>
					<ul class="right">
						<li>
							<a class="prev waves-effect waves-light btn-floating" title="Paginar hacia atras"><i class="material-icons">keyboard_double_arrow_left</i></a>
						</li>
						<li>
							<a class="next waves-effect waves-light btn-floating" title="Paginar hacia adelante"><i class="material-icons">keyboard_double_arrow_right</i></a>
						</li>
					</ul>
				</nav>

				<div class="carousel">
				<?php $casos_pages = get_pages( array( 'child_of' => get_the_ID(), 'parent' => get_the_ID(), 'sort_column' => 'menu_order' ) ); ?>
				<?php foreach( $casos_pages as $caso ): ?>
					<div class="carousel-item card z-depth-3">
						<div class="card-content">
							<span class="card-title">
								<strong><?php echo get_the_title( $caso->ID ); ?></strong>
								<small><?php echo get_field( 'nombre', $caso->ID ); ?></small>
							</span>
							<p><?php //echo get_field( 'descripcion', $caso->ID ); ?></p>
							<?php if ( has_post_thumbnail( $caso->ID ) ): ?>
							<p><img src="<?php echo get_the_post_thumbnail_url( $caso->ID, 'full' ); ?>" alt=""></p>
							<?php else: ?>
							<p><img src="<?php echo get_stylesheet_directory_uri(); ?>/images/related-caso-generica.jpg" alt=""></p>
							<?php endif; ?>
						</div>
						<div class="card-action">
							<a class="waves-effect waves-light btn-flat" href="<?php echo get_permalink( $caso->ID ); ?>" title="Ingresar a <?php echo get_the_title( $caso->ID ); ?>">Ingresar<i class="material-icons right">arrow_forward_ios</i></a>
						</div>
					</div>
				<?php endforeach; ?>
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