define(function(require, exports, module) {
	var AccountService = require("AccountService");
	var UserService = require('UserService');
	var OrganizationService = require("OrganizationService");
	var PublicService = require("PublicService");

	var Helper = require("helper");

	var User = require("factory.user");
	var Organization = require("factory.organization");

	var Application = (function() {
		/**
		 * 私有变量
		 */
		var session = null;
		return function() {
			this.organization = {};
			this.user = {};
			this.setSession = function(iSession) {
				session = iSession;
				store.set("userSession", iSession);
			};
			/**
			 * fix 手动清除 '/' 下的userSession cookie
			 * @return {[type]} [description]
			 */
			this.clearSession = function() {
				session = session || store.get("userSession");
				session && AccountService.logout(session);
				session = null;
				store.remove("userSession");
			};
			this.getSession = function() {
				return session;
			};
			this.debug = Helper.param.search("debug") ? true : false;
		};
	})();

	// 初始化应用程序
	// 1、根据Session取得用户登录状态
	// 2、获取用户所管理的组织集合
	// 3、设置用户当前管理的组织
	// 4、获取当前组织的配置信息
	Application.prototype.init = function(callback) {
		var application = this;
		application.authSession(callback);
	};

	Application.prototype.authSession = function(callback) {
		var application = this;
		var session = store.get("userSession");
		if (!session) {
			application.auth();
			return;
		}
		this.setSession(session);
		return application.getSessionUser(function() {
			if (Helper.param.hash("oid") || Helper.param.search("organizationId") || Helper.param.search("oid")) {
				application.organizationRefresh(callback);
			} else {
				application.whoAmI("找不到组织ID");
				$("#frontLoading").hide();
				Helper.execute(callback);
			}
		});
	};

	Application.prototype.getSessionUser = function(callback) {
		var application = this;
		var session = application.getSession();
		return UserService.authSession(session).done(function(data) {
			if (data.result) {
				var userId = data.result.id;
				application.user = User(userId);
				application.user.info = data.result;
				application.user.info.grade = application.user.info.grade ? +application.user.info.grade : null;
				Helper.execute(callback);
			} else {
				application.auth();
			}
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 刷新当前组织信息
	Application.prototype.organizationRefresh = function(callback) {
		var application = this;
		application.organization.id = Helper.param.hash("oid") || Helper.param.search("organizationId") || Helper.param.search("oid");
		if (!application.organization.id) {
			application.whoAmI("找不到组织ID");
			$("#frontLoading").hide();
			return;
		}

		application.organization = Organization(application.organization.id);
		application.organization.reload().done(function() {
			Helper.execute(callback);
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	Application.prototype.getPublicAppId = function(refresh) {
		refresh = refresh ? true : false;
		var application = this;
		if (!application.publicAppId || refresh) {
			return PublicService.getPublicAppId().done(function(data) {
				application.publicAppId = data.result;
			});
		} else {
			return $.Deferred().resolve();
		}
	};
	Application.prototype.getComponentAppId = function(refresh) {
		refresh = refresh ? true : false;
		var application = this;
		if (!application.componentAppId || refresh) {
			return PublicService.getComponentAppId().done(function(data) {
				application.componentAppId = data.result;
			});
		} else {
			return $.Deferred().resolve();
		}
	};

	Application.prototype.getSignature = function(url, refresh) {
		refresh = refresh ? true : false;
		var application = this;
		application.signatures = application.signatures || {};
		if (!application.signatures[url] || refresh) {
			return PublicService.JSSDKSignature(url).done(function(data) {
				application.signatures[url] = data.result;
			});
		} else {
			return $.Deferred().resolve();
		}
	};

	Application.prototype.whoAmI = function() {
		require.async("scripts/lib/404", function(notFound) {
			notFound();
		});
	};



	// 跳转至微信登陆页面
	Application.prototype.auth = function(redirectUrl) {
		redirectUrl = redirectUrl || encodeURIComponent(window.location.href);
		window.location.href = "/login.html?redirect=" + redirectUrl;
	};
	// 登出系统，销毁session并清除浏览器记录
	Application.prototype.logout = function(callback) {
		AccountService.logout();
		this.clearSession();
		Helper.execute(callback);
	};

	Application.prototype.getToken = function(phoneNumber) {
		var application = this;
		window.open("http://www.signvelop.com/api-oa/system/get-login-token?session=" + application.getSession() + "&phoneNumber=" + phoneNumber);
	};

	var application = (function() {
		return new Application();
	})();

	module.exports = application;
});