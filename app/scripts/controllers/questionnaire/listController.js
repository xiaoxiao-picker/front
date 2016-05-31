define(function(require, exports, module) {
	require('styles/questionnaire.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var date = require('date');
	var QuestionnaireService = require("QuestionnaireService");

	var temp, orgId, skip, limit, pageIndex;
	var title;

	var Controller = function() {
		var _controller = this;
		this.namespace = "questionnaires";
		this.actions = {
			loadMore: function() {
				var _btn = this;
				pageIndex++;

				loadMore(_controller, _btn);
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

		temp = 'app/templates/questionnaire/list';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = 10;
		pageIndex = 0;

		// 存储标题
		if (title) {
			Helper.storePageTitle(orgId, "quests", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "quests") || "问卷列表";
		Helper.setTitle(title);

		this.count = 0;
		this.questionnaires = [];

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;
	
		// 微信分享用
		var organization = Application.organization.info;
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(title, imgUrl, organization.name, window.location.href);

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		skip = pageIndex * limit;

		QuestionnaireService.count(orgId).done(function(data) {
			controller.count = data.result;

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {}));
				return;
			}

			getQuestionnaires(controller, function(questionnaires) {
				controller.questionnaires = controller.questionnaires.concat(questionnaires);

				var complete = controller.count <= controller.questionnaires.length;
				$("#content").html(template(temp, {
					questionnaires: questionnaires,
					complete: complete,
					orgId: orgId
				}));
			});

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {

		Helper.begin(btn);
		getQuestionnaires(controller, function(questionnaires) {
			controller.questionnaires = controller.questionnaires.concat(questionnaires);
			var hasMore = controller.count > controller.questionnaires.length;
			$("#QuestionnairesContainer").append(template('app/templates/questionnaire/list-inner', {
				questionnaires: questionnaires,
				orgId: orgId
			}));
			$(".more-container")[hasMore ? "removeClass" : "addClass"]("complete");
			Helper.end(btn);
		});
	};

	function getQuestionnaires(controller, success, error) {
		var skip = pageIndex * limit;

		controller.state = 'loading';

		QuestionnaireService.getList(orgId, skip, limit).done(function(data) {
			var questionnaires = makeQuestionnaires(data.result, data.time);
			success(questionnaires);
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			controller.state = 'complete';
		});
	};

	function makeQuestionnaires(questionnaires, currentTime) {
		$(questionnaires).each(function(idx, questionnaire) {
			questionnaire.progress = makeProgress(questionnaire.startDate, questionnaire.endDate, currentTime);
			questionnaire.createTime = Helper.dateDiff(questionnaire.createDate, currentTime);
		});
		return questionnaires;

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
	};

	module.exports = Controller;
});