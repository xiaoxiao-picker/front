define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取组织投票数
	exports.getCount = function(orgId, keyword) {
		return globalResponseHandler({
			url: 'vote/count-votes',
			data: {
				organizationId: orgId,
				keyword: keyword
			}
		}, {
			description: "获取组织投票数"
		});
	};

	// 获取组织投票列表
	exports.getList = function(orgId, skip, limit, keyword, type) {
		return globalResponseHandler({
			url: 'vote/list-by-organization',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit,
				keyword: keyword,
				type: type
			}
		}, {
			description: "获取投票列表"
		});
	};

	// 获取投票信息
	exports.get = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + '/get'
		}, {
			description: '获取投票信息'
		});
	};

	// 开启投票
	exports.open = function(voteId) {
		return globalResponseHandler({
			url: "vote/" + voteId + "/state/open",
			type: "post"
		}, {
			description: '开启投票'
		});
	};

	// 关闭投票
	exports.close = function(voteId) {
		return globalResponseHandler({
			url: "vote/" + voteId + "/state/close",
			type: "post"
		}, {
			description: '关闭投票'
		});
	};

	// 投票
	exports.cast = function(voteId, optionIds) {
		return globalResponseHandler({
			url: "vote/" + voteId + "/cast",
			type: "post",
			data: {
				optionIds: optionIds
			}
		}, {
			description: '投票'
		});
	};

	// 获取用户剩余票数
	exports.getCastedOptionIds = function(voteId) {
		return globalResponseHandler({
			url: 'vote/' + voteId + "/option/list-casted"
		}, {
			description: '获取用户已投选项列表'
		});
	};

	// 投票选项
	exports.option = {
		// 获取投票选项详情
		get: function(optionId, hideVotes) {
			return globalResponseHandler({
				url: "vote/option/" + optionId + "/get",
				data: {
					hideVotes: hideVotes
				}
			}, {
				description: '获取投票选项详情'
			});
		},
		// 获取投票选项列表
		getList: function(voteId, keyword, skip, limit) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/option/list",
				data: {
					skip: skip,
					limit: limit,
					keyword: keyword
				}
			}, {
				description: '获取投票选项列表'
			});
		},
		// 获取所有投票选项ID
		getIds: function(voteId, keyword) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/option/list-all",
				data: {
					keyword: keyword || ""
				}
			}, {
				description: '获取所有投票选项ID'
			});
		},
		// 根据投票选项ID获取列表
		getListByIds: function(optionIds, hideVotes) {
			return globalResponseHandler({
				url: "vote/option/list-by-ids",
				data: {
					optionIds: optionIds,
					hideVotes: hideVotes
				}
			}, {
				description: "获取投票选项列表"
			});
		},
		getRank: function(voteId, skip, limit) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/live-info",
				data: {
					skip: skip,
					limit: limit,
					sortType: -1
				}
			}, {
				description: "获取投票排名"
			});
		},
		// skip,limit,orderBy,keyword
		getListByUGC: function(voteId, data) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/ugc/live-info",
				data: data
			}, {
				description: "获取UGC投票选项列表"
			});
		},
	};

	exports.signup = {
		getList: function(voteId, skip, limit) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/list",
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: "获取报名列表信息"
			});
		},
		add: function(voteId, data) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/add",
				type: 'post',
				data: data
			}, {
				description: "添加报名信息"
			});
		},
		update: function(voteId, signUpId, data) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/" + signUpId + "/update",
				type: 'post',
				data: data
			}, {
				description: "更新报名信息"
			});
		},
		getState: function(voteId) {
			return globalResponseHandler({
				url: "vote/" + voteId + "/sign-up/state"
			}, {
				description: "获取报名状态"
			});
		}
	};

});