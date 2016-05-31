define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ExhibitionService = require("ExhibitionService");

	var temp, orgId, session, relateId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "exhibition.info.country";
		_controller.actions = {
			attention: function() {
				var _btn = this;
				var info = _controller.schoolInfo;

				var modal = Helper.modal({
					closeButton: true
				});
				modal.html(template('app/templates/public/qrcode', {
					qrCodeUrl: info.schoolQrUrl,
					name: info.school && info.school.name
				}));
			},
			showQRCode: function() {
				var _btn = this;
				var wechatId = _btn.attr('data-value');
				var wechat = _controller.wechats.objOfAttr('id', wechatId);

				var modal = Helper.modal({
					closeButton: true
				});
				modal.html(template('app/templates/public/qrcode', {
					qrCodeUrl: wechat.qrUrl,
					name: wechat.name
				}));
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
		temp = 'app/templates/organization/exhibition/country/info';
		orgId = Application.organization.id;
		exhibitionId = Helper.param.hash("eid");
		this.backURL = '#organization/' + orgId + '/list';

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

		var getSchoolInfo = ExhibitionService.school.get(exhibitionId).done(function(data) {
			controller.schoolInfo = data.result;
			Helper.setTitle(controller.schoolInfo.school.name);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		getWechatCount = ExhibitionService.school.wechat.count(exhibitionId).done(function(data) {
			controller.wechatCount = data.result;
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		getWechatList = ExhibitionService.school.wechat.getList(exhibitionId, 0, 4).done(function(data) {
			controller.wechats = data.result;
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		$.when(getSchoolInfo, getWechatCount, getWechatList).done(function() {
			$("#content").html(template(temp, {
				orgId: orgId,
				exhibitionId: exhibitionId,
				schoolInfo: controller.schoolInfo,
				wechats: controller.wechats,
				wechatCount: controller.wechatCount
			}));
		}).always(function() {
			Helper.execute(controller.callback);
		});

		// 微信分享用
		// var imgUrl = controller.orgInfo.thumbnailUrl ? controller.orgInfo.thumbnailUrl + '@300w_300h_1e_1c' : "";
		// this.share(this.title, imgUrl, controller.orgInfo.name, window.location.href);
	};

	module.exports = Controller;
});