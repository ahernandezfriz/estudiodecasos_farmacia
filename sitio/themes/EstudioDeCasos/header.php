<?php
/**
 *
 * Estudio de casos: despliegue del bloque header de la plantilla [get_header ()].
 *
 * @package WordPress
 * @subpackage Maki
 * @author Pablo Masquiarán <pablo.masquiaran@osborn.cl>
 * @since 1.0
 * @license https://www.gnu.org/licenses/lgpl-3.0-standalone.html Licencia Pública General Reducida de GNU
 * @link https://developer.wordpress.org/themes/basics/template-files/
 * ================================================================================
 */
?>
<?php if( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>
<html dir="ltr" <?php language_attributes(); ?>>

	<head>

		<!-- Área de información :
		================================================================================ -->
        <title><?php bloginfo( 'name' ); ?> :: <?php echo $titulo = is_front_page() ? get_bloginfo( 'description' ) : get_the_title(); ?></title>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="author" content="<?php echo get_stylesheet_directory_uri(); ?>/humans.txt">
		<meta name="contact" content="pablo.masquiaran@osborn.cl">
		<meta name="copyright" content="Copyright &copy; 2024 Pablo Masquiarán. Algunos derechos reservados.">
		<meta name="description" content="Soy un cristiano-esposo-padre por convicción; y un programador-innovador-emprendedor por vocación que piensa en código fuente mezclado con rock.">
		<meta name="keywords" content="pablo masquiaran, frontend developer, backend developer, fullstack developer, ingeniero, computacion, informatica, programador, web, proyectos y desarrollos, osborn, udec, portada, sobre mi, portafolio, experiencia, conversemos">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, shrink-to-fit=no">
		<link rel="author" href="<?php echo get_stylesheet_directory_uri(); ?>/humans.txt">
		<link rel="canonical" href="https://pmasquiaran.dev/">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        <!-- Área de información Dublin Core :
        ================================================================================ -->
        <meta name="DC.title" content="Pablo Masquiarán >_ Full Stack Developer">
        <meta name="DC.creator" content="Pablo Masquiarán">
        <meta name="DC.description" content="Soy un cristiano-esposo-padre por convicción; y un programador-innovador-emprendedor por vocación que piensa en código fuente mezclado con rock.">
        <meta name="DC.keywords" content="pablo masquiaran, frontend developer, backend developer, fullstack developer, ingeniero, computacion, informatica, programador, web, proyectos y desarrollos, osborn, udec, portada, sobre mi, portafolio, experiencia, conversemos">
        <meta name="DC.type" content="Text">
        <meta name="DC.format" content="text/html">
        <meta name="DC.source" content="https://pmasquiaran.dev/">
        <meta name="DC.language"  content="es">

        <!--

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

        -->

		<!-- Área de definiciones emanadas de wp_head() :
		================================================================================ -->
		<?php wp_head(); ?>
		<?php echo "\n"; ?>

	</head>

	<body <?php body_class(); ?>>
