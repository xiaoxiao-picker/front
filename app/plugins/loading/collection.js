;
(function() {
	var html = [
		'<div class="modal-loading">',
		'<div class="loading-container">',
		'<div class="spinner">',
		'<div class="rect1"></div>',
		'<div class="rect2"></div>',
		'<div class="rect3"></div>',
		'<div class="rect4"></div>',
		'<div class="rect5"></div>',
		'</div>',
		'</div>',
		'</div>'
	].join('');

	var bounce = [
		'<div class="bounce">',
		'<div class="wrap" id="wrap1">',
		'<div class="ball" id="ball1"></div>',
		'</div>',
		'<div class="wrap" id="wrap2">',
		'<div class="ball" id="ball2"></div>',
		'</div>',
		'<div class="wrap" id="wrap3">',
		'<div class="ball" id="ball3"></div>',
		'</div>',
		'<div class="wrap" id="wrap4">',
		'<div class="ball" id="ball4"></div>',
		'</div>',
		'<div class="wrap" id="wrap5">',
		'<div class="ball" id="ball5"></div>',
		'</div>',
		'</div>'
	].join('');


	var collections = [html, bounce];

	// 随机
	// document.getElementById("FrontLoading").innerHTML = collections[Math.floor(Math.random() * collections.length)];
	document.getElementById("FrontLoading").innerHTML = bounce;
})();