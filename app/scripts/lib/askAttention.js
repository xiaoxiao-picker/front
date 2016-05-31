/**
 * 弹窗提示用户关注公众号
 * lib/attention-modal.scss
 */
define(function(require, exports, module) {
	var Tips = require("tips");

	function askAttention(wechat, token, message) {
		var qrcode = wechat.qrCodeUrl;
		var name = wechat.name;
		if (qrcode) {
			var tips = [
				"<header class='attention-modal-header'>",
				"<p class='p1'>长按二维码,选择<span>【识别二维码图片】</span></p>",
				"<p class='p2'>关注我们,回复<span class='token'>" + token + "</span>" + message + "</p>",
				"</header>",
				"<div class='attention-modal-content'>",
				"<img class='image' src='" + qrcode + "' />",
				"</div>",
				"<footer class='attention-modal-footer'>若不能自动识别，请保存后在微信中使用【扫一扫】=>【相册】扫描二维码。</footer>"
			].join('');
		} else {
			var tips = [
				"<header class='attention-modal-header'>",
				"<p class='p1'>搜索关注公众号：</p>",
				"<p class='p2'>【" + name + "】</p>",
				"<p class='p2'>回复<span class='token'>" + token + "</span>" + message + "</p>",
				"</header>",
				"<div class='attention-modal-content' style='padding-bottom:0px; background-color:#fff;'><img style='width:160px;height:auto;' src='/images/default/alert_success.png' /></div>"
			].join('');
		}

		var attentionAskModal = Tips(tips);
		attentionAskModal.messageBox.find('.token').on('click',function(){});
	}

	module.exports = askAttention;
});