define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	exports.get = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/get'
		}, {
			description: "获取活动信息"
		});
	};

	exports.count = function(orgId, state, categoryId, keyword) {
		return globalResponseHandler({
			url: "event/count",
			data: {
				organizationId: orgId,
				state: state,
				categoryId: categoryId,
				keyword: keyword
			}
		}, {
			description: "获取活动数量"
		});
	};

	exports.getList = function(orgId, state, skip, limit, categoryId, keyword) {
		return globalResponseHandler({
			url: 'event/list',
			data: {
				organizationId: orgId,
				state: state,
				skip: skip,
				limit: limit,
				categoryId: categoryId,
				keyword: keyword
			}
		}, {
			description: "获取活动列表"
		});
	};

	exports.getCategoryList = function(orgId) {
		return globalResponseHandler({
			url: 'event/category/list',
			data: {
				organizationId: orgId
			}
		}, {
			description: "获取组织活动分类"
		});
	};

	exports.getSignupTimes = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/time/list'
		}, {
			description: "获取活动报名时间段"
		});
	};

	// 报名
	exports.signup = function(timeId, signUpInfo) {
		return globalResponseHandler({
			url: 'event/sign-up-time/' + timeId + '/sign-up',
			type: 'post',
			data: {
				signUpInfo: signUpInfo
			}
		}, {
			description: "活动报名"
		});
	};
	// 取消报名
	exports.cancelSignup = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/unsign-up',
			type: 'post'
		}, {
			description: "取消报名"
		});
	};


	exports.praise = {
		add: function(eventId) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/praise/add',
				type: 'post'
			}, {
				description: "点赞"
			});
		},
		remove: function(eventId) {
			return globalResponseHandler({
				url: 'event/' + eventId + '/praise/remove',
				type: 'post'
			}, {
				description: "取消赞"
			});
		}
	};

	// 获取电子票列表
	exports.getTickets = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/ticket/list'
		}, {
			description: "获取活动电子票列表"
		});
	};

	// 获取活动的投票列表
	exports.getVotes = function(eventId) {
		return globalResponseHandler({
			url: 'event/' + eventId + '/vote/list'
		}, {
			description: "获取活动投票列表"
		});
	};
});