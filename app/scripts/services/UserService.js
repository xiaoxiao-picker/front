define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 验证当前session的状态，是否已登录
	exports.authSession = function(session) {
		return globalResponseHandler({
			url: 'session/get-user',
			data: {
				session: session
			}
		}, {
			description: "验证会话"
		});
	};

	// 获取用户信息
	exports.get = function(userId) {
		return globalResponseHandler({
			url: 'user/' + userId + '/get'
		}, {
			description: '获取用户信息'
		});
	};

	// 更新用户信息
	exports.update = function(userId, data) {
		return globalResponseHandler({
			url: 'user/' + userId + '/update',
			type: 'post',
			data: data
		}, {
			description: '更新用户信息'
		});
	};

	exports.config = {
		// showSynchronization:boolean //是否提示用户同步微信信息
		get: function(userId) {
			return globalResponseHandler({
				url: "user/" + userId + "/config/get"
			}, {
				description: "获取用户配置信息"
			});
		},
		update: function(userId, keyValues) {
			return globalResponseHandler({
				url: "user/" + userId + "/config/update",
				type: "post",
				data: keyValues
			}, {
				description: "更新用户配置信息"
			});
		}
	};

	// 修改邮箱时获取验证码
	exports.getAuthCodeForUpdateEmail = function(email, session) {
		return globalResponseHandler({
			url: 'user/request_bind_email',
			type: 'post',
			data: {
				email: email,
				session: session
			}
		}, {
			description: '修改邮箱时获取验证码'
		});
	};

	// 修改邮箱
	exports.updateEmail = function(email, token, session) {
		return globalResponseHandler({
			url: 'user/bind_email',
			type: 'post',
			data: {
				email: email,
				token: token,
				session: session
			}
		}, {
			description: '修改邮箱'
		});
	};

	// 同步微信用户信息
	exports.synchronize = function(userId, code) {
		return globalResponseHandler({
			url: 'user/' + userId + '/wechat/synchronize',
			type: 'post',
			data: {
				code: code
			}
		}, {
			description: '同步微信用户信息'
		});
	};

	// 获取成员在组织中的等级
	exports.getMemberRank = function(orgId) {
		return globalResponseHandler({
			url: 'member/get-rank',
			data: {
				organizationId: orgId
			}
		}, {
			description: '获取成员在组织中的等级'
		});
	};

	// 用户参与历史
	exports.history = {
		count: function(userId) {
			return globalResponseHandler({
				url: 'user/' + userId + '/track/count'
			}, {
				description: '获取用户参与历史总数'
			});
		},
		getList: function(userId, skip, limit) {
			return globalResponseHandler({
				url: 'user/' + userId + '/track/get',
				data: {
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取用户参与历史列表'
			});
		},
		// 用户报名活动历史
		event: {
			count: function(userId) {
				return globalResponseHandler({
					url: 'user/' + userId + '/track/event/count'
				}, {
					description: '获取用户报名活动总数'
				});
			},
			getList: function(userId, skip, limit) {
				return globalResponseHandler({
					url: 'user/' + userId + '/track/event/list',
					data: {
						skip: skip,
						limit: limit
					}
				}, {
					description: '获取用户报名活动列表'
				});
			}
		},
		comment: {
			getList: function(orgId, userId, skip, limit) {
				return globalResponseHandler({
					url: 'user/' + userId + '/comment/list',
					data: {
						organizationId: orgId,
						skip: skip,
						limit: limit
					}
				}, {
					description: '获取用户第二课堂评价列表'
				});
			}
		},
		lottery: {
			count: function(userId) {
				return globalResponseHandler({
					url: 'lottery/track/count',
					data: {
						userId: userId
					}
				}, {
					description: '获取用户抽奖总数'
				});
			},
			getList: function(userId, skip, limit) {
				return globalResponseHandler({
					url: 'lottery/track',
					data: {
						userId: userId,
						skip: skip,
						limit: limit
					}
				}, {
					description: '获取用户抽奖历史列表'
				});
			}
		}
	};

});