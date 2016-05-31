define(function(require, exports, module) {
	require('styles/article.css');

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var Helper = require('helper');

	var ArticleService = require('ArticleService');
	var OrganizationService = require("OrganizationService");
	var CategorySelector = require('lib.categorySelector');
	var categorySelector;

	var orgId, title;
	var categoryId, keyword, limit;

	var Controller = function() {
		var controller = this;
		this.namespace = "articles";
		this.actions = {
			selectCategory: function() {
				var categories = Application.organization.articleCategories.clone();
				categories.splice(0, 0, {
					id: "",
					name: "全部分类"
				});

				$(categories).each(function(idx, category) {
					category.selected = category.id == categoryId;
					category.url = "#organization/" + orgId + "/articles&categoryId=" + category.id + "&title=" + title;

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
				var btn = this;

				if (controller.articles.length > controller.count) return;

				Helper.begin(btn);
				controller.state = "loading";
				var skip = controller.articles.length;
				ArticleService.getList(orgId, skip, limit, keyword, categoryId).done(function(data) {
					var articles = data.result;
					controller.articles = controller.articles.concat(articles);

					var htmlContent = template("app/templates/article/list-inner", {
						organizationId: orgId,
						articles: articles
					});
					$("#ArticlesContainer").append(htmlContent);
					var complete = controller.count <= controller.articles.length;
					btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

					Helper.end(btn);

				}).fail(function(errorMsg) {
					Helper.errorToast(errorMsg);
				}).always(function() {
					controller.state = "complete";
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
 							ArticleService.getList(orgId, 0, 100, keyword, null).done(function(data) {
 								var articles = data.result;
 								$("#SearchResults").html($('<div class="search-articles-container"></div>'));
 								$(".search-articles-container").html(template('app/templates/article/list-inner', {
 									organizationId: orgId,
									articles: articles
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

	Controller.prototype.init = function(callback) {
		this.callback = callback;
		this.recordURL();

		orgId = Application.organization.id;
		this.backURL = "#organization/" + orgId + "index";
		categoryId = Helper.param.search("categoryId") || "";
		keyword = Helper.param.search("keyword");
		limit = +Helper.param.search("limit") || 10;
		title = decodeURIComponent(Helper.param.search("title"));
		categorySelector = null;

		//存标题
		if (title) {
			Helper.storePageTitle(orgId, "articles", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "articles") || "文章";
		Helper.setTitle(title);

		this.articles = [];
		this.count = 0;

		this.render();
	};


	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;

		var organization = Application.organization.info;
		//微信分享用
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(title + " - " + organization.name, imgUrl, $(organization.description).text(), window.location.href);

		// 获取文章数量
		var getArticleCount = ArticleService.count(orgId, keyword, categoryId).done(function(data) {
			controller.count = data.result;
		});

		$.when(Application.organization.getRelatedOrganizationCount(), Application.organization.getArticleCategoryList(), getArticleCount).done(function() {
			var categories = Application.organization.articleCategories.clone();
			articleCategoryFilter(categories);
			var category = categories.objOfAttr("id", categoryId);

			if (!category) {
				categoryId = "";
			}
			var name = category ? category.name : "全部分类";
			var html = template("app/templates/public/header", {
				title: '<a href="javascript:void(0)" data-xx-action="selectCategory"><span>' + name + '</span><span class="iconfont icon-arrow-drop-down"></span></a>',
				user: Application.user.info
			});
			$("#header").html(html);

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {}));
				return;
			}

			$("#content").html(template("app/templates/article/list", {
				organizationId: Application.organization.id,
				hasRelation: Application.organization.relatedOrganizationCount > 0
			}));
			$(".btn-more").trigger("click");

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.articles.length) {
					$(".btn-more").trigger("click");
				}
			});
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};



	// 文章分类过滤器
	function articleCategoryFilter(categories) {
		template.helper("articleCategoryFilter", function(categoryId) {
			var category = categories.objOfAttr("id", categoryId);
			return category ? category.name : "未分类";
		});
	}



	module.exports = Controller;
});