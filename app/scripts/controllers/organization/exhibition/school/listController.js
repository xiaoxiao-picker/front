define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ExhibitionService = require("ExhibitionService");
	var CategorySelector = require('lib.categorySelector');
	var categorySelector;

	var temp, orgId, title, categoryId, limit;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "exhibition.list.school";
		_controller.actions = {
			selectCategory: function() {
				var categories = Application.organization.categories.clone();
				categories.splice(0, 0, {
					id: "ALL",
					name: "全部分类"
				});

				$(categories).each(function(idx, category) {
					category.selected = category.id == categoryId;
					category.url = "#organization/" + orgId + "/list/school&categoryId=" + category.id + "&title=" + title;

				});

				if (categorySelector && categorySelector.isActive) {
					categorySelector.close();
				} else {
					categorySelector = CategorySelector({
						categories: categories
					});
				}
			},
			loadMore: function() {
				var _btn = this;

				if (_controller.organizations.length > _controller.count) return;
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

		temp = 'app/templates/organization/exhibition/school/list';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search('limit') || 30;
		categoryId = Helper.param.search("categoryId") || "ALL";
		categorySelector = null;

		if (title) {
			Helper.storePageTitle(orgId, "organizationList", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "organizationList") || "组织风采";
		Helper.setTitle(title);

		this.organizations = [];
		this.count = 0;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		var organization = Application.organization.info;
		// 微信分享用
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(this.title, imgUrl, organization.name, window.location.href);

		controller.tab = {
			className: 'tab-2',
			menus: [{
				type: 'SCHOOL',
				hash: '#organization/' + orgId + '/list/school',
				icon: 'icon-friend',
				title: '本校'
			}, {
				type: 'COUNTRY',
				hash: '#organization/' + orgId + '/list/country',
				icon: 'icon-earth',
				title: '全国'
			}]
		};

		var getCount = ExhibitionService.count(orgId, categoryId).done(function(data) {
			controller.count = data.result;
		}).fail(function(errorMsg) {
			Helper.errorToast(errorMsg);
		});

		$.when(Application.organization.getCategoryList(), getCount).done(function() {
			var categories = Application.organization.categories.clone();
			organizationCategoryFilter(categories);
			var category = categories.objOfAttr("id", categoryId);

			if (!category) {
				categoryId = "ALL";
			}
			var name = category ? category.name : "全部分类";
			$("#header").html(template("app/templates/public/header", {
				title: '<a href="javascript:void(0)" data-xx-action="selectCategory"><span>' + name + '</span><span class="iconfont icon-arrow-drop-down"></span></a>',
				user: Application.user.info
			}));

			$("#content").html(template(temp, {
				currentTab: 'SCHOOL',
				tab: controller.tab
			}));

			if (!controller.count) {
				$(".school-organization-list-container").html(template('app/templates/public/empty', {}));
				return;
			}

			$(".btn-more").trigger("click");

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.organizations.length) {
					$(".btn-more").trigger("click");
				}
			});

		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {
		Helper.begin(btn);
		getOrganizations(controller, function(organizations) {
			$("#Organizations").append(template('app/templates/organization/exhibition/school/list-inner', {
				orgId: orgId,
				organizations: organizations
			}));
			var complete = controller.count <= controller.organizations.length;
			btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

			Helper.end(btn);
		});
	};

	function getOrganizations(controller, success) {
		controller.state = 'loading';

		var skip = controller.organizations.length;
		ExhibitionService.getList(orgId, categoryId, skip, limit).done(function(data) {
			var organizations = data.result;
			controller.organizations = controller.organizations.concat(organizations);
			success(organizations);
		}).fail(function(errorMsg) {
			Helper.errorToast(errorMsg);
		}).always(function() {
			controller.state = 'complete';
		});
	};

	// 分类过滤器
	function organizationCategoryFilter(categories) {
		template.helper("organizationCategoryFilter", function(categoryId) {
			var category = categories.objOfAttr("id", categoryId);
			return category ? category.name : "未分类";
		});
	}



	module.exports = Controller;
});