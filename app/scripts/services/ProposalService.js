define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取提案总数
	exports.count = function(orgId, state, categoryId) {
		return globalResponseHandler({
			url: 'proposal/count',
			data: {
				organizationId: orgId,
				categoryId: categoryId,
				state: state
			}
		}, {
			description: '获取提案总数'
		});
	};

	// 获取提案列表
	exports.getList = function(data) {
		return globalResponseHandler({
			url: 'proposal/list',
			data: data
		}, {
			description: '获取提案列表'
		});
	};

	// 用户提案
	exports.user = {
		count: function() {
			return globalResponseHandler({
				url: 'proposal/count-own'
			}, {
				description: '获取用户提案总数'
			});
		},
		getList: function(skip, limit) {
			return globalResponseHandler({
				url: 'proposal/list-own',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取用户提案列表'
			});
		}
	};

	// 添加提案
	exports.add = function(orgId, data) {
		data.organizationId = orgId;
		return globalResponseHandler({
			url: 'proposal/add',
			type: 'post',
			data: data
		}, {
			description: '添加提案'
		});
	};

	// 更新提案
	exports.update = function(proposalId, data) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新提案'
		});
	};

	// 获取提案详情
	exports.get = function(proposalId, session) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/get'
		}, {
			description: '获取提案详情'
		});
	};

	exports.getCategoryList = function(organizationId) {
		return globalResponseHandler({
			url: 'proposal/category/list',
			data: {
				organizationId: organizationId
			}
		});
	};

	// 提案点赞
	exports.praise = {
		add: function(proposalId) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/praise/add',
				type: 'post'
			}, {
				description: '提案点赞'
			});
		},
		remove: function(proposalId) {
			return globalResponseHandler({
				url: 'proposal/' + proposalId + '/praise/remove',
				type: 'post'
			}, {
				description: '提案取消赞'
			});
		},
	};

	// 提案举报
	exports.report = function(proposalId, text) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/report/add',
			type: 'post',
			data: {
				text: text
			}
		}, {
			description: '提案举报'
		});
	};

	// 提案有用
	exports.useful = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/useful/add',
			type: 'post'
		}, {
			description: '提案有用'
		});
	};

	// 提案无用
	exports.useless = function(proposalId) {
		return globalResponseHandler({
			url: 'proposal/' + proposalId + '/useless/add',
			type: 'post'
		}, {
			description: '提案无用'
		});
	};

});