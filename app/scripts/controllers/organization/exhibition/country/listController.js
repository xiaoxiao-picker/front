define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ExhibitionService = require("ExhibitionService");

	var CitySelector = require('lib.citySelector');
	var citySelector;

	var temp, orgId, title, limit, city;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "exhibition.list.country";
		_controller.actions = {
			selectCountry: function() {
				var url = '#organization/' + orgId + '/list/country';

				if (citySelector && citySelector.isActive) {
					citySelector.close();
				} else {
					citySelector = CitySelector(url, city, {});
				}
			},
			loadMore: function() {
				var _btn = this;

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

		temp = 'app/templates/organization/exhibition/country/list';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		city = decodeURIComponent(Helper.param.search('city') || '上海');
		limit = +Helper.param.search('limit') || 10;

		if (title) {
			Helper.storePageTitle(orgId, "organizationList", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "organizationList") || "组织风采";
		Helper.setTitle(title);

		this.schools = [];
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

		$("#header").html(template("app/templates/public/header", {
			title: '<a href="javascript:void(0)" data-xx-action="selectCountry"><span>' + city + '</span><span class="iconfont icon-arrow-drop-down"></span></a>',
			user: Application.user.info
		}));

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

		ExhibitionService.school.count(city).done(function(data) {
			controller.count = data.result;
			$("#content").html(template(temp, {
				orgId: orgId,
				currentTab: 'COUNTRY',
				tab: controller.tab,
			}));

			if (!controller.count) {
				$(".country-organization-list-container").html(template('app/templates/public/empty', {}));
				return;
			}

			$(".btn-more").trigger("click");


			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.schools.length) {
					$(".btn-more").trigger("click");
				}
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {
		Helper.begin(btn);
		getSchools(controller, function(schools) {
			$("#Schools").append(template('app/templates/organization/exhibition/country/list-inner', {
				orgId: orgId,
				schools: schools
			}));
			var complete = controller.count <= controller.schools.length;
			btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

			Helper.end(btn);
		});
	};

	function getSchools(controller, success, error) {
		controller.state = 'loading';

		var skip = controller.schools.length;
		ExhibitionService.school.getList(city, skip, limit).done(function(data) {
			var schools = data.result;
			controller.schools = controller.schools.concat(schools);
			success(schools);
		}).fail(function(errorMsg) {
			Helper.errorToast(errorMsg);
		}).always(function() {
			controller.state = 'complete';
		});
	};


	module.exports = Controller;
});