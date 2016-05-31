define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	/**
	 * 获取文章类别
	 */
	exports.getCategoryList = function(orgId) {
		return globalResponseHandler({
			url: 'article/category/list',
			data: {
				organizationId: orgId
			}
		});
	};

	/**
	 * 获取文章数量
	 */
	exports.count = function(orgId, keyword, categoryId) {
		var data = {
			organizationId: orgId
		};
		if (keyword) {
			data.keyword = keyword;
		}
		if (categoryId) {
			data.categoryId = categoryId;
		}
		return globalResponseHandler({
			url: 'article/count',
			data: data
		}, {
			description: "获取组织文章数量"
		});
	};
	/**
	 * 获取组织文章列表
	 */
	// exports.getArticles = function(orgId, session, options) {
	// 	options = options || {};
	// 	options.session = session;
	// 	return globalResponseHandler({
	// 		url: 'org/' + orgId + '/article/list',
	// 		data: options
	// 	});
	// };
	/**
	 * 获取组织文章列表
	 */
	exports.getList = function(orgId, skip, limit, keyword, categoryId) {
		var data = {
			organizationId: orgId,
			skip: skip,
			limit: limit
		};
		if (keyword) {
			data.keyword = keyword;
		}
		if (categoryId) {
			data.categoryId = categoryId;
		}
		return globalResponseHandler({
			url: 'article/list',
			data: data
		}, {
			description: "获取组织文章列表"
		});
	};



	/**
	 * 获取某文章的详情
	 */
	exports.getArticle = function(articleId) {
		return globalResponseHandler({
			url: 'article/' + articleId + '/get'
		});
	};


});