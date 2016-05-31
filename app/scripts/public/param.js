define(function(require, exports, module) {
	var router = require("scripts/public/router");

	function matchSearch(url, key) {
		if (!key) return "";
		var tmpReg = new RegExp("[\\?\\&]" + key + "=([\\w\\d\\%\\.\\-\u4e00-\u9fa5]*)[|&]*");
		var result = url.replace(new RegExp(/(\/)+/g),"/").match(tmpReg);
		return result ? result[1] : "";
	}

	exports.hash = function(key) {
		var hash = window.location.hash.replace(new RegExp(/(\/)+/g),"/");
		var oRouter = router(hash);
		hash = hash ? hash.match(/#(.*)/)[1] : "";
		return oRouter ? oRouter[key] : "";
	};

	exports.search = function(key) {
		var search = window.location.href.replace(new RegExp(/(\/)+/g),"/");
		return matchSearch(search, key);
	};
	exports.matchSearch = matchSearch;
	exports.match = matchSearch;
});