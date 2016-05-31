define(function(require, exports, module) {
	require('styles/article.css');

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
		this.namespace = "related.organization.articles";
		this.actions = {
			loadMore: function() {
				var btn = this;
				if (controller.articles.length >= controller.count) {
					return;
				}
				var skip = controller.articles.length;
				Helper.begin(btn);
				RelatedOrganizationService.getArticleList(orgId, skip, limit, keyword).done(function(data) {
					var articles = data.result;
					controller.articles = controller.articles.concat(articles);
					var complete = controller.count <= controller.articles.length;
					$("#ArticlesContainer").append(template("app/templates/relation/option-article", {
						articles: articles,
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
			Helper.storePageTitle(orgId, "RelatedOrganizationArticles", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "RelatedOrganizationArticles") || "关联组织文章";
		Helper.setTitle(title);

		this.articles = [];
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
			RelatedOrganizationService.getArticleCount(organization.id, keyword).done(function(data) {
				controller.count = data.result;
				if (controller.count == 0) {
					$("#content").html(template('app/templates/public/empty', {}));
					Helper.execute(callback);
					return;
				}

				// 加载首页活动列表
				$("#content").html(template("app/templates/relation/list-article", {
					organizationId: Application.organization.id
				}));
				$("#content").find(".btn-more").trigger("click");

				// 页面滑动到底部自动加载
				controller.scrollToBottom(function() {
					if (controller.state == "loading") return;
					if (controller.count > controller.articles.length) {
						$("#content").find(".btn-more").trigger("click");
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

	module.exports = Controller;
});