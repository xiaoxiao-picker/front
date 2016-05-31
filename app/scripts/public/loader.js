define(function(require, exports, module) {

	module.exports = {
		show: function() {
			var $loader = $("#header").find(".spinner");
			$loader.css({
				opacity: 100
			}).show();
		},
		hide: function() {
			var $loader = $("#header").find(".spinner");
			$loader.animate({
				opacity: 0
			}, 200, function() {
				$(this).hide();
			});
		}
	};
});