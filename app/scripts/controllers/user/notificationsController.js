define(function(require, exports, module) {
	require("styles/user.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var NotificationService = require("NotificationService");

	var temp, orgId, limit;
	var title;

	var Controller = function() {
		var controller = this;
		controller.namespace = "user.notifications";
		controller.actions = {
			loadMore: function() {
				var btn = this;

				if (controller.notifications.length > controller.count) return;
				Helper.begin(btn);

				controller.state = 'loading';

				var skip = controller.notifications.length;
				NotificationService.getList(skip, limit).done(function(data) {
					var notifications = makeNotifications(data.result, data.time);
					controller.notifications = controller.notifications.concat(notifications);
					$("#Notifications").append(template('app/templates/user/notification/list-inner', {
						orgId: orgId,
						notifications: notifications
					}));
					var complete = controller.count <= controller.notifications.length;
					btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');
				}).fail(function(errorMsg) {
					Helper.errorAlert(errorMsg);
				}).always(function() {
					controller.state = 'complete';
					Helper.end(btn);
				});
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

		temp = 'app/templates/user/notification/list';
		orgId = Helper.param.hash("oid") || Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search('limit') || 10;

		if (title) {
			Helper.storePageTitle(orgId, "notifications", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "notifications") || "通知中心";
		Helper.setTitle(title);

		this.notifications = [];
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

		// 获取总数
		var getCount = NotificationService.count().done(function(data) {
			controller.count = data.result;

			markAllReaded();

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {}));
				return;
			}

			$("#content").html(template(temp, {}));
			$(".btn-more").trigger("click");

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.notifications.length) {
					$(".btn-more").trigger("click");
				}
			});

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function markAllReaded() {
		Application.user.getMessageUnreadCount(true).done(function() {
			var count = Application.user.unReadCount;
			if (count) {
				NotificationService.read().done(function() {

				}).fail(function(error) {
					Helper.errorAlert(error);
				});
			};
		});
	}



	function makeNotifications(data, currentTime) {
		var notifications = [];
		$.each(data, function(idx, item) {
			var notification = {
				id: item.id,
				type: item.type,
				readed: item.readed,
				text: item.text,
				createTime: Helper.dateDiff(item.createDate, currentTime),
				thumbnailUrl: '',
				name: ''
			};

			(!item.source) && (item.source = {});
			(!item.source.user) && (item.source.user = {});


			var source = item.source;
			if (item.type == 'COMMENT_REPLY') {
				notification.thumbnailUrl = source.user.portraitUrl || '';
				notification.name = source.user.name || source.user.nickname || source.user.phoneNumber;
				notification.attach = source.attach || {};
				notification.comment = source.comment || {};
			} else {
				notification.thumbnailUrl = source.logoUrl || '';
				notification.name = source.name || '未命名';
			}
			notifications.push(notification);
		});
		return notifications;
	};



	module.exports = Controller;
});