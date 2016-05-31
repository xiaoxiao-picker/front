define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取意见反馈总数
	exports.count = function(orgId) {
		return globalResponseHandler({
			url: 'feedback/count',
			data: {
				organizationId: orgId
			}
		}, {
			description: '获取意见反馈总数'
		});
	};

	// 获取意见反馈列表
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'feedback/list',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取意见反馈列表'
		});
	};

	// 添加意见反馈
	exports.add = function(orgId, text) {
		return globalResponseHandler({
			url: 'feedback/add-reply',
			type: 'post',
			data: {
				organizationId: orgId,
				text: text
			}
		}, {
			description: '添加意见反馈'
		});
	};

});