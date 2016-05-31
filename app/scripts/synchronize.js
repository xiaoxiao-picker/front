define(function(require, exports, module) {
	window.Application = require("factory.application");
	var User = require("factory.user");

	var AccountService = require("AccountService");
	var PublicService = require("PublicService");
	var UserService = require("UserService");

	var Helper = require("helper");

	var browser = require('browser');

	var template = require("template");

	var code = Helper.param.search("code");
	var redirectUrl = decodeURIComponent(Helper.param.search("redirect")) || "/index.html";

	if (!code) {
		window.location.href = redirectUrl;
		return;
	}

	Application.init(function() {
		UserService.synchronize(Application.user.id, code).done(function() {
			Helper.alert("同步数据成功！！！", function() {
				window.location.href = redirectUrl;
			});
		}).fail(function(error) {
			Helper.alert(error, function() {
				window.location.href = redirectUrl;
			});
		});
	});
});