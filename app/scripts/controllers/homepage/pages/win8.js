define(function(require, exports, module) {
	var template = require("template");
	var Helper = require("helper");
	var OrganizationService = require("OrganizationService");
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
		menus = menusMaker(menus);
		Application.organization.getExtend().done(function() {
			$("#content").html(template("app/templates/homepages/win8", {
				json: _this.json,
				menus: menus,
				organization: Application.organization
			}));
			$("#WindowsBox").height($(window).height());
			Helper.execute(callback);
		}).fail(function(message) {
			Helper.confirm(message + "，是否重新加载？", function() {
				_this.render();
			});
		});
	};

	function menusMaker(menus) {
		var classNames = ["times2", "times1", "times3", "times1", "times1", "times1", "times1", "times2"];
		var lastClassNames = ["times3", "times1", "times3", "times3", "times2", "times1", "times3", "times2"];
		for (var i = 0; i < menus.length; i++) {
			var menu = menus[i];
			menu.className = i < (menus.length - 1) ? classNames[i % 8] : lastClassNames[i % 8];
		};
		return menus;
	};

	module.exports = function(options) {
		return new Page(options);
	};
});