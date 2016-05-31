define(function(require, exports, module) {
	require('styles/questionnaire.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var QuestionnaireService = require("QuestionnaireService");

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var orgId, title, pollId;
	var QuestionnaireInfo, SignupRequires;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "questionnaire.signup";
		_controller.actions = {
			signup: function() {
				var btn = this;

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				if (QuestionnaireInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("填写问卷调查需要绑定手机号码！", function() {
						signup();
					});
				} else {
					signup();
				}


				function signup() {
					Helper.begin(btn);
					QuestionnaireService.signup(pollId, REQUIREINFO.fieldsToData(SignupRequires)).done(function(data) {
						Helper.alert('提交问卷成功！', function() {
							Helper.jump('#organization/' + orgId + '/questionnaires');
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
		pollId = Helper.param.hash('pid');
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/questionnaire/' + pollId + '/info';

		if (title) {
			Helper.storePageTitle(orgId, "questionnaireSignup", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "questionnaireSignup") || "填写问卷";
		Helper.setTitle(title);

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;
		var getQuestionnaire = QuestionnaireService.get(pollId).done(function(data) {
			QuestionnaireInfo = data.result;

			if (QuestionnaireInfo.hasPolled) {
				title = "问卷填写结果";
			}

			$("#header").html(template("app/templates/public/header", {
				title: title,
				user: Application.user.info
			}));

			// 确保用户已绑定手机号
			if (QuestionnaireInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("填写问卷调查需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: controller.render
						});
					});
				});
			}
		});

		var getRegister = QuestionnaireService.getRegister(pollId);

		$.when(getQuestionnaire, getRegister).done(function(data1, data2) {
			var register = data2.result;
			// 如果当前用户未填写问卷，则渲染问卷填写页面
			if (!QuestionnaireInfo.hasPolled) {
				SignupRequires = makeSignupRequires(register);
				var fieldsHTML = makeFields(SignupRequires, controller.namespace);
				$("#content").html(template("app/templates/questionnaire/signup", {}));
				$("#QuestionnaireSignup").html(fieldsHTML);
				Helper.execute(controller.callback);
				return;
			}
			// 如果用户已填写过该问卷，则显示用户所填结果
			QuestionnaireService.getAnswer(pollId).done(function(data) {
				var result = data.result;
				var registerResults = REQUIREINFO.makeRegisterResults(register, result);
				$("#content").html(template("app/templates/questionnaire/result", {
					fields: registerResults,
					questionnaire: QuestionnaireInfo
				}));
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		}).fail(function(error) {
			Helper.alert(error);
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
	}



	module.exports = Controller;
});