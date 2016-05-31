// 询问登陆
define(function(require, exports, module) {
	var template = require("template");

	function LoginBox(options) {
		var loginbox = this;
		options = $.extend(true, {
			// callback: function() {}
		}, options);
		var session = encodeURIComponent(AppUser.getSession());
		this.box = $("<div id='LoginBox'><iframe src='./login.html?session=" + session + "' height='100%' width='100%' border='none'></iframe></div>");
		this.box.appendTo(document.body);
		window.LoginCallback = function(user) {
			AppUser.userInfo = user;
			loginbox.destroy();
			options.callback && $.isFunction(options.callback) && options.callback();
		};
	};

	LoginBox.prototype.destroy = function() {
		delete window.LoginCallback;
		this.box.remove();
	};

	module.exports = function(options) {
		return new LoginBox(options);
	};
});