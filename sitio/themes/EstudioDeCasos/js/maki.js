( function () {

	$('.sidenav').sidenav();

	$('.dropdown-trigger').dropdown({
		'constrainWidth': false
	});
	
	$('.materialboxed').materialbox();

	$(document).on('click','.video-butt',function(){
		$('#video-modal .video-container').html('<iframe id="myIframe" width="300" height="200" src="' + $(this).attr('href') + '?rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>'); // embed video
		$('#video-modal').modal('open');
		
		return false;
	})
	function videoTrash(){ //remove video embed on close
		$('#video-modal .video-container').empty();
	}
	$('#video-modal').modal({onCloseEnd:videoTrash}); // initialize materialize modal
	

} )();