define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取组织信息
	exports.get = function(orgId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/get'
		}, {
			description: "获取组织信息"
		});
	};

	// 获取组织扩展信息
	exports.getExtendInfo = function(orgId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/extend/get'
		}, {
			description: '获取组织扩展信息'
		});
	};

	// 获取组织配置信息
	exports.getOrganizationConfig = function(orgId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/config/get'
		}, {
			description: '获取组织配置信息'
		});
	};

	// 获取组织公众号信息
	exports.getWechat = function(orgId) {
		return globalResponseHandler({
			url: 'wechat/public/get-by-organization',
			data: {
				organizationId: orgId
			}
		}, {
			description: '获取组织公众号信息'
		});
	};

	// 获取申请加入组织所需条件
	exports.getJoinCondition = function(orgId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/register/get'
		}, {
			description: '获取申请加入组织所需条件'
		});
	};

	// 成员申请加入组织
	exports.join = function(orgId, signUpInfo) {
		return globalResponseHandler({
			url: 'member/apply',
			type: 'post',
			data: {
				organizationId: orgId,
				signUpInfo: signUpInfo
			}
		}, {
			description: '成员申请加入组织'
		});
	};

	exports.ticket = {
		check: function(sourceId, captcha, token) {
			return globalResponseHandler({
				url: 'ticket/' + sourceId + '/check',
				type: 'post',
				data: {
					captcha: captcha,
					verificationToken: token
				}
			}, {
				description: '检票'
			});
		},
		getToken: function(sourceId) {
			return globalResponseHandler({
				url: 'ticket/' + sourceId + '/verification-code'
			}, {
				description: '获取检票权限码'
			});
		}
	};

	/* ==================== 微首页 ==================== */

	// 获取组织正在使用的微首页模板
	exports.getActivedWechatHomepage = function(orgId) {
		return globalResponseHandler({
			url: 'org/' + orgId + '/open_template/get'
		}, {
			description: '获取组织正在使用的微首页模板'
		});
	};
	
	// 获取组织某个微首页模板的详细信息
	exports.getWechatHomepage = function(orgId, templateId) {
		return globalResponseHandler({
			url: "org/" + orgId + "/template/" + templateId + "/get"
		}, {
			description: '获取组织某个微首页模板的详细信息'
		});
	};

	// 获取组织分类列表
	exports.getCategoryList = function(orgId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/class/list'
		}, {
			description: '获取组织分类列表'
		});
	};
});