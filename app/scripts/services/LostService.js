define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取[失物招领/寻物启事]总数
	exports.count = function(orgId, type, keyword) {
		return globalResponseHandler({
			url: 'lost/count',
			data: {
				organizationId: orgId,
				type: type,
				keyword: keyword || ''
			}
		}, {
			description: '获取[失物招领/寻物启事]总数'
		});
	};

	// 获取[失物招领/寻物启事]列表
	exports.getList = function(orgId, skip, limit, type, keyword) {
		return globalResponseHandler({
			url: 'lost/list',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit,
				type: type,
				keyword: keyword || ''
			}
		}, {
			description: '获取[失物招领/寻物启事]列表'
		});
	};

	// 用户的[失物招领/寻物启事]
	exports.user = {
		count: function(type, keyword) {
			return globalResponseHandler({
				url: 'lost/count-own',
				data: {
					type: type,
					keyword: keyword || ''
				}
			}, {
				description: '获取用户的[失物招领/寻物启事]总数'
			});
		},
		getList: function(skip, limit, type, keyword) {
			return globalResponseHandler({
				url: 'lost/list-own',
				data: {
					skip: skip,
					limit: limit,
					type: type,
					keyword: keyword || ''
				}
			}, {
				description: '获取用户的[失物招领/寻物启事]列表'
			});
		}
	};

	// 获取[失物招领/寻物启事]详情
	exports.get = function(lostId) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/get'
		}, {
			description: '获取[失物招领/寻物启事]详情'
		});
	};

	// 添加[失物招领/寻物启事]
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'lost/add',
			type: 'post',
			data: data
		}, {
			description: '添加[失物招领/寻物启事]'
		});
	};

	// 更新[失物招领/寻物启事]
	exports.update = function(lostId, data) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新[失物招领/寻物启事]'
		});
	};

	// 删除[失物招领/寻物启事]
	exports.remove = function(lostId) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/remove',
			type: 'post'
		}, {
			description: '删除[失物招领/寻物启事]'
		});
	};

	// 确认[失物招领/寻物启事][找到/归还]操作
	exports.changeStatus = function(lostId, status) {
		return globalResponseHandler({
			url: 'lost/' + lostId + '/change-status',
			type: 'post',
			data: {
				status: status
			}
		}, {
			description: '确认[失物招领/寻物启事][找到/归还]操作'
		});
	};

});