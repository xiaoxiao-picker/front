define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取图文消息详情
	exports.getArticle = function(articleId) {
		return globalResponseHandler({
			url: 'wechat/reply/article/' + articleId + '/detail/get'
		}, {
			description: '获取图文消息详情'
		});
	};

});