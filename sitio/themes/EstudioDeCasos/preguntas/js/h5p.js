(function(){

	if( ! H5P || ! H5P.externalDispatcher ){
		return; // Cannot track scores
	}

	/**
	* Handle xAPI statements from H5P.
	* @link https://h5p.org/documentation/api/H5P.XAPIEvent.html
	* @param H5P.XAPIEvent Event containing xAPI data.
	*/
	const xAPIHandler = function( event ){

		// xAPI uses JSON
		const xAPI = event.data.statement;

		if( ! xAPI.result ){
		return; // No result in xAPI statement
		}
		//console.log( 'xAPI.actor', xAPI.actor );
		//console.log( 'xAPI.verb', xAPI.verb );
		//console.log( 'xAPI.object', xAPI.object );
		//console.log( 'xAPI.context', xAPI.context );
		//console.log( 'xAPI.result', xAPI.result );
		H5P.jQuery.ajax({
			type: 'POST',
			url: '/estudiodecasos/sitio/themes/EstudioDeCasos/preguntas/page-response.php',
			data: xAPI.result,
			//dataType : 'json',
			success: function( result ){
				console.log( 'Desde PHP: ', result );
			},
			error : function( xhr, status ){
				console.log( 'Disculpe, existió un problema' );
			}
		});

	};

	// Listen to xAPI statements
	H5P.externalDispatcher.on( 'xAPI', xAPIHandler );

}());