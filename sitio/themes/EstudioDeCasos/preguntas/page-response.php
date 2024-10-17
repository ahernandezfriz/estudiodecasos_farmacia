<?php
/**
 *
 * Estudio de casos: despliegue de la plantilla pregunta uno
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
<?php

header('Content-type: application/json; charset=utf-8');

echo json_encode($_POST, JSON_FORCE_OBJECT);