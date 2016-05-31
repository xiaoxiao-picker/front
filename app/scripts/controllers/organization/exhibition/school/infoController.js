define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ExhibitionService = require("ExhibitionService");

	var temp, orgId, session, relateId;

	var Controller = function() {
		this.namespace = "exhibition.info.school";
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;
		temp = 'app/templates/organization/exhibition/school/info';
		orgId = Application.organization.id;
		relateId = Helper.param.hash("rid");
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

		ExhibitionService.get(orgId, relateId).done(function(data) {
			controller.orgInfo = data.result;
			Helper.setTitle(controller.orgInfo.name);

			// 微信分享用
			var imgUrl = controller.orgInfo.thumbnailUrl ? controller.orgInfo.thumbnailUrl + '@300w_300h_1e_1c' : "";
			controller.share(controller.title, imgUrl, controller.orgInfo.name, window.location.href);

			$("#content").html(template(temp, {
				orgInfo: controller.orgInfo
			}));

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
		
	};

	module.exports = Controller;
});