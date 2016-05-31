define(function(require, exports, module) {
	exports.done = function() {
		var scrollTop = $(document).scrollTop();
		$(document.body).addClass("fixed").css("top", -scrollTop).attr("data-scroll-top", scrollTop);
	};

	exports.cancel = function() {
		var scrollTop = $(document.body).removeClass("fixed").attr("data-scroll-top");
		$(document).scrollTop(scrollTop);
	};
});