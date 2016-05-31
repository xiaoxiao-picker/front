/**
 * 系统 ajax 请求统一处理器
 */
define(function(require, exports, module) {
	var Helper = require("helper");

	/**
	 * 全局异步请求处理器
	 */
	var globalResponseHandler = function(data, options) {
		var callee = arguments.callee;
		options = $.extend({
			description: "", // 接口描述
			reconnection: 3, // 重新请求次数
			errorRequestHeader: "请求失败："
		}, options);

		var session = window.Application ? window.Application.getSession() : "";
		var ajaxData = $.extend(true, {
			dataType: "json",
			timeout: 10000,
			cache: false,
			type: "get",
			data: {
				session: session
			}
		}, data);
		ajaxData.url = '/api-front/' + data.url;

		var defer = $.ajax(ajaxData);
		return defer.then(function(data, status, xhr) {
			if (!data.status) data = $.parseJSON(data);
			// 如果状态非OK，手动触发reject方法使事件进入fail函数。
			if (data.status == "ERROR") {
				return reject(errorMessage(data));
			};
			// return Helper.objectFilter(data);
			return data;
		}, function(xhr, status) {
			// timeout，发起重新请求
			if (options.reconnection) {
				if (xhr.status == 404 || ajaxData.type == "get") { // 如果是404/500，500ms后发起第二次请求
					options.reconnection--;
					return reconnection(callee, data, options);
				}
			}
			return httpErrorMessage(xhr, options);
		});



		function reject(response) {
			var defer = $.Deferred();
			defer.reject(response);
			return defer.promise();
		}

		function reconnection(fnc, data, options) {
			var dtd = $.Deferred();

			var wait = function(dtd) {

				var task = function() {
					fnc(data, options).done(function(data) {
						dtd.resolve(data);
					}).fail(function(error) {
						dtd.reject(error);
					});
				};

				setTimeout(task, 500);
				return dtd.promise();
			};

			return $.when(wait(dtd));
		}


		// 系统返回错误统一处理
		function errorMessage(data) {
			if (data.errorCode >= 0) return data.message;
			if (data.errorCode == -401) return "权限不足";
			if (data.errorCode == -400) {
				store.remove("userSession");
				window.Application ? window.Application.auth() : window.location.reload();
				// return "页面失效，请刷新页面！";
			}
			return data.errorMessage;
		}
		// http请求返回错误统一处理
		function httpErrorMessage(xhr, options) {
			var description = options.description ? options.description + "失败：" : "";
			var reason = {
				"404": "当前网络繁忙，请稍后再试！",
				"408": "当前访问量太多，请稍后再试！",
				"500": "校校遇到一个问题，请联系管理员！"
			}[xhr.status] || "哎哟，好像网络有点问题呢！"
			return description + reason + "<p style='text-align:center;color:#cbcbcb;margin-top:10px;'>code：" + xhr.status + "</p>";
		}
	};

	module.exports = globalResponseHandler;
});