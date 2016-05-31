define(function(require, exports, module) {
	require('styles/lost.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LostService = require("LostService");

	var orgId, limit, status;
	var title;

	var Controller = function() {
		var controller = this;
		this.namespace = "lost.list";
		this.actions = {
			loadMore: function() {
				var btn = this;

				if (controller.losts.length > controller.count) return;
				Helper.begin(btn);

				controller.state = 'loading';

				var skip = controller.losts.length;
				if (status != 'USER') {
					LostService.getList(orgId, skip, limit, status).done(function(data) {
						var losts = makeLosts(data.result);
						controller.losts = controller.losts.concat(losts);
						success(losts);
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						controller.state = 'complete';
						Helper.end(btn);
					});
				} else {
					LostService.user.getList(skip, limit).done(function(data) {
						var losts = makeLosts(data.result);
						controller.losts = controller.losts.concat(losts);
						success(losts);
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						controller.state = 'complete';
						Helper.end(btn);
					});
				}

				function success(losts) {
					$("#Losts").append(template('app/templates/lost/list-inner', {
						losts: losts,
						currentTab: status,
						orgId: orgId
					}));
					var complete = controller.count <= controller.losts.length;
					$(".more-container")[complete ? "addClass" : "removeClass"]("complete");
					Helper.end(btn);
				}
			},
			// 跳转编辑
			add: function() {
				if (status != 'USER') {
					Helper.jump('#organization/' + orgId + '/lost/edit?status=' + status);
				} else {
					openOptionsBox();
				}
			},
			search: function() {
				openSearchBox();
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function() {
		this.recordURL();
		this.templateUrl = "app/templates/lost/list";
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		status = Helper.param.search('status') || 'LOST';
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search("limit") || 10;

		// 存储标题
		if (title) {
			Helper.storePageTitle(orgId, "losts", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "losts") || "失物招领";

		title = {
			LOST: "失物招领",
			FIND: "寻物启事",
			USER: "我的"
		}[status];

		Helper.setTitle(title);

		this.losts = [];
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
		this.share(title, imgUrl, organization.name, window.location.href);

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		renderList(controller);
	};

	function renderList(controller) {

		if (status != 'USER') {
			LostService.count(orgId, status).done(function(data) {
				controller.count = data.result;
				renderInit();
			}).fail(function(error) {
				Helper.errorAlert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		} else {
			LostService.user.count().done(function(data) {
				controller.count = data.result;
				renderInit();
			}).fail(function(error) {
				Helper.errorAlert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		}

		function renderInit() {
			$("#content").html(template(controller.templateUrl, {
				title: title,
				orgId: orgId,
				currentTab: status
			}));

			if (!controller.count) {
				$(".lost-list-container").html(template('app/templates/public/empty', {}));
				return;
			}

			$(".btn-more").trigger("click");

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.losts.length) {
					$(".btn-more").trigger("click");
				}
			});
		};
	};


	function makeLosts(data) {
		var colors = ['green', 'blue', 'orange', 'red'];
		var losts = [];
		$.each(data, function(idx, lost) {
			lost.contactInfo = $.parseJSON(lost.contactInfo);
			lost.picUrls = lost.picUrls && lost.picUrls.split(',') || [];
			lost.color = colors[idx % 4];

			losts.push(lost);
		});

		return losts;
	};



	function openSearchBox() {
		require.async('lib.searchBox', function(SearchBox) {
			SearchBox('', {
				search: function(btn) {

					if (!this.value || Helper.validation.isEmpty(this.value)) {
						Helper.errorToast('请输入搜索关键词');
						return;
					}

					Helper.begin(btn);
					LostService.getList(orgId, 0, 100, '', this.value).done(function(data) {
						var losts = makeLosts(data.result);
						$("#SearchResults").html(template('app/templates/lost/results-inner', {
							orgId: orgId,
							losts: losts
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

	function openOptionsBox() {
		var modal = Helper.modal({
			theme: 'black'
		});
		modal.html(template('app/templates/lost/options-box', {
			orgId: orgId
		}));
	}

	module.exports = Controller;
});