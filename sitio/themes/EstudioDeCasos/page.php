<?php
 /**
 *
 * Estudio de casos: despliegue de una página (por defecto).
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
<?php get_header(); ?>
	<?php while( have_posts() ): ?>
		<?php the_post(); ?>

		<!-- Área de efecto glich :
		================================================================================ -->
		<div class="image-glitch" aria-hidden="true">
			<ul class="glitch-list">
				<li class="glitch-item"></li>
				<li class="glitch-item"></li>
				<li class="glitch-item"></li>
				<li class="glitch-item"></li>
				<li class="glitch-item"></li>
			</ul>
		</div>

		<section>
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

 Solicitud incorrecta (Error 400)

   <a style="color: blue;" href="https://pmasquiaran.dev/">Píldora azul</a> || <a style="color: red;" href="http://www.udec.cl/">Píldora roja</a>
			</pre>
		</section>

	<?php endwhile; ?>
<?php get_footer(); ?>