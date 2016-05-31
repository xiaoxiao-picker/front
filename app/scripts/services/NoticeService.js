define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取用户收到的组织公告总数
	exports.count = function() {
		return globalResponseHandler({
			url: 'announcement/count'
		}, {
			description: '获取用户收到的组织公告总数'
		});
	};

	// 获取用户收到的组织公告
	exports.getList = function(skip, limit) {
		return globalResponseHandler({
			url: 'announcement/list',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取用户收到的组织公告'
		});
	};
});