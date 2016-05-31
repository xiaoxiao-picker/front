define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var OrganizationService = require("OrganizationService");

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var orgId, title;
	var SignupRequires;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "organization.join";
		_controller.actions = {
			join: function() {
				var _btn = this;

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				Application.user.withinPhoneNumber("申请加入组织需要绑定手机号码！", function() {
					Helper.begin(_btn);
					OrganizationService.join(orgId, REQUIREINFO.fieldsToData(SignupRequires)).done(function(data) {
						Helper.alert('申请已提交，正在审核中！', function() {
							Helper.jump('organization/' + orgId + '/zone');
						});
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		var controller = this;
		this.recordURL();
		this.callback = callback;

		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/zone';

		if (title) {
			Helper.storePageTitle(orgId, "orgJoin", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "orgJoin") || "填写资料";

		this.render();

		// 确保用户已绑定手机号
		if (!Application.user.info.phoneNumber) {
			Helper.confirm("申请加入组织需要绑定手机号码！", function() {
				require.async("lib.phoneBindBox", function(PhoneBindBox) {
					PhoneBindBox({
						success: controller.render
					});
				});
			});
		}
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		// 获取申请条件
		var getJoinCondition = OrganizationService.getJoinCondition(orgId).done(function(data) {
			SignupRequires = makeSignupRequires(data.result || {});
		}).fail(function(error) {
			Helper.alert(error);
		});


		// 微信分享用
		var organization = Application.organization.info;
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(this.title + " - " + organization.name, imgUrl, $(organization.description).text(), window.location.href);

		controller.orgInfo = organization;
		$.when(Application.user.getRank(), getJoinCondition).done(function() {
			controller.memberRank = Application.user.rank[orgId];

			var fieldsHTML = makeFields(SignupRequires, controller.namespace);

			$("#content").html(template("app/templates/organization/join", {
				orgInfo: controller.orgInfo,
				memberRank: controller.memberRank
			}));
			$("#OrganizationJoin").html(fieldsHTML);

		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeSignupRequires(register) {
		var texts = register.texts || [];
		var dates = register.dates || [];
		var choices = register.choices || [];
		var images = register.images || [];

		var fields = REQUIREINFO.makeRequiredInfos(texts, dates, choices, images);

		$(fields).each(function(idx, field) {
			field.title = field.title == "tel" ? "phoneNumber" : field.title;
			if (["name", "phoneNumber", "studentId", "grade"].indexOf(field.title) > -1) {
				field.value = Application.user.info[field.title];
			} else if (field.title == "gender") {
				var gender = Application.user.info.gender ? ["保密", "男", "女"][Application.user.info.gender] : "";
				$(field.options).each(function(j, option) {
					option.selected = option.name == gender;
				});
			}

			if (field.type == "RADIO" || field.type == "CHECKBOX") {
				field.selected = field.options.arrayWidthObjAttr("selected", true).length > 0;
			}

			if (field.type == "IMAGE") {
				field.values = [];
			}
		});

		return fields;
	};


	module.exports = Controller;
});