define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	/**
	 *	获取广告详情
	 */
	exports.getAdvert = function(sourceType, sourceId) {
		return globalResponseHandler({
			url: 'advertisement/' + sourceType + "/" + sourceId + '/get'
		});
	};

});