define(function(require, exports, module) {
	require('styles/questionnaire.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var QuestionnaireService = require("QuestionnaireService");

	var temp, orgId, pollId;
	var title;

	var Controller = function() {
		var _controller = this;
		this.namespace = "questionnaire.statistics";
		this.actions = {

		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/questionnaire/statistics';
		orgId = Application.organization.id;
		pollId = Helper.param.hash("pid");
		title = decodeURIComponent(Helper.param.search('title'));
		this.backURL = '#organization/' + orgId + '/questionnaires';

		if (title) {
			Helper.storePageTitle(orgId, "questionnaire", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "questionnaire") || "统计结果";

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

		var getQuestionnaire = QuestionnaireService.get(pollId).done(function(data) {
			controller.questionnaire = data.result;
			Helper.setTitle(controller.questionnaire.title + ' - ' + title);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		var getRegister = QuestionnaireService.getRegister(pollId).done(function(data) {
			controller.choices = makeChoices(data.result.choices, data.result.total);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		$.when(getQuestionnaire, getRegister).done(function() {
			$("#content").html(template(temp, {
				choices: controller.choices
			}));

			setTimeout(function() {
				$("#Statistics .progress").each(function(idx, option) {
					$(option).width(+$(option).attr("data-value"));
				});
			});
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeChoices(choices, total) {
		$.each(choices, function(idx, choice) {
			$.each(choice.options, function(o_idx, option) {
				var value = total ? Math.round((option.total / total) * 100) / 100 : total;
				option.percent = value * 100 + "%";
				option.progress = ($(window).width() - 60) * 0.8 * value;
			});
		});

		return choices;
	};

	// 微信分享
	function wechatShare(controller, questionnaire) {
		var shareTitle = questionnaire.name + " - " + Application.organization.name;
		var shareImage = questionnaire.thumbnail ? questionnaire.thumbnail + "@300w_300h_1e_1c" : "";
		var shareDesc = questionnaire.text;
		var shareUrl = questionnaire.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	}

	module.exports = Controller;
});