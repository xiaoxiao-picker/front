define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var AccountService = require("AccountService");

	var actions = {
		".btn-auth": {
			fnc: function(modal) {
				var btn = this;
				var container = this.parents(".bind-box");
				var userName = $.trim(container.find(".username").val());

				if (!Helper.validation.isEmail(userName)) {
					Helper.errorToast('邮箱格式错误！');
					return;
				}

				Helper.begin(btn);
				AccountService.getBindEmailAuthCode(userName).done(function(data) {
					Helper.successToast("验证码已发送邮箱，请注意查收！");
					var delay = 90;

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
				});
			}
		},
		".btn-confirm": {
			fnc: function(modal) {
				var btn = this;
				var container = this.parents(".bind-box");
				var userName = $.trim(container.find(".username").val());
				var authCode = $.trim(container.find(".authcode").val());

				if (!Helper.validation.isEmail(userName)) {
					Helper.errorToast('邮箱格式错误！');
					return;
				}
				if (!Helper.validation.isAuthCode(authCode)) {
					Helper.errorToast('验证码为6位数字格式！');
					return;
				}

				Helper.begin(btn);
				AccountService.bindEmail(userName, authCode).done(function(data) {
					Application.user.info.email = userName;
					Helper.execute(modal.options.success, modal);
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
			title: "邮箱绑定",
			value: "",
			theme: "black",
			actions: actions,
			success: function(modal) {
				modal.destroy();
			}
		}, options);

		var modal = Helper.modal(options);

		modal.html(template("app/templates/lib/email-bind-box", {
			title: options.title,
			value: options.value
		}));

		return modal;
	};


	module.exports = box;
});