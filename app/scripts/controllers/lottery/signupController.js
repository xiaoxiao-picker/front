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
	var LotteryInfo, SignupRequires;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "lottery.signup";
		_controller.actions = {
			signup: function() {
				var btn = this;

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				if (LotteryInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("填写中奖信息需要绑定手机号码！", function() {
						signup();
					});
				} else {
					signup();
				}


				function signup() {
					Helper.begin(btn);
					LotteryService.signup(lotteryId, REQUIREINFO.fieldsToData(SignupRequires)).done(function(data) {
						Helper.alert('提交信息成功！', function() {
							Helper.jump('#organization/' + orgId + '/lottery/' + lotteryId + '/info');
						});
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(btn);
					});
				}
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
		lotteryId = Helper.param.hash('lid');
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/lottery/' + lotteryId + '/draw';

		if (title) {
			Helper.storePageTitle(orgId, "lotterySignup", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "lotterySignup") || "填写登记表";
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
			SignupRequires = makeSignupRequires(data.result);
			var fieldsHTML = makeFields(SignupRequires, controller.namespace);

			$("#content").html(template("app/templates/lottery/signup", {}));
			$("#LotterySignup").html(fieldsHTML);

		})

		$.when(getLotteryInfo, getRegister).fail(function(error) {
			Helper.alert(error);


		}).always(function() {
			Helper.execute(controller.callback);
		});

	};

	function makeSignupRequires(register) {
		var texts = register.texts;
		var dates = register.dates;
		var choices = register.choices;
		var images = register.images;

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