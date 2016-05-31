define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	function ThemeSelectorModal(themes, options) {
		var modal = this;
		this.state = "closed";
		this.options = options = $.extend({}, options);
		var messageBox = options.container;
		modal.commentBox = messageBox.find("#COMMENTLIST");
		modal.themeBox = $(template("app/templates/wall/wall-theme-selector", {
			themes: themes,
			activeThemeCode: options.activeThemeCode
		}));

		modal.themeBox.on("click.wall-theme-selector", ".btn-close", function() {
			modal.destroy();
		});
		modal.themeBox.on("click.wall-theme-selector", ".theme", function() {
			var themeCode = $(this).attr("data-theme-code");
			if (themeCode == options.activeThemeCode) {
				modal.destroy();
				return;
			}

			$(this).siblings("li.theme").removeClass("active").end().addClass("active");
			modal.options.activeThemeCode = themeCode;

			modal.options.select.call(modal, themeCode);
		});

		modal.themeBox.appendTo(messageBox);
	}


	ThemeSelectorModal.prototype.open = function() {
		this.themeBox.show();
		this.commentBox.css("visibility", "hidden");
		this.state = "opened";
		return this;
	};

	ThemeSelectorModal.prototype.destroy = function() {
		this.themeBox.hide();
		this.commentBox.css("visibility", "");
		Helper.execute(this.options.destroy);
		this.state = "closed";
		return this;
	};

	module.exports = function(themes, options) {
		return new ThemeSelectorModal(themes, options);
	};
});