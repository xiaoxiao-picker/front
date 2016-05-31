define(function(require, exports, module) {
	var template = require("template");
	exports.show = function(QRCode, title, tips) {
		$(document.body).append(template("app/templates/public/qrcode", {
			title: title,
			tips: tips,
			url: QRCode
		}));
	};
});