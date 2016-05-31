define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// targetType:EVENT, ARTICLE, POLL, PROPOSAL, MEMBER, WALL, TICKET, VOTE, FEEDBACK
	// operationType:LIST, GET, ADD, UPDATE, REMOVE, SIGNUP, CANCEL_SIGNUP, PRAISE, CANCEL_PRAISE

	// 添加访问记录
	exports.add = function(organizationId, targetType, targetSubType, operationType, targetId, content) {
		return globalResponseHandler({
			url: "log/add",
			type: "post",
			data: {
				organizationId: organizationId,
				operationType: operationType,
				targetType: targetType,
				targetSubType: targetSubType,
				targetId: targetId,
				content: content
			}
		}, {
			description: "操作日志添加"
		});
	};

});