define(function(require, exports, module) {
	require("styles/user.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var UserService = require("UserService");

	var temp, orgId, userId;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "user.resume";
		_controller.actions = {};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/user/resume/info';
		orgId = Application.organization.id;
		userId = Helper.param.hash('uid');
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';

		if (title) {
			Helper.storePageTitle(orgId, "userResume", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "userResume") || "个人简历";

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html('');

		if (userId == Application.user.id) {
			controller.userInfo = Application.user.info;
			renderInit();
			Helper.execute(controller.callback);
		} else {
			UserService.get(userId).done(function(data) {
				controller.userInfo = data.result;
				renderInit();
			}).fail(function(error) {
				Helper.errorAlert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		}

		function renderInit() {
			var name = controller.userInfo.name || controller.userInfo.phoneNumber;
			Helper.setTitle(name + " - " + title);

			$("#content").html(template(temp, {
				orgId: orgId,
				user: controller.userInfo
			}));

			JoinedEventsRender(0, 100);
			// AwardsRender(-1, -1);
			ERender(0, 100);
		};
	}

	/**
	 * 渲染已报名的活动
	 */
	function JoinedEventsRender(skip, limit) {
		$("#EventsContainer").html(template("app/templates/public/loading", {
			theme: "default"
		}));
		var getCount = UserService.history.event.count(userId).done(function(data) {
			var count = data.result;
			UserService.history.event.getList(userId, skip, limit).done(function(data) {
				var sources = data.result;

				var events = [];
				$.each(sources, function(idx, source) {
					if (source.source.event) {
						events.push(source.source.event);
					};
				});

				$("#EventsContainer").html(template("app/templates/user/resume/events", {
					count: count,
					events: events,
					orgId: orgId
				}));
			}).fail(function(error) {
				Helper.errorToast(error);
			});
		}).fail(function(error) {
			Helper.errorToast(error);
		});
	};

	/**
	 * 奖项记录
	 */
	function AwardsRender(skip, limit) {
		$("#AwardsContainer").html(template("app/templates/public/loading", {
			theme: "default"
		}));
		AwardService.getUserAwards(userId, skip, limit, {
			fromType: 'org',
			fromId: orgId
		}).done(function(data) {
			var count = data.result.count;
			var awards = data.result.array;
			$("#AwardsContainer").html(template("app/templates/user/resume/awards", {
				count: count,
				awards: awards,
				orgId: orgId
			}));
		}).fail(function(error) {
			Helper.errorAlert(error);
		});
	};

	/**
	 * 第二课堂简历
	 */
	function ERender(skip, limit) {
		$("#EContainer").html(template("app/templates/public/loading", {
			theme: "default"
		}));
		UserService.history.comment.getList(orgId, userId, skip, limit).done(function(data) {
			var comments = data.result;
			$("#EContainer").html(template("app/templates/user/resume/e", {
				comments: comments,
				orgId: orgId
			}));
		}).fail(function(error) {
			Helper.errorAlert(error);
		});
	};

	module.exports = Controller;
});