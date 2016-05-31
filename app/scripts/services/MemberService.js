define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	/**
	 * 获取组织新申请成员列表
	 */
	exports.getAllAppliedMembers = function(orgId, options) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/member/list_apply',
			data: {
				skip: options.skip,
				limit: options.limit
			}
		});
	};

	/** 
	 * 同意成员申请
	 * options [userId,remark,position]
	 */
	exports.agreeMemberApply = function(orgId, userId, options) {
		options = options || {};
		options.userId = userId;
		return globalResponseHandler({
			url: 'org/' + orgId + "/apply/agree",
			type: 'post',
			data: options
		});
	};

	/**
	 * 拒绝成员申请
	 */
	exports.refuseMemberApply = function(orgId, userId) {
		return globalResponseHandler({
			url: 'org/' + orgId + "/apply/refuse",
			type: 'post',
			data: {
				userId: userId
			}
		});
	};

	//获取成员资料
	exports.getMemberInfo = function(orgId, userId) {
		return globalResponseHandler({
			url: 'org/' + orgId + "/member/get",
			data: {
				userId: userId
			}
		});
	};

	//获取申请者资料
	exports.getApplyInfo = function(orgId, applyId) {
		return globalResponseHandler({
			url: 'org/' + orgId + "/apply/" + applyId + '/get'
		});
	};

});