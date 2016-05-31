define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');



	// 校校公众号AppId
	exports.getPublicAppId = function() {
		return globalResponseHandler({
			url: 'application/public-app-id'
		}, {
			description: "获取微信唯一标识"
		});
	};
	// 第三方平台AppId
	exports.getComponentAppId = function() {
		return globalResponseHandler({
			url: 'application/component-app-id'
		}, {
			description: "获取第三方平台AppId"
		});
	};



	// 获取微信JS-SDK签名
	exports.JSSDKSignature = function(url) {
		return globalResponseHandler({
			url: 'application/js-api-signature',
			data: {
				url: url
			}
		}, {
			description: "获取微信签名"
		});
	};

	// 查看是否已关注
	exports.checkAttention = function(publicId, sourceType, sourceId) {
		return globalResponseHandler({
			url: "wechat/attention/check",
			data: {
				publicId: publicId,
				sourceId: sourceId,
				sourceType: sourceType
			}
		}, {
			description: "检查用户是否关注公众号"
		});
	};
});