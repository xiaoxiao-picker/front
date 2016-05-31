define(function(require, exports, module) {
	require("styles/user.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var NoticeService = require("NoticeService");

	var temp, orgId, limit;
	var title;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "user.notices";
		_controller.actions = {
			loadMore: function() {
				var _btn = this;

				if (_controller.notices.length > _controller.count) return;
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

		temp = 'app/templates/user/notice/list';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search("limit") || 10;

		if (title) {
			Helper.storePageTitle(orgId, "notices", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "notices") || "最新公告";
		Helper.setTitle(title);

		this.notices = [];
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

		NoticeService.count().done(function(data) {
			controller.count = data.result;

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {}));
				return;
			}

			$("#content").html(template(temp, {}));
			$(".btn-more").trigger("click");


			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.notices.length) {
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
		getNotices(controller, function(notices) {
			$("#NoticesContainer").append(template('app/templates/user/notice/list-inner', {
				orgId: orgId,
				notices: notices
			}));
			var complete = controller.count <= controller.notices.length;
			btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

			Helper.end(btn);
		});
	};

	function getNotices(controller, success, error) {
		controller.state = 'loading';

		var skip = controller.notices.length;
		NoticeService.getList(skip, limit).done(function(data) {
			var notices = makeNotices(data.result, data.time);
			controller.notices = controller.notices.concat(notices);
			success(notices);
		}).fail(function(errorMsg) {
			Helper.errorToast(errorMsg);
		}).always(function() {
			controller.state = 'complete';
		});
	};

	function makeNotices(data, currentTime) {
		var notices = [];
		$.each(data, function(idx, notice) {
			notice.announcement.createTime = Helper.dateDiff(notice.announcement.sendDate, currentTime);
			notices.push(notice.announcement);
		});

		return notices;
	};


	module.exports = Controller;
});