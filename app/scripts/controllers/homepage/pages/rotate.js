define(function(require, exports, module) {
	var template = require("template");
	var Helper = require("helper");

	var pageMaker = require("scripts/controllers/homepage/pages/pageMaker");

	function Page(options) {
		this.name = options.name;
		this.json = options.json;
		this.orgId = options.orgId || Application.organization.id;
		this.json.menus = pageMaker.menus(this.orgId, this.json.menus);
	};


	Page.prototype.render = function(callback, options) {
		var _this = this;
		var menus = $.extend([], _this.json.menus);
		$("#content").html(template("app/templates/homepages/rotate", {
			json: _this.json,
			menus: menus,
			organization: Application.organization.info
		}));
		transform();
		Helper.execute(callback);
	};



	function transform() {
		var items = document.querySelectorAll('.menuItem');

		for (var i = 0, l = items.length; i < l; i++) {
			items[i].style.left = (50 - 40 * Math.cos(-0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";

			items[i].style.top = (50 + 40 * Math.sin(-0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
		}
		setTimeout(function() {
			$("#FlowerBox").addClass("open");
		}, 500);

		$("#CONTROLLER").on("click", function() {
			$("#FlowerBox").toggleClass("open");
		});
	};

	module.exports = function(options) {
		return new Page(options);
	};
});