define(function(require, exports, module) {
	var Alert = function(type, message, options) {
		this.type = type;
		this.message = message;
		this.options = $.extend({
			title: "校校提示",
			effects: 'scale',
			offset: {
				y: -30
			},
			position: null // 默认居中
		}, options);

		init(this);
	};

	function init($alert) {
		$alert.box = $('<div class="ly-message-box-container"></div>');
		var footerHtml;

		if ($alert.type == "alert") {
			footerHtml = '<button class="ly-btn ly-btn-success ly-btn-yes width-p-100"><span class="inside-loading"><span class="iconfont icon-loading rolling"></span></span><span class="inside-text"><span class="iconfont icon-done"></span></span></button>';
		} else if ($alert.type == "confirm") {
			footerHtml = '<button class="ly-btn ly-btn-success ly-btn-yes width-p-50"><span class="inside-loading"><span class="iconfont icon-loading rolling"></span></span><span class="inside-text"><span class="iconfont icon-done"></span></span></button><button class="ly-btn ly-btn-success ly-btn-no width-p-50"><span class="inside-loading"><span class="iconfont icon-loading rolling">sync</span></span><span class="inside-text"><span class="iconfont icon-close"></span></span></button>';
		} else if ($alert.type == "successAlert") {
			footerHtml = '<button class="ly-btn ly-btn-success ly-btn-yes width-p-100"><span class="inside-loading"><span class="iconfont icon-loading rolling"></span></span><span class="inside-text"><span class="iconfont icon-done"></span></span></button>';
		} else if ($alert.type == "errorAlert") {
			footerHtml = '<button class="ly-btn ly-btn-error ly-btn-yes width-p-100"><span class="inside-loading"><span class="iconfont icon-loading rolling"></span></span><span class="inside-text"><span class="iconfont icon-done"></span></span></button>';
		}

		var html = ['<div class="ly-message-box ' + $alert.options.effects + '">',
			'<div class="ly-message-box-header">',
			$alert.options.title,
			'</div>',
			'<div class="ly-message-box-body">',
			'<div class="ly-message-content">' + $alert.message + '</div>',
			'</div>',
			'<div class="ly-message-box-footer">',
			footerHtml,
			'</div>',
			'</div>'
		].join('');

		$alert.box.html(html);

		$alert.box.on("click", ".ly-btn-yes", function() {
			$alert.destroy($alert.options.success);
		});
		$alert.box.on("click", ".ly-btn-no", function() {
			$alert.destroy($alert.options.error);
		});

		$alert.box.appendTo(document.body);
		$alert.locate();
	}

	Alert.prototype.destroy = function(callback) {
		var $alert = this;
		$alert.box.find(".ly-message-box").animate({
			marginTop: -200
		}, 200, function() {
			callback && $.isFunction(callback) && callback();
			$alert.box.remove();
		});
	};
	Alert.prototype.locate = function() {
		var _this = this;
		var winHeight = $(window).height();
		var $content = this.box.find(".ly-message-box");
		var height = $content.height();

		$content.css("marginTop", height < winHeight ? ((winHeight - height) / 2 + _this.options.offset.y) : 10);
	};


	exports.successAlert = function(message, options, callback) {
		options.success = callback;
		return new Alert("successAlert", message, options);
	};
	exports.errorAlert = function(message, options, callback) {
		options.success = callback;
		return new Alert("errorAlert", message, options);
	};

	exports.alert = function(message, options, callback) {
		options.success = callback;
		return new Alert("alert", message, options);

	};
	exports.confirm = function(message, options, success, error) {
		options.success = success;
		options.error = error;
		return new Alert("confirm", message, options);
	};
});