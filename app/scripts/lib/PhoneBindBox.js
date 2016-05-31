define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var AccountService = require("AccountService");

	var actions = {
		".btn-captcha-refresh": {
			fnc: function(modal) {
				renderCaptcha();
			}
		},
		".btn-auth-code": {
			fnc: function(modal) {
				var btn = this;
				var container = this.parents(".bind-box");
				var userName = $.trim(container.find(".username").val());
				var captcha = $.trim(container.find(".captcha").val());
				var captchaType = btn.attr("data-captcha-type") || "message";

				if (!Helper.validation.isPhoneNumber(userName)) {
					Helper.errorToast('手机号码格式错误！');
					return;
				}
				if (Helper.validation.isEmpty(captcha)) {
					Helper.errorToast('图片字符串不得为空！');
					return;
				}

				var action, message;
				if (captchaType == "message") {
					action = "getLoginAuthCode";
					message = "动态密码已发送至手机！";
				} else {
					action = "getVoiceLoginAuthCode";
					message = "动态密码请求成功，稍后您将会收到一个语音电话，请耐心等待！";
				}

				Helper.begin(btn);
				AccountService[action](userName, captcha).done(function(data) {
					Helper.successToast(message);
					var delay = 30;

					function waiting() {
						Helper.process(btn);
						btn.find("#Waiting").text((delay--) + "秒后重试！");
						if (delay == 0) {
							Helper.end(btn);
							return;
						}
						setTimeout(waiting, 1000);
					}

					waiting();
				}).fail(function(error) {
					Helper.alert(error);
					Helper.end(btn);
					renderCaptcha();
				});
			}
		},
		".btn-confirm": {
			fnc: function(modal) {
				var btn = this;
				var container = this.parents(".bind-box");
				var userName = $.trim(container.find(".username").val());
				var authCode = $.trim(container.find(".authcode").val());

				if (!Helper.validation.isPhoneNumber(userName)) {
					Helper.errorToast('手机号码格式错误！');
					return;
				}
				if (!Helper.validation.isAuthCode(authCode)) {
					Helper.errorToast('验证码为4位或6位数字！！');
					return;
				}

				Helper.begin(btn);
				AccountService.bindPhoneNumber(userName, authCode).done(function(data) {
					Application.getSessionUser(function() {
						modal.destroy();
						Helper.execute(modal.options.success);
					});
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(btn);
				});
			}
		}
	};

	var box = function(options) {
		options = $.extend({
			title: "手机绑定",
			value: "",
			theme: "black",
			actions: actions,
			success: function(modal) {
				modal.destroy();
			}
		}, options);

		var modal = Helper.modal(options);

		modal.html(template("app/templates/lib/phone-bind-box", {
			title: options.title,
			value: options.value
		}));
		renderCaptcha();

		return modal;
	};

	function renderCaptcha() {
		var session = Application.getSession();
		$('#CaptchaImage').attr('src', '/api-front/session/captcha/get?session=' + session + '&date=' + new Date().getTime());
	}


	module.exports = box;
});