define(function(require, exports, module) {
	var template = require("template");

	var boxTemp = 'app/templates/public/category-selector';

	var Selector = function(options) {
		this.namespace = 'category-selector';
		this.container = $(document.body);
		this.isActive = false;
		this.options = $.extend({}, options);

		render(this);
	};

	function render(selector) {
		selector.isActive = true;

		selector.box = $(template(boxTemp, {
			categories: selector.options.categories || []
		}));

		selector.box.appendTo(selector.container);

		addListener(selector);

		setTimeout(function() {
			$(document.body).addClass("modal-open");
			$('#header >.wrapper').addClass('unfold');
			selector.box.addClass('active');
		});
	};

	function addListener(selector) {
		selector.container.on("click." + selector.namespace, "a", function() {
			selector.close();
		});

		selector.container.on("click." + selector.namespace, ".avatar", function() {
			selector.close();
		});
	};

	Selector.prototype.close = function() {
		var selector = this;
		selector.container.off("." + selector.namespace);
		$(document.body).removeClass("modal-open");
		$('#header >.wrapper').removeClass('unfold');
		selector.box.removeClass('active');
		setTimeout(function() {
			selector.isActive = false;
			selector.box.remove();
		}, 400);
	};

	module.exports = function(options) {
		return new Selector(options);
	};
});