define(function(require, exports, module) {
	require("/plugins/swiper/dist/css/swiper.css");

	var Color = require("Color");
	var template = require("template");
	var Helper = require("helper");

	var pageMaker = require("scripts/controllers/homepage/pages/pageMaker");

	function Page(options) {
		this.name = options.name;
		this.json = options.json;
		this.orgId = options.orgId || Application.organization.id;
		this.json.menus = pageMaker.menus(this.orgId, this.json.menus);
		this.json.carousels = pageMaker.menus(this.orgId, this.json.carousels);
		this.json.carousels = pageMaker.menus(this.orgId, this.json.carousels);
	};


	Page.prototype.render = function(callback, options) {
		var _this = this;
		var menus = $.extend([], _this.json.menus);
		menus = menusMaker(menus);

		$("#content").html(template("app/templates/homepages/swiper-tile", {
			json: _this.json,
			menus: menus,
			carousels: _this.json.carousels,
			organization: Application.organization.info
		}));
		transform(_this.json.carousels.length);
		Helper.execute(callback);
	};



	function transform(carouselLength) {
		var width = $(window).width();
		$(".swiper-container img.poster").height(width * 200 / 375);
		$(".menus .wrapper").height(width * 95 / 375);
		$("#PAGECONTAINER").height($(window).height());
		if (carouselLength <= 1) return;
		require.async("plugins/swiper/dist/js/swiper", function() {
			var swiper = new window.Swiper(".swiper-container", {
				autoplay: 5000,
				loop: true,

				// 如果需要分页器
				pagination: '.swiper-pagination',

				// 如果需要前进后退按钮
				nextButton: '.swiper-button-next',
				prevButton: '.swiper-button-prev',
				watchSlidesProgress: true,
				watchSlidesVisibility: true
			});
		});
	};

	// 菜单样式计算
	function menusMaker(menus) {
		for (var i = 0; i < menus.length; i++) {
			var menu = menus[i];
			menu.css = makeBackColor(menu);
		};
		return menus;
	};

	function makeBackColor(menu) {
		if (!menu.backColor) {
			return "";
		}
		var color = Color.RGBA(menu.backColor);
		var R = color.R();
		var G = color.G();
		var B = color.B();
		var moz = 'background: -moz-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%, rgba(255,255,255,0) 90%);'; /* FF3.6+ */
		var webkit = 'background: -webkit-gradient(linear, left top, right top, color-stop(40%,rgba(' + R + ',' + G + ',' + B + ',1)), color-stop(90%,rgba(255,255,255,0)));'; /* Chrome,Safari4+ */
		var safari = 'background: -webkit-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* Chrome10+,Safari5.1+ */
		var opera = 'background: -o-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* Opera 11.10+ */
		var ms = 'background: -ms-linear-gradient(left, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* IE10+ */
		var w3c = 'background: linear-gradient(to right, rgba(' + R + ',' + G + ',' + B + ',1) 40%,rgba(255,255,255,0) 90%);'; /* W3C */
		var ie69 = "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr= '#00000000', GradientType = 1);"; /* IE6-9 */

		var backgroundColor = moz + webkit + safari + opera + ms + w3c + ie69;
		return backgroundColor;
	}

	module.exports = function(options) {
		return new Page(options);
	};
});