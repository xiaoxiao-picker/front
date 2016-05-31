define(function(require, exports, module) {
	var Helper = require("helper");
	var debug = Helper.param.search("debug");
	module.exports = function(callback, url) {
		url = url || window.location.origin + window.location.pathname + window.location.search;
		$.when(Application.getPublicAppId(), Application.getSignature(url)).done(function() {
			require.async("wxsdk", function(wx) {
				window.wx = wx;
				var config = Application.signatures[url];
				wx.config({
					debug: debug ? true : false,
					appId: Application.publicAppId,
					timestamp: config.timestamp,
					nonceStr: config.nonceStr,
					signature: config.signature,
					jsApiList: [
						'checkJsApi',
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareQQ',
						'onMenuShareWeibo',
						'hideMenuItems',
						'showMenuItems',
						'hideAllNonBaseMenuItem',
						'showAllNonBaseMenuItem',
						'translateVoice',
						'startRecord',
						'stopRecord',
						'onRecordEnd',
						'playVoice',
						'pauseVoice',
						'stopVoice',
						'uploadVoice',
						'downloadVoice',
						'chooseImage',
						'previewImage',
						'uploadImage',
						'downloadImage',
						'getNetworkType',
						'openLocation',
						'getLocation',
						'hideOptionMenu',
						'showOptionMenu',
						'closeWindow',
						'scanQRCode',
						'chooseWXPay',
						'openProductSpecificView',
						'addCard',
						'chooseCard',
						'openCard'
					],
					success: function(res) {
						window.wxApiResult = res.checkResult;
						debug && (Helper.alert(JSON.stringify(res)));
					}
				});

				wx.ready(function() {
					Helper.execute(callback);
				});
				wx.error(function(res) {
					debug && Helper.alert(url);
				});
			});
		}).fail(function(error) {
			// there is something wrong here
			Helper.execute(callback);
			// debug模式下弹出错误提示
			if (debug) Helper.alert(error);
		});
	};
});