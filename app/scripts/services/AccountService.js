define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 创建 session
	exports.createSession = function() {
		return globalResponseHandler({
			url: 'session/create'
		}, {
			description: "创建会话"
		});
	};

	exports.loginByCode = function(code) {
		return globalResponseHandler({
			url: "account/login-by-code",
			type: "post",
			data: {
				code: code
			}
		}, {
			description: "微信登陆"
		});
	};
	exports.loginByPhoneNumberAuthCode = function(phoneNumber, authCode) {
		return globalResponseHandler({
			url: "account/login-by-phone-number",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				token: authCode
			}
		}, {
			description: "登陆"
		});
	};

	exports.getLoginAuthCode = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-login-token",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取动态密码"
		});
	};
	exports.getVoiceLoginAuthCode = function(phoneNumber, captcha) {
		return globalResponseHandler({
			url: "account/request-login-token-voice",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				captcha: captcha
			}
		}, {
			description: "获取语音动态密码"
		});
	};

	exports.getBindEmailAuthCode = function(email, captcha) {
		return globalResponseHandler({
			url: "account/request-bind-email",
			type: "post",
			data: {
				email: email,
				captcha: captcha
			}
		}, {
			description: "发送邮箱绑定验证码"
		});
	};

	exports.bindPhoneNumber = function(phoneNumber, token) {
		return globalResponseHandler({
			url: "account/bind-phone-number",
			type: "post",
			data: {
				phoneNumber: phoneNumber,
				token: token
			}
		}, {
			description: "绑定手机号"
		});
	};
	exports.bindEmail = function(email, token) {
		return globalResponseHandler({
			url: "account/bind-email",
			type: "post",
			data: {
				email: email,
				token: token
			}
		}, {
			description: "绑定邮箱"
		});
	};

	exports.interiorLogin = function(phoneNumber) {
		return globalResponseHandler({
			url: "session/login",
			data: {
 				phoneNumber: phoneNumber
  			}
		}, {
			description: "内部登陆"
		});
	};


	exports.login = function(phoneNumber, password) {
		return globalResponseHandler({
			url: 'account/mobile-login-with-password',
			type: 'post',
			data: {
				phoneNumber: phoneNumber,
				password: password
			}
		}, {
			description: "用户登录"
		});
	};

	// 销毁 session
	exports.logout = function(session) {
		return globalResponseHandler({
			url: 'session/logout',
			type: 'post',
			data: {
				session: session
			}
		}, {
			description: "销毁会话"
		});
	};
});