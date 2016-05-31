define(function(require, exports, module) {
	require('styles/questionnaire.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var QuestionnaireService = require("QuestionnaireService");

	var temp, session, orgId, pollId;
	var title, CurrentTime;

	var Controller = function() {
		this.namespace = "questionnaire.info";
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/questionnaire/info';
		orgId = Application.organization.id;
		pollId = Helper.param.hash("pid") || 0;
		title = decodeURIComponent(Helper.param.search('title'));
		this.backURL = '#organization/' + orgId + '/questionnaires';

		if (title) {
			Helper.storePageTitle(orgId, "questionnaire", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "questionnaire") || "问卷详情";
		Helper.setTitle(title);

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

		QuestionnaireService.get(pollId).done(function(data) {
			controller.questionnaire = makeQuestionnaire(data.result, data.time);
			wechatShare(controller, controller.questionnaire);

			$("#content").html(template(temp, {
				orgId: orgId,
				questionnaire: controller.questionnaire
			}));
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeQuestionnaire(questionnaire, currentTime) {
		questionnaire.progress = makeProgress(questionnaire.startDate, questionnaire.endDate, currentTime);
		questionnaire.createTime = Helper.dateDiff(questionnaire.createDate, currentTime);

		function makeProgress(start, end, current) {
			if (start > current) {
				return {
					state: "NOTSTART",
					distance: Helper.distance(current, start).local
				};
			} else if (end < current) {
				return {
					state: "OVER",
					distance: Helper.distance(end, current).local
				};
			} else if (current >= start && current <= end) {
				return {
					state: "UNDERWAY",
					distance: Helper.distance(start, end).local
				};
			} else return {
				state: "UNKNOWN",
				distance: null
			};
		};

		return questionnaire;
	};

	// 微信分享
	function wechatShare(controller, questionnaire) {
		var shareTitle = questionnaire.title + " - " + Application.organization.info.name;
		var shareImage = questionnaire.thumbnail ? questionnaire.thumbnail + "@300w_300h_1e_1c" : "";
		var shareDesc = $(questionnaire.text).text();
		var shareUrl = questionnaire.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	}

	module.exports = Controller;
});