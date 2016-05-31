define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取问卷总数
	exports.count = function(orgId) {
		return globalResponseHandler({
			url: 'poll/count',
			data: {
				organizationId: orgId
			}
		}, {
			description: '获取问卷总数'
		});
	};

	// 获取问卷列表
	exports.getList = function(orgId, skip, limit) {
		return globalResponseHandler({
			url: 'poll/list',
			data: {
				organizationId: orgId,
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取问卷列表'
		});
	};

	// 获取问卷详情
	exports.get = function(pollId) {
		return globalResponseHandler({
			url: 'poll/' + pollId + '/get'
		}, {
			description: '获取问卷详情'
		});
	};

	// 获取问卷题目
	exports.getRegister = function(pollId) {
		return globalResponseHandler({
			url: 'poll/' + pollId + '/register/get'
		}, {
			description: '获取问卷题目'
		});
	};

	// 提交问卷
	exports.signup = function(pollId, signUpInfo) {
		return globalResponseHandler({
			url: 'poll/' + pollId + '/sign-up',
			type: 'post',
			data: {
				signUpInfo: signUpInfo
			}
		}, {
			description: '提交问卷'
		});
	};

	// 获取问卷题目
	exports.getAnswer = function(pollId) {
		return globalResponseHandler({
			url: 'poll/' + pollId + '/register-result/get'
		}, {
			description: '获取问卷题目'
		});
	};

});