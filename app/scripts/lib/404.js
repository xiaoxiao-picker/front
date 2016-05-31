define(function(require, exports, module) {
	var template = require('template');
	var Helper = require('helper');

	var notFound = function(message) {
		var url = window.location.href;

		var winWidth = $(window).width();
		var width = winWidth * 0.8;
		var height = width * 363 / 500;

		$("#header").html("");
		$("#content").html(template("app/templates/lib/404", {
			width: width,
			height: height
		}));

		message && window.console && window.console.error && window.console.error(message);
	};

	module.exports = notFound;
});