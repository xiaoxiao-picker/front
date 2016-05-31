define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取通知总数
	exports.count = function() {
		return globalResponseHandler({
			url: 'message/count'
		}, {
			description: '获取通知总数'
		});
	};

	// 获取通知列表
	exports.getList = function(skip, limit) {
		return globalResponseHandler({
			url: 'message/list',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取通知列表'
		});
	};

	// 获取通知详情
	exports.get = function(messageId) {
		return globalResponseHandler({
			url: 'message/' + messageId + '/get'
		}, {
			description: '获取通知详情'
		});
	};

	// 标记通知
	exports.mark = function(messageIds) {
		return globalResponseHandler({
			url: 'message/mark',
			type: 'post',
			data: {
				ids: messageIds
			}
		}, {
			description: '标记通知'
		});
	};

	// 取消标记通知
	exports.unMark = function(messageIds) {
		return globalResponseHandler({
			url: 'message/unmark',
			type: 'post',
			data: {
				ids: messageIds
			}
		}, {
			description: '取消标记通知'
		});
	};

	// 通知标记所有已读
	exports.read = function() {
		return globalResponseHandler({
			url: 'message/read',
			type: 'post'
		}, {
			description: '通知标记所有已读'
		});
	};

	// 删除通知
	exports.remove = function(messageIds) {
		return globalResponseHandler({
			url: 'message/remove',
			type: 'post',
			data: {
				ids: messageIds
			}
		}, {
			description: '删除通知'
		});
	};

	// 获取未读数
	exports.unReadCount = function() {
		return globalResponseHandler({
			url: 'message/count-unreaded'
		}, {
			description: '获取未读数'
		});
	};

});