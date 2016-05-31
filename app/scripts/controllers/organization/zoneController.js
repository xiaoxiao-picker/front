define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var OrganizationService = require("OrganizationService");
	var MemberService = require("MemberService");

	var temp, session;
	var orgId, orgInfo;
	var userId;

	var title;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.zone";
		_controller.actions = {
			attention: function() {
				var modal = Helper.modal({
					closeButton: true
				});
				modal.html(template('app/templates/public/qrcode', {
					qrCodeUrl: _controller.wechat && _controller.wechat.qrCodeUrl,
					name: _controller.wechat && _controller.wechat.name
				}));
			},
			join: function() {
				Application.user.withinPhoneNumber("申请加入组织需要绑定手机号码！", function() {
					Helper.jump("organization/" + orgId + "/join");
				});
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/organization/zone';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';

		if (title) {
			Helper.storePageTitle(orgId, "orgZone", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "orgZone") || "社团招新";

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: '',
			user: Application.user.info
		}));

		controller.scrollToTop();

		// 微信分享用
		var organization = Application.organization.info;
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(this.title + " - " + organization.name, imgUrl, $(organization.description).text(), window.location.href);


		controller.orgInfo = organization;
		$.when(Application.organization.getExtend(), Application.user.getRank(true), Application.organization.getWechat()).done(function() {
			controller.extendInfo = Application.organization.extend;
			controller.memberRank = Application.user.rank[orgId];
			controller.wechat = Application.organization.wechat;

			Helper.setTitle(controller.orgInfo.name + " - " + title);

			$("#content").html(template(temp, {
				orgInfo: controller.orgInfo,
				extendInfo: controller.extendInfo,
				memberRank: controller.memberRank,
				wechat: controller.wechat
			}));

		}).always(function() {
			Helper.execute(controller.callback);
		});

		// 微信分享用
		var imgUrl = controller.orgInfo.logoUrl ? controller.orgInfo.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(this.title, imgUrl, controller.orgInfo.name, window.location.href);
	};

	module.exports = Controller;
});