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
	};


	Page.prototype.render = function(callback, options) {
		var _this = this;
		var menus = $.extend([], _this.json.menus);

		$("#content").html(template("app/templates/homepages/swiper-photo", {
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
		$(".menus .menu").height(width * 95 / 375);
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

	module.exports = function(options) {
		return new Page(options);
	};

});