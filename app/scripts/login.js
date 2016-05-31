define(function(require, exports, module) {
	require("base");
	var Application = require("factory.application");
	var User = require("factory.user");

	var AccountService = require("AccountService");
	var PublicService = require("PublicService");
	var UserService = require("UserService");

	var Helper = require("helper");

	var browser = require('browser');

	var template = require("template");

	Application.clearSession();

	// service中需要用到Application.getSession()
	window.Application = Application;

	var code = Helper.param.search("code");
	var redirectUrl = decodeURIComponent(Helper.param.search("redirect")) || "/index.html";

	// 创建会话
	(function createSession() {
		AccountService.createSession().done(function(data) {
			var session = data.result;
			Application.setSession(session);

			/**
			 * 如果不是在微信浏览器中打开此页面
			 * 则渲染手机登陆模板，用户需要使用手机号码和验证码进行登陆操作
			 */
			// || window.location.host == "front.xiaoxiao.la"
			
			if (!browser.wx || window.location.host.indexOf("192.168") > -1 || window.location.host.indexOf("10.0") > -1) {
				normalLogin();
				return;
			}

			if (!code) {
				// Application.getComponentAppId()
				$.when(Application.getPublicAppId()).done(function() {
					var redirect_uri = encodeURIComponent(window.location.origin + window.location.pathname + window.location.search);
					var authUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + Application.publicAppId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_base&state=123#wechat_redirect";
					window.location.href = authUrl;
				}).fail(function(error) {
					Helper.alert(error, normalLogin);
				});
				return;
			}


			AccountService.loginByCode(code).done(function(data) {
				// login success 
				Application.user.id = data.result;
				window.location.href = redirectUrl;
			}).fail(function(error) {
				// 如果微信登陆失败，则启用正常登陆模式
				$.when(Application.getPublicAppId()).done(function() {
					var redirect_uri = encodeURIComponent(window.location.origin + window.location.pathname + "?redirect=" + encodeURIComponent(redirectUrl));
					// var redirect_uri = encodeURIComponent("http://www.signvelop.com");
					var authUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + Application.publicAppId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_base&state=123#wechat_redirect";
					window.location.href = authUrl;
				}).fail(function(error) {
					Helper.alert(error, normalLogin);
				});
				return;
			});
		}).fail(function(error) {
			Helper.alert(error);
		});

		function normalLogin() {
			$('#container').html(template('app/templates/account/phone-login', {}));
			$("#frontLoading").hide();
			renderCaptcha();
			addListeners();
		}
	})();

	function renderCaptcha() {
		var session = Application.getSession();
		$('#CaptchaImage').attr('src', '/api-front/session/captcha/get?session=' + session + '&date=' + new Date().getTime());
	}

	function addListeners() {
		var actions = {
			refresh: function() {
				renderCaptcha();
			},
			getAuthCode: function() {
				var btn = this;
				var container = this.parents("#content");
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

				Helper.begin(btn);

				var action, message;
				if (captchaType == "message") {
					action = "getLoginAuthCode";
					message = "动态密码已发送至手机！";
				} else {
					action = "getVoiceLoginAuthCode";
					message = "动态密码请求成功，稍后您将会收到一个语音电话，请耐心等待！";
				}
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
			},
			login: function() {
				var btn = this;
				var container = this.parents("#content");
				var userName = $.trim(container.find(".username").val());
				var authCode = $.trim(container.find(".authcode").val());

				// 本地测试时开启免登陆模式
 				if (window.location.host == "localhost" || window.location.host.indexOf("192.168") > -1) {
					userName = userName || "18217710741";

					Helper.begin(btn);
					AccountService.interiorLogin(userName).done(function(data) {
						// Helper.alert(data.status);
						window.location.href = redirectUrl;
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				} else {
					if (!Helper.validation.isPhoneNumber(userName)) {
						Helper.errorToast('手机号码格式错误！');
						return;
					}
					if (!Helper.validation.isAuthCode(authCode)) {
						Helper.errorToast('动态密码为4位或6位数字！');
						return;
					}
					Helper.begin(btn);
					AccountService.loginByPhoneNumberAuthCode(userName, authCode).done(function(data) {
						window.location.href = redirectUrl;
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				}


			}
		};
		Helper.globalEventListener("click.login", "data-xx-action", actions);
	}

});