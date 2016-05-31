define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require('template');

	function SearchBox(value, options) {
		this.options = $.extend({
			placeholder: "搜索关键词"
		}, options);

		var modal = Helper.modal(this.options);
		modal.documentScrollTop = $(document).scrollTop();
		$(document).scrollTop(0);
		modal.value = value;
		render(modal);

		return modal;
	}

	function render(searchBox) {
		searchBox.box.addClass('search-box-container');

		searchBox.html(template('app/templates/public/search-box', {
			value: searchBox.value,
			placeholder: searchBox.options.placeholder
		}));
		addListener(searchBox);
	}

	function addListener(searchBox) {
		searchBox.addAction(".search-box .back", "click", function() {
			searchBox.destroy();
		});

		searchBox.addAction(".search-box .btn-search", "click", function() {
			searchBox.options.search && $.isFunction(searchBox.options.search) && searchBox.options.search.call(searchBox, $(this));
		});

		searchBox.addAction(".search-box .input-search", "change", changeValue);
		searchBox.addAction(".search-box input[type=text]", "keyup", changeValue);

		function changeValue() {
			searchBox.value = $(this).val();
		}
	}

	SearchBox.prototype.destroy = function() {
		this.html.remove();
	};

	module.exports = function(value, options) {
		return new SearchBox(value, options);
	};
});