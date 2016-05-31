define(function(require, exports, module) {
	var template = require("scripts/template");

	template.helper("organizationId", function() {
		return Application.organization.id;
	});
	template.helper("session", function() {
		return Application.getSession();
	});
	template.helper("application", function(object) {
		if (object == "session") {
			return Application.getSession();
		} else if (object == "organizationId") {
			return Application.organization.id;
		} else {
			return "";
		}
	});

	// 时间格式转化
	template.helper('makedate', function(d, format) {
		format = format ? format : "yyyy-MM-dd";
		return d ? new Date(parseInt(d)).Format(format) : "";
	});

	// 图片过滤器
	template.helper("imageUrl", function(imageUrl, param, errorImage) {
		return imageUrl ? (imageUrl + param) : (errorImage || "");
	});

	template.helper("charLength", function(s) {
		var l = 0;
		var a = s.split("");
		for (var i = 0; i < a.length; i++) {
			if (a[i].charCodeAt(0) < 299) {
				l++;
			} else {
				l += 2;
			}
		}
		return l;
	});

	module.exports = template;
});