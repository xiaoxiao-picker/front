define(function(require, exports, module) {
	require("styles/user.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var UserService = require("UserService");

	var temp, orgId, userId, title, limit;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "user.history";
		_controller.actions = {
			loadMore: function() {
				var _btn = this;

				if (_controller.sources.length > _controller.count) return;
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

		temp = 'app/templates/user/history/lottery';
		orgId = Application.organization.id;
		userId = Helper.param.search('uid') || Application.user.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search("limit") || 10;

		if (title) {
			Helper.storePageTitle(orgId, "history", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "history") || "我的参与";
		Helper.setTitle(title);

		this.sources = [];
		this.count = 0;

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

		controller.tab = {
			className: 'tab-2',
			menus: [{
				type: 'EVENT',
				hash: '#organization/' + orgId + '/user/history/event',
				icon: 'icon-banner',
				title: '活动'
			}, {
				type: 'LOTTERY',
				hash: '#organization/' + orgId + '/user/history/lottery',
				icon: 'icon-wheel',
				title: '抽奖'
			}]
		};

		UserService.history.lottery.count(userId).done(function(data) {
			controller.count = data.result;

			$("#content").html(template(temp, {
				currentTab: 'LOTTERY',
				tab: controller.tab
			}));

			if (!controller.count) {
				$(".user-history-container").html(template('app/templates/public/empty', {}));
				return;
			}

			$(".btn-more").trigger("click");

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.sources.length) {
					$(".btn-more").trigger("click");
				}
			});

		}).fail(function(error) {
			Helper.errorToast(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {
		Helper.begin(btn);
		getSources(controller, function(sources) {
			$("#HistoryContainer").append(template('app/templates/user/history/lottery-rows', {
				orgId: orgId,
				sources: sources
			}));
			var complete = controller.count <= controller.sources.length;
			btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

			Helper.end(btn);
		});
	};

	function getSources(controller, success, error) {
		controller.state = 'loading';

		var skip = controller.sources.length;
		UserService.history.lottery.getList(userId, skip, limit).done(function(data) {
			var sources = makeSources(data.result, data.time);
			controller.sources = controller.sources.concat(sources);
			success(sources);
		}).fail(function(error) {
			Helper.errorToast(error);
		}).always(function() {
			controller.state = 'complete';
		});
	};

	function makeSources(data, currentTime) {
		var colors = ['green', 'blue', 'orange', 'red'];
		$.each(data, function(idx, item) {
			item.color = colors[idx % 4];
			item.createTime = Helper.dateDiff(item.createDate, currentTime);
		});

		return data;
	}

	module.exports = Controller;
});