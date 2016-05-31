define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	exports.get = function(id) {
		return globalResponseHandler({
			url: "template/" + id + "/get"
		}, {
			description: "获取微首页信息"
		});
	};
	exports.getActive = function(orgId) {
		return globalResponseHandler({
			url: "template/get-active-template",
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取主微首页"
		});
	};

});