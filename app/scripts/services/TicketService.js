define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取电子票详情
	exports.get = function(ticketId) {
		return globalResponseHandler({
			url: 'ticket-source/' + ticketId + '/get'
		}, {
			description: '获取电子票详情'
		});
	};

	// 获取用户电子票详情
	exports.getTicket = function(ticketId) {
		return globalResponseHandler({
			url: 'ticket-source/' + ticketId + '/ticket/get'
		}, {
			description: '获取用户电子票详情'
		});
	};

	// 检票
	exports.check = function(ticketId, captcha) {
		return globalResponseHandler({
			url: 'ticket/check',
			type: 'post',
			data: {
				ticketId: ticketId,
				captcha: captcha
			}
		}, {
			description: '检票'
		});
	};

	// 抢票
	exports.signup = function(openTimeId, signUpInfo) {
		return globalResponseHandler({
			url: 'ticket-source/open-time/' + openTimeId + '/request',
			type: 'post',
			data: {
				signUpInfo: signUpInfo
			}
		}, {
			description: '抢票'
		});
	};

});