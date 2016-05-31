define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');
	//获取表格列表
	exports.getForms = function(orgId, data, session) {
		data.session = session;
		return globalResponseHandler({
			url: 'org/' + orgId + '/form/list',
			data: data
		});
	};

	//获取用户表格列表
	exports.getUserForms = function(userId, data, session) {
		data.session = session;
		return globalResponseHandler({
			url: 'user/' + userId + '/form/list',
			data: data
		});
	}

	//获取表格详情
	exports.getFormInfo = function(formId, session) {
		return globalResponseHandler({
			url: 'form/' + formId + '/get',
			data: {
				session: session
			}
		});
	};

	//编辑表格信息
	exports.addReply = function(formId, data, session) {
		data.session = session;
		return globalResponseHandler({
			url: 'form/' + formId + '/reply/add',
			type: 'post',
			data: data
		});
	};

	//获取回复详情
	exports.replyInfo = function(replyId, session) {
		return globalResponseHandler({
			url: 'form/reply/' + replyId + '/get',
			data: {
				session: session
			}
		});
	};

});