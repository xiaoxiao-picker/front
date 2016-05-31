define(function(require, exports, module) {
	// 执行函数
	exports.execute = function(fnc, data) {
		fnc && $.isFunction(fnc) && fnc(data);
	};


	/**
	 * 浏览器判断
	 */
	exports.browser = require("browser");

	exports.validation = require("validation");

	exports.statistics = require("public.statistics");

	exports.advertMaker = require("advertMaker");

	exports.objectFilter = require("scripts/public/objectFilter");

	// 函数节流
	exports.throttle = function(method, context) {
		clearTimeout(method.throttleId);
		method.throttleId = setTimeout(function() {
			method.call(context);
		}, 50);
	};

	/**
	 * 时间处理
	 */
	var date = require("date");
	exports.makedate = function(d, format) {
		format = format ? format : "yyyy-MM-dd";
		return d ? date.format(d, format) : d;
	};
	// 开始时间与结束时间相隔
	exports.distance = date.distance;
	// 距离当前时间
	exports.dateDiff = date.dateDiff;


	/**
	 * 设置页面标题
	 */
	exports.setTitle = function(title) {
		document.title = title;
	};
	// 调转页面
	exports.jump = function(url) {
		window.location.hash = url;
	};

	exports.param = require("scripts/public/param");

	exports.loader = require("loader");



	exports.begin = function(btn) {
		btn.addClass("loading").removeClass("else").attr("disabled", "disabled");
	};
	exports.end = function(btn) {
		btn.removeClass("loading").removeClass("else").removeAttr("disabled");
	};
	exports.process = function(btn) {
		btn.addClass("else").removeClass("loading").attr("disabled", "disabled");
	};



	/**
	 * 弹出框插件
	 */
	var Alert = require('alert');
	exports.alert = function(message, options, callback) {
		if ($.isFunction(options)) {
			callback = options;
		}
		options = $.extend({}, options);
		Alert.alert(message, options, callback);
	};
	exports.successAlert = function(message, options, callback) {
		if ($.isFunction(options)) {
			callback = options;
		}
		options = $.extend({}, options);
		Alert.successAlert(message, options, callback);
	};
	exports.errorAlert = function(message, options, callback) {
		if ($.isFunction(options)) {
			callback = options;
		}
		options = $.extend({}, options);
		Alert.errorAlert(message, options, callback);
	};
	exports.confirm = function(message, options, successCallback, errorCallback) {
		if ($.isFunction(options)) {
			errorCallback = successCallback;
			successCallback = options;
		}
		options = $.extend({}, options);
		Alert.confirm(message, options, successCallback, errorCallback);
	};



	/**
	 * 提示组
	 */
	var Toast = require('toast');
	exports.warnToast = function(message, options) {
		options = $.extend({
			theme: 'warn'
		}, options)
		Toast.toast(message, options);
	};
	exports.successToast = function(message, options) {
		options = $.extend({
			theme: 'success'
		}, options)
		Toast.toast(message, options);
	};
	exports.errorToast = function(message, options) {
		options = $.extend({
			theme: 'danger'
		}, options)
		Toast.toast(message, options);
	};

	exports.modal = require("ly.modal");


	/**
	 * 事件监听
	 */
	var eventListener = require('eventListener');
	exports.eventListener = eventListener.eventListener;
	exports.globalEventListener = eventListener.globalEventListener;
	exports.disableKeyBoard = eventListener.disableKeyBoard;

	/**
	 * store.js
	 */
	var localStore = require("localStore");
	exports.localStore = localStore.localStore;

	// 本地存储页面标题
	// page参数请带上orgId，以区分组织
	exports.storePageTitle = localStore.storePageTitle;


	exports.getStoredOrgTitle = localStore.getStoredOrgTitle;
	exports.userConfig = localStore.userConfig;

	exports.fixed = require("scripts/public/fixed");
});