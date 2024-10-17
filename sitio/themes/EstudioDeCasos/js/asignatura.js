( function () {

	$('.ingresar').click(function(){
		$('.preloader').addClass('ocultar');
		$('.casos').removeClass('ocultar');
		$('.casos').addClass('animate__fadeInLeft');
	});

	$('.carousel').carousel({
		dist: -50,
		indicators: true,
		padding: 15,
		shift: 15
	});

	$('.next').click(function(){
		$('.carousel').carousel('next');
	});

	$('.prev').click(function(){
		$('.carousel').carousel('prev');
	});

} )();