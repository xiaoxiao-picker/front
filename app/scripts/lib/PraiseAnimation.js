define(function(require, exports, module) {
	
	var Praise = function(options) {
		this.options = $.extend({
			icon: 'icon-favorite-fill'
		}, options);

		this.container = $(document.body);
		init(this);
	};

	function init(praise) {
		praise.box = $("<div class='praise-modal'><div class='icon'><span class='iconfont " + praise.options.icon + " in'></span></div></div>");
		praise.box.appendTo(praise.container);

		setTimeout(function() {
			praise.box.find('.iconfont').removeClass('in').addClass('out');
		}, 800);

		setTimeout(function() {
			praise.box.remove();
		}, 1300);
	};

	module.exports = function(options) {
		new Praise(options);
	};
});