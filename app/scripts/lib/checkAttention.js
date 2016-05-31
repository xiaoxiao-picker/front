/**
 * 判断用户是否已经关注公众号
 * 如果未关注则返回对应业务的Token，以便后台根据Token响应对应内容至前端
 */

define(function(require, exports, module) {
	var PublicService = require("PublicService");
	var Helper = require("helper");

	var messages = {
		VOTE: "该投票被设置为需要关注才能投票，但投票所属组织未在校校绑定微信公众平台！",
		LOTTERY: "该抽奖被设置为需要关注才能投票，但抽奖所属组织未在校校绑定微信公众平台！"
	};

	/**
	 * 判断用户是否已经关注公众号
	 * @param  {string} sourceType 业务类型([VOTE,LOTTERY])
	 * @param  {string} sourceId   业务ID
	 */
	function checkAttention(sourceType, sourceId, callback) {
		var organization = Application.organization;

		organization.getWechat().done(function() {
			if (!organization.wechat || !organization.wechat.id) {
				Helper.alert(messages[sourceType]);
				return;
			}
			// 检查用户是否关注微信号
			PublicService.checkAttention(organization.wechat.id, sourceType, sourceId).done(function(data) {
				callback && callback(data);
			}).fail(function(error) {
				Helper.alert(error);
			});
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	module.exports = checkAttention;
});