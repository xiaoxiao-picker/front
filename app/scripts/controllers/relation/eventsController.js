define(function(require, exports, module) {
	require('styles/event.css');

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var Helper = require('helper');

	var RelatedOrganizationService = require('RelatedOrganizationService');

	var orgId;
	var keyword, limit;

	var title;

	var Controller = function() {
		var controller = this;
		this.namespace = "related.organization.events";
		this.actions = {
			loadMore: function() {
				var btn = this;
				if (controller.events.length >= controller.count) {
					return;
				}
				var skip = controller.events.length;
				Helper.begin(btn);
				RelatedOrganizationService.getEventList(orgId, skip, limit, keyword).done(function(data) {
					var events = makeEventsDate(data.result);
					controller.events = controller.events.concat(events);
					var complete = controller.count <= controller.events.length;
					$("#EventsContainer").append(template("app/templates/relation/option-event", {
						events: events,
						organizationId: orgId
					}));

					btn.parents(".more-container")[complete ? "addClass" : "removeClass"]("complete");
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					controller.state = "complete";
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
		this.callback = callback;
		this.recordURL();
		orgId = Application.organization.id;
		this.backURL = '#organization/' + orgId + '/index'; // 设置后退默认链接

		keyword = Helper.param.search("keyword") || "";
		limit = +Helper.param.search("limit") || 10;
		title = decodeURIComponent(Helper.param.search("title"));

		// 存储标题
		if (title) {
			Helper.storePageTitle(orgId, "RelatedOrganizationEvents", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "RelatedOrganizationEvents") || "关联组织活动";
		Helper.setTitle(title);

		this.events = [];
		this.count = 0;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		var organization = Application.organization.info;
		// 微信分享用
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(title + " - " + organization.name, imgUrl, $(organization.description).text(), window.location.href);

		controller.state = "loading";

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));


		Application.organization.getRelatedOrganizationCount().done(function() {
			if (Application.organization.relatedOrganizationCount == 0) {
				$("#content").html(template('app/templates/public/empty', {
					message: "无关联组织"
				}));
				Helper.execute(callback);
				return;
			}
			RelatedOrganizationService.getEventCount(organization.id, keyword).done(function(data) {
				controller.count = data.result;
				if (controller.count == 0) {
					$("#content").html(template('app/templates/public/empty', {}));
					Helper.execute(callback);
					return;
				}

				// 加载首页活动列表
				$("#content").html(template("app/templates/relation/list-event", {
					organizationId: Application.organization.id
				}));
				$("#content").find(".btn-more").trigger("click");

				// 页面滑动到底部自动加载
				controller.scrollToBottom(function() {
					if (controller.state == "loading") return;
					if (controller.count > controller.events.length) {
						$(".btn-more").trigger("click");
					}
				});
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(callback);
			});
		}).fail(function(error) {
			Helper.alert(error);
			Helper.execute(callback);
		});
	};

	function makeEventsDate(events) {
		$.each(events, function(idx, item) {
			var time;
			var startTime = Helper.makedate(item.startDate, 'MM-dd');
			var endTime = Helper.makedate(item.endDate, 'MM-dd');
			if (startTime == endTime) {
				time = Helper.makedate(item.startDate, 'MM-dd hh:mm') + '--' + Helper.makedate(item.endDate, 'hh:mm');
			} else {
				time = Helper.makedate(item.startDate, 'MM-dd hh:mm') + '--' + Helper.makedate(item.endDate, 'MM-dd hh:mm');
			}
			events[idx].date = time;
		});
		return events;
	}


	module.exports = Controller;
});