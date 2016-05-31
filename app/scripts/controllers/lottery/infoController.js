define(function(require, exports, module) {
	require('styles/lottery.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LotteryService = require("LotteryService");

	var temp, orgId, lotteryId;

	var Controller = function() {
		var controller = this;
		this.namespace = "lottery.info";
		this.actions = {
			
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.callback = callback;
		this.recordURL();

		temp = 'app/templates/lottery/info';
		orgId = Helper.param.hash("oid") || Application.organization.id;
		userId = Application.user.info.id;
		lotteryId = Helper.param.hash("lid");
		this.backURL = '#organization/' + orgId + '/lottery/' + lotteryId + '/draw';

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: "抽奖详情",
			user: Application.user.info
		}));

		var getLotteryInfo = LotteryService.get(lotteryId).done(function(data) {
			controller.lotteryInfo = data.result;
			Helper.setTitle(controller.lotteryInfo.name);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		var getAwards = LotteryService.award.getList(lotteryId).done(function(data) {
			controller.awards = makeAwards(data.result);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		$.when(getLotteryInfo, getAwards).done(function(data) {
			$("#content").html(template(temp, {
				orgId: orgId,
				lottery: controller.lotteryInfo,
				awards: controller.awards
			}));
			
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeAwards(awards) {
		$.each(awards, function(idx, award) {
			award.canJump = award.lotteryTicketUrl ? true : false;
			award.jumpUrl = window.location.origin + '/posters/lottery/award.html?oid=' + orgId + '&lid=' + lotteryId + '&aid=' + award.id;
		});

		return awards;
	}

	module.exports = Controller;
});