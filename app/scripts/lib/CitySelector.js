define(function(require, exports, module) {
	var template = require("template");
	var config = require("config");

	var boxTemp = 'app/templates/public/city-selector/box';
	var cityTemp = 'app/templates/public/city-selector/cities';

	var Selector = function(url, city, options) {
		this.namespace = 'city-selector';
		this.container = $(document.body);
		this.isActive = false;
		this.options = $.extend({}, options);

		this.url = url;
		this.city = city;

		render(this);
	};

	function render(selector) {
		selector.isActive = true;

		var provinces = config.provinces;
		
		$.each(provinces, function(idx, province) {
			var cities = config.cities(province);
			var result = false;
			$.each(cities, function(idx, city) {
				if (city == selector.city) {
					selector.province = province;
					result = true;
					return false;
				};
			});
			if (result) return false;
		});

		selector.box = $(template(boxTemp, {
			provinces: provinces,
			selectProvince: selector.province
		}));
		selector.box.appendTo(selector.container);
		addListener(selector);

		setTimeout(function() {
			selector.box.addClass('active');
		});

		renderCities(selector, selector.province);
	};

	function renderCities(selector, province) {

		var cities = config.cities(province);
		
		selector.box.find('#Cities').html(template(cityTemp, {
			cities: cities,
			selectCity: selector.city,
			url: selector.url
		}));
	};

	function addListener(selector) {
		selector.box.on("click." + selector.namespace, ".province", function() {
			var _btn = $(this);
			var province = _btn.text();

			_btn.parents('.provinces').find('li').removeClass('active');
			_btn.parents('li').addClass('active');

			renderCities(selector, province);
		});

		selector.box.on("click." + selector.namespace, ".city", function() {
			var _btn = $(this);

			_btn.parents('.cities').find('li').removeClass('active');
			_btn.parents('li').addClass('active');

			selector.close();
		});

		selector.container.on("click." + selector.namespace, ".avatar", function() {
			selector.close();
		});
	};

	Selector.prototype.close = function() {
		var selector = this;
		selector.box.off("." + selector.namespace);
		selector.container.off("." + selector.namespace);
		selector.box.removeClass('active');
		setTimeout(function() {
			selector.isActive = false;
			selector.box.remove();
		}, 400);
	};

	module.exports = function(url, city, options) {
		return new Selector(url, city, options);
	};
});