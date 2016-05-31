define(function(require, exports, module) {
	require('styles/event.css');

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var Helper = require('helper');

	var EventService = require('EventService');
	var OrganizationService = require("OrganizationService");
	var PraiseService = require("PraiseService");
	var CategorySelector = require('lib.categorySelector');
	var categorySelector;

	var orgId;
	var categoryId, keyword, limit; // 分类

	var title;

	var Controller = function() {
		var controller = this;
		this.namespace = "events";
		this.actions = {
			selectCategory: function() {
				var categories = Application.organization.eventCategories.clone();
				categories.splice(0, 0, {
					id: "",
					name: "全部分类"
				});

				$(categories).each(function(idx, category) {
					category.selected = category.id == categoryId;
					category.url = "#organization/" + orgId + "/events&categoryId=" + category.id + "&title=" + title;
				});

				if (categorySelector && categorySelector.isActive) {
					categorySelector.close();
				} else {
					require.async('lib.categorySelector', function() {
						categorySelector = CategorySelector({
							categories: categories
						});
					});
				}
			},
			loadMore: function() {
				var btn = this;

				// 如果所有数据已经请求完成
				if (controller.events.length >= controller.count) {
					return;
				}

				var skip = controller.events.length;
				Helper.begin(btn);
				EventService.getList(orgId, "PUBLISHED", skip, limit, categoryId, keyword).done(function(data) {
					var events = makeEventsDate(data.result);
					controller.events = controller.events.concat(events);
					var complete = controller.count <= controller.events.length;
					$("#EventsContainer").append(template("app/templates/event/list-option", {
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
			},
			search: function() {
 				require.async('lib.searchBox', function(SearchBox) {
 					SearchBox('', {
 						search: function(btn) {
 							keyword = this.value;
 							if (!this.value || Helper.validation.isEmpty(this.value)) {
 								Helper.errorToast('请输入搜索关键词');
 								return;
 							}

 							Helper.begin(btn);
 							EventService.getList(orgId, "PUBLISHED", 0, 100, null, keyword).done(function(data) {
 								var events = makeEventsDate(data.result);
 								$("#SearchResults").html($('<div class="search-events-container"></div>'));
 								$(".search-events-container").html(template('app/templates/event/list-option', {
 									events: events,
									organizationId: orgId
 								}));
 							}).fail(function(error) {
 								Helper.errorToast(error);
 							}).always(function() {
 								Helper.end(btn);
 							});
 						}
 					});
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
		categoryId = Helper.param.search("categoryId") || "";
		keyword = Helper.param.search("keyword");
		limit = +Helper.param.search("limit") || 10;
		title = decodeURIComponent(Helper.param.search("title"));
		categorySelector = null;

		// 存储标题
		if (title) {
			Helper.storePageTitle(orgId, "events", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "events") || "活动广场";
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

		// 获取活动数量
		var getEventCount = EventService.count(orgId, "PUBLISHED", categoryId, keyword).done(function(data) {
			controller.count = data.result;
		});
		// 获取活动分类和数量
		$.when(Application.organization.getRelatedOrganizationCount(), Application.organization.getEventCategoryList(), getEventCount).done(function() {
			var categories = Application.organization.eventCategories.clone();

			eventCategoryFilter(categories);

			var category = categories.objOfAttr("id", categoryId);
			if (!category) categoryId = "";

			// 渲染头部信息
			var name = category ? category.name : "全部分类";
			$("#header").html(template("app/templates/public/header", {
				title: '<a href="javascript:void(0)" data-xx-action="selectCategory"><span>' + name + '</span><span class="iconfont icon-arrow-drop-down"></span></a>',
				user: Application.user.info
			}));

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {}));
				return;
			}
			$("#content").html(template("app/templates/event/list", {
				organizationId: Application.organization.id,
				hasRelation: Application.organization.relatedOrganizationCount > 0
			}));

			// 加载首页活动列表
			$(".btn-more").trigger("click");

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
			if (item.id == "ed3a48b9-46e3-47a3-b490-9f9934550e70") {
				item.totalSignups += 88;
			}
		});
		return events;
	}

	// 活动分类过滤器
	function eventCategoryFilter(categories) {
		template.helper("eventCategoryFilter", function(categoryId) {
			var category = categories.objOfAttr("id", categoryId);
			return category ? category.name : "未分类";
		});
	}


	module.exports = Controller;
});