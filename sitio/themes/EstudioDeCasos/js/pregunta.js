/*
( function () {

	let iteracionContador = 0;
	let iteracionMaxima = 10;
	const variableDeIntervalo = setInterval( modificarIframe, 500 );

	function modificarIframe() {
		// Chequeo que el contador de iteraciones no supere el iterador máximo para evitar el consumo de recursos.
		if ( iteracionContador === iteracionMaxima ) {
			// Paro el intervalo.
			clearInterval( variableDeIntervalo );
			return;
		}
		
		// Busco el iframe en el DOM.
		let iframeAModificar = document.querySelector( 'iframe' );
		// Verifico si el iframe ya está cargado.
		if (
			! iframeAModificar
			|| typeof iframeAModificar === 'undefined'
		) {
			iteracionContador++;
			return;
		}
		
		// Detengo el intervalo para evitar el consumo de recursos del navegador.
		clearInterval( variableDeIntervalo );
		// Obtengo el contenido del elemento iframe.
		let doc = iframeAModificar.contentDocument;
		let nuevosEstilos = `
		<style>
			.h5p-iframe > body {
				align-items: center;
				display: flex;
				font-family: 'Montserrat', sans-serif;
				justify-content: center;
			}
			.h5p-interactive-video .h5p-control.h5p-star,
			.h5p-interactive-video .h5p-slider,
			.h5p-interactive-video .h5p-controls-right {
				visibility: hidden !important;
			}
		</style>
		`;
		// La siguiente línea sobrescribe el contenido del iframe con los nuevos estilos.
		doc.head.innerHTML = doc.head.innerHTML + nuevosEstilos;
	}

})();
*/
$(document).ready(function() {
 
    if (typeof H5P !== 'undefined' && H5P.externalDispatcher){

        console.log ('pregunta.js Dentro: typeof H5P !== "undefined" && H5P.externalDispatcher');

		H5P.externalDispatcher.on('xAPI', function (event){

			let 
				$sentencia = event.data.statement,
				$identificador = event.data.statement.object.definition.extensions['http://h5p.org/x-api/h5p-local-content-id'],
				$nombre = event.data.statement.object.definition.name['en-US'];

			//console.log($sentencia);
			//console.log($identificador);
			//console.log($nombre);

			if(typeof $sentencia.context.contextActivities.parent == 'object'){

				if(event.getVerb() == 'attempted'){
					console.log(event.getVerb(), $sentencia.context.contextActivities.parent);
				}

				if(typeof $sentencia.result  == 'undefined'){
					console.log('comienzo');
				}else{
					console.log('desarrollo');
					//$sentencia.result.completion result.response
					if(typeof $sentencia.result == 'object'){

					}
				}

			}

		});

    }else{
    	console.log('pregunta.js Fuera: typeof H5P == "undefined" || H5P.externalDispatcher');
    }
});