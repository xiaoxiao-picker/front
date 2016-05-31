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

	Page.prototype.render = function(callback) {
		var _this = this;
		var menus = $.extend([], _this.json.menus);
		$("#content").html(template("app/templates/homepages/huali", {
			json: _this.json,
			groups: makeGroups(menus),
			organization: Application.organization.info
		}));
		addListener(_this);
		Helper.execute(callback);
	};


	// 渲染前处理数据
	function makeGroups(menus) {
		var groups = [];
		var number = 6; // 该微首页6个菜单为一组
		$(menus).each(function(idx, item) {
			var index = Math.floor(idx / number);
			if (!groups[index]) {
				groups[index] = [];
			}
			groups[index].push(item);

		});
		return groups;
	};

	function addListener(page) {
		var win = $(window);
		var ww = win.width();
		var wh = win.height();

		var box = $("#HuaLiBox .menu-box");
		var len = box.find(".menus").length;
		var footerIndexs = $(".footer-index").find("span");
		var menuH = box.find(".menu").height();

		var boxH = (menuH + 30) * 2;
		$(".header-wrapper").height(wh - boxH - 60);
		box.width(len * ww).find(".menus").height(boxH).outerWidth(ww);

		if (page.json.menus.length <= 6) {
			return;
		}

		var index = 0;

		var moving; //惯性

		var x1, x2;

		box.on("touchstart", function(e) {
			//e.originalEvent.returnValue = false;
			moving = false;
			x1 = e.originalEvent.changedTouches[0].clientX;
		});

		box.on("touchend", function(e) {
			//e.originalEvent.returnValue = false;
			moving = true;
			x2 = e.originalEvent.changedTouches[0].clientX;


			if (x2 - x1 > 6) {
				// 向右滑动
				if (index > 0) {
					index--;
					translateX(-ww * index);
				}
			} else if (x2 - x1 < -6) {
				// 向左滑动
				if (index < len - 1) {
					index++;
					translateX(-ww * index);
				}
			}
		});

		box.on("touchmove", function(e) {
			e.originalEvent.returnValue = false;
		});

		function translateX(number) {
			box.css({
				"transform": "translateX(" + number + "px)",
				"-webkit-transform": "translateX(" + number + "px)"
			});
			$(footerIndexs.removeClass("active").get(index)).addClass("active");
		};
	};

	module.exports = function(options) {
		return new Page(options);
	};
});