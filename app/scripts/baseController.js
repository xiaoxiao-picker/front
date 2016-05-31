define(function(require, exports, module) {
	var browser = require("browser");
	var Helper = require('helper');
	var LocalHistory = require("scripts/public/history");

	var extend = function(subClass, superClass) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype; //加多了个属性指向父类本身以便调用父类函数
		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	};
	/**
	 * @construct
	 */
	var Controller = function() {
		/**
		 * 可选的参数
		 * @param function(arg1,arg2) 顺序按照依赖数组Controller.$inject中定义的顺序
		 *
		 * 必须存在的属性:
		 * 实例变量 namespace {String} 命名空间
		 *
		 * 可选的属性:
		 * 类变量 $inject {Array} 依赖数组
		 *
		 * 可选的属性:
		 * 实例变量 actions {Object} 将data-xx-action的值act委托绑定click事件到actions.act定义的函数
		 */

		var shareData = {
			title: "",
			imgUrl: "",
			desc: "",
			link: window.location.href
		};

		Controller.prototype.share = function(data) {
			if (data == undefined) {
				return shareData;
			} else if ($.isPlainObject(data)) {
				shareData = $.extend(shareData, data);
			} else if (typeof data == "string") { // 兼容老的调用方法
				shareData.title = arguments[0];
				shareData.imgUrl = arguments[1];
				shareData.desc = arguments[2];
				shareData.link = arguments[3];
			}


			$("#wechat_share_img").attr("src", shareData.imgUrl);


			if (!Helper.browser.wx || !window.wx) return;

			wx.onMenuShareAppMessage(shareData);
			wx.onMenuShareTimeline(shareData);
			wx.onMenuShareQQ(shareData);
			wx.onMenuShareWeibo(shareData);
		};
	};

	Controller.prototype.history = LocalHistory;
	// 记录当前页面地址
	Controller.prototype.recordURL = function() {
		var URL = window.location.href;
		var urls = this.history.urls();

		if (urls.length > 0 && urls[urls.length - 1] == URL) {
			return this;
		}
		this.history.push(URL);

		return this;
	};
	Controller.prototype.initialize = function() {
		var controller = this;
		this.state = "initialized";
		var namespace = controller.namespace || "none-namespace";
		var actions = controller.actions || {};

		// 退回事件 
		actions.goBack = actions.goBack || function() {
			controller.history.back(controller.backURL);
		};
		Helper.globalEventListener("click." + namespace, "data-xx-action", actions);
		Helper.globalEventListener("change." + namespace, "data-xx-change-action", actions, true);
		Helper.globalEventListener("keyup." + namespace, "data-xx-keyup-action", actions, true);
		Helper.globalEventListener("focus." + namespace, "data-xx-focus-action", actions, true);

		// 只有常用事件需要用此方法绑定在document上，个别事件可在controller中单独绑定
		// Helper.globalEventListener("scroll." + namespace, "data-xx-scroll-action", actions);

		return this;
	};

	Controller.prototype.scrollToTop = function(method, options) {
		var controller = this;
		options = $.extend({
			top: 210,
			namespace: controller.namespace
		}, options);

		var $header = $('#header >.wrapper');
		var $btnBack = $('#header .btn-back');

		$header.css({
			backgroundColor: 'transparent',
			textAlign: 'center'
		});

		var throttleMethod = function() {
			var isTop = $(document).scrollTop() >= options.top;
			$btnBack.css("backgroundColor", isTop ? "#2196f3" : "transparent");
		};

		$(document).on(browser.isMobile ? "touchmove" : "scroll" + "." + options.namespace, function() {
			throttle(throttleMethod, window);
		});
	};
	Controller.prototype.scrollToBottom = function(method, options) {
		var controller = this;
		options = $.extend({
			bottom: 0,
			namespace: controller.namespace
		}, options);

		var throttleMethod = function() {
			if ($(document).scrollTop() >= $(document).height() - $(window).height() - options.bottom) {
				method();
			}
		};

		$(document).on(browser.isMobile ? "touchmove" : "scroll" + "." + options.namespace, function() {
			throttle(throttleMethod, window);
		});
	};


	/**
	 * 将子类控制器从积累中继承
	 * @param  {Object} obj [子类控制器]
	 * @return {Object} [得到继承后的子类控制器]
	 */
	Controller.prototype.extend = function(obj) {
		extend(obj, Controller);
	};
	module.exports = Controller;

	// 函数节流
	function throttle(method, context) {
		clearTimeout(method.throttleId);
		method.throttleId = setTimeout(function() {
			method.call(context);
		}, 50);
	}

	try {
		if (window.console && window.console.log) {
			console.log("长期招聘:Web前端开发工程师\n1.熟练掌握Web前端开发基础技术，包括HTML/CSS/JavaScript等\n2.熟悉jQuery或其他前端开发类库的API，有Ember,Angular等前端MVC/MVVM框架使用经验者优先\n3.了解Http协议，有php/Java/Ruby等后台应用开发经验者优先\n4.持续关注前端方面的最新技术和相关主题，有Grunt，Gulp等前端开发工具使用经验者优先\n5.重视团队合作，熟悉一种团队协作开发工具（git/svn等），关注Github等开源社区者优先\n6.有跨浏览器，跨平台客户端开发经验者优先\n7.有责任心，有上进心");
			console.log("请将简历发送至 %c hr@xiaoxiao.la（ 邮件标题请以“姓名-应聘前端Web-来自console”命名）", "color:red");
		}
	} catch (e) {}
});