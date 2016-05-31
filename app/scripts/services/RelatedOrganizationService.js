define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	exports.getCount = function(organizationId) {
		return globalResponseHandler({
			url: "organization/" + organizationId + "/relation/count"
		}, {
			description: "获取已关联组织的数量"
		});
	};

	exports.getEventCount = function(organizationId, keyword) {
		return globalResponseHandler({
			url: "event/count-related",
			data: {
				organizationId: organizationId,
				keyword: keyword
			}
		}, {
			description: "获取关联组织的活动数量"
		});
	};

	exports.getEventList = function(organizationId, skip, limit, keyword) {
		return globalResponseHandler({
			url: "event/list-related",
			data: {
				organizationId: organizationId,
				keyword: keyword,
				skip: skip,
				limit: limit
			}
		}, {
			description: "获取关联组织的活动"
		});
	};

	exports.getArticleCount = function(organizationId, keyword) {
		return globalResponseHandler({
			url: "article/count-related",
			data: {
				organizationId: organizationId,
				keyword: keyword
			}
		}, {
			description: "获取关联组织的文章数量"
		});
	};
	exports.getArticleList = function(organizationId, skip, limit, keyword) {
		return globalResponseHandler({
			url: "article/list-related",
			data: {
				organizationId: organizationId,
				keyword: keyword,
				skip: skip,
				limit: limit
			}
		}, {
			description: "获取关联组织的文章"
		});
	};
});