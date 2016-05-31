define(function(require, exports, module) {
	$(document).on("click.global.accordion", ".accordion .btn-expand", function() {
		var $parent = $(this).parents(".accordion");
		var $body = $parent.find(".accordion-body");
		var active = $parent.hasClass("active");
		if (active) {
			$parent.removeClass("active");
			$body.slideUp(200);
		}else{
			$parent.addClass("active");
			$body.slideDown(200);
		}
	});
});