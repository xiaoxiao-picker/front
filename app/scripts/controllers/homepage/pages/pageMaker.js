define(function(require, exports, module) {
	var Helper = require("helper");

	function makeMenusUrl(orgId, menus) {
		for (var i = 0, menu; i < menus.length; i++) {
			menu = menus[i];
			if (menu.type == "SYSTEM") {
				menu.url = makeUrlWithCode(orgId, menu);
			}
		};
		return menus;
	}

	function makeUrlWithCode(orgId, menu) {
		var root = "#organization/" + orgId + "/";
		if (menu.code == "home") {
			return root + (menu.homepageId ? menu.homepageId + "/index" : "index") + "&title=" + menu.name;
		}
		if (menu.code == "events") {
			var categoryId = menu.categoryId || Helper.param.matchSearch(menu.url, "categoryId") || Helper.param.matchSearch(menu.url, "category") || "";
			return root + "events&categoryId=" + categoryId + "&title=" + menu.name;
		}
		if (menu.code == "articles") {
			var categoryId = menu.categoryId || Helper.param.matchSearch(menu.url, "categoryId") || Helper.param.matchSearch(menu.url, "category") || "";
			return root + "articles&categoryId=" + categoryId + "&title=" + menu.name;
		}
		if (menu.code == "proposal" || menu.code == "proposals") {
			var categoryId = menu.categoryId || Helper.param.matchSearch(menu.url, "categoryId") || Helper.param.matchSearch(menu.url, "category") || "";
			return root + "proposals&categoryId=" + categoryId + "&title=" + menu.name;
		}
		if (menu.code == "orgs") {
			var categoryId = menu.categoryId || "";
			return root + "list/school&categoryId=" + categoryId + "&title=" + menu.name;
		}
		if (menu.code == "votes") {
			return root + "votes" + "&title=" + menu.name;
		}
		if (menu.code == "tickets") {
			return root + "tickets" + "&title=" + menu.name;
		}

		if (menu.code == "losts") {
			return root + "lost/list" + "&title=" + menu.name;
		}
		if (menu.code == "questionnaires") {
			return root + "questionnaires" + "&title=" + menu.name;
		}
		if (menu.code == "form" || menu.code == "forms") {
			return root + "questionnaires" + "&title=" + menu.name;
		}
		if (menu.code == "join") {
			return root + "zone" + "&title=" + menu.name;
		}
		if (menu.code == "notices") {
			return root + "user/notices" + "&title=" + menu.name;
		}
		if (menu.code == "feedback") {
			return root + "user/feedback" + "&title=" + menu.name;
		}
		if (menu.code == "history") {
			return root + "user/history" + "&title=" + menu.name;
		}
		if (menu.code == "userzone") {
			return root + "user/zone" + "&title=" + menu.name;
		}
		if (menu.code == "mxz-jiaowu") {
			return root + "mengxiaozhu/mxzmain" + "&title=" + menu.name;
		}
	}

	exports.menus = makeMenusUrl;
});