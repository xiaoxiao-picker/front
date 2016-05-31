define(function(require, exports, module) {
	require('styles/lottery.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LotteryService = require("LotteryService");

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var orgId, title, lotteryId;
	var LotteryInfo, Register, Result;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "lottery.signup.result";
		_controller.actions = {

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
		lotteryId = Helper.param.hash('lid');
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/lottery/' + lotteryId + '/draw';

		if (title) {
			Helper.storePageTitle(orgId, "lotterySignup", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "lotterySignup") || "查看登记表";
		Helper.setTitle(title);

		this.render();
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

		var getLotteryInfo = LotteryService.get(lotteryId).done(function(data) {
			LotteryInfo = data.result;

			// 确保用户已绑定手机号
			if (LotteryInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("填写中奖信息需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: controller.render
						});
					});
				});
			}
		});

		var getRegister = LotteryService.getRegister(lotteryId).done(function(data) {
			Register = data.result;
		});

		var getResult = LotteryService.getResult(lotteryId).done(function(data) {
			Result = data.result;
		});

		$.when(getLotteryInfo, getRegister, getResult).done(function(data) {
			var signupRequires = makeSignupRequires(Register, Result);
			var fieldsHTML = makeFields(signupRequires, controller.namespace);

			$("#content").html(template("app/templates/lottery/signup-result", {}));
			$("#LotterySignup").html(fieldsHTML);
			
			fieldsHTML.off('click.' + controller.namespace);
			fieldsHTML.find('button[removeImage]').addClass('hide');
			fieldsHTML.find('.image-add').addClass('hide');

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});

	};

	function makeSignupRequires(register, result) {
		var texts = register.texts;
		var dates = register.dates;
		var choices = register.choices;
		var images = register.images;

		var fields = REQUIREINFO.makeRequiredInfos(texts, dates, choices, images);
		
		$(fields).each(function(idx, field) {
			if (field.type == "TEXT" || field.type == "TEXTAREA") {
				var obj = result.userTexts.objOfAttr('textId', field.id) || {};
				field.value = obj.value;
			} else if (field.type == "DATE") {
				var obj = result.userDates.objOfAttr('dateId', field.id) || {};
				field.value = obj.value;
			} else if (field.type == "RADIO" || field.type == "CHECKBOX") {
				$(field.options).each(function(j, option) {
					option.selected = result.userOptions.indexOfAttr('optionId', option.id) > -1;
				});
				field.selected = field.options.arrayWidthObjAttr("selected", true).length > 0;
			} else if (field.type == "IMAGE") {
				var obj = result.userImages.objOfAttr('imageId', field.id) || {};
				field.values = obj.value.split(',');
			}
		});

		return fields;
	};

	module.exports = Controller;
});