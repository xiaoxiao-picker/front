define(function(require, exports, module) {
	require('styles/article.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ArticleService = require('ArticleService');

	var orgId, articleId, ArticleInfo;

	var Controller = function() {
		this.namespace = "article";
	};
	bC.extend(Controller);

	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		orgId = Application.organization.id;
		articleId = Helper.param.hash("aid");
		this.backURL = '#organization/' + orgId + '/articles';

		ArticleInfo = {};

		this.render();
	}

	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;

		(function renderHeader() {
			$("#header").html(template("app/templates/public/header", {
				title: '文章详情',
				user: Application.user.info
			}));
		})();

		ArticleService.getArticle(articleId).done(function(data) {

			ArticleInfo = data.result;
			Helper.setTitle(ArticleInfo.name);

			$("#content").html(template('app/templates/article/info', {
				articleInfo: ArticleInfo
			}));

			if (ArticleInfo.commentState == 'OPEN') {
				renderComments();
			};
			wechatShare(controller, ArticleInfo);
			checkImage(controller);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});

	};

	/**
	 *	评论
	 */
	function renderComments() {
		var commentBox;
		require.async("lib.commentBox", function(CommentBox) {
			commentBox = CommentBox({
				container: $("#CommentsContainer"),
				sourceId: articleId,
				sourceType: 'ARTICLE',
				limit: 5,
				comment: function() {
					commentBox.innerRender();
				},
				remove: function() {
					commentBox.innerRender();
				}
			});
			commentBox.innerRender();
		});
	};

	// 微信分享
	function wechatShare(controller, articleInfo) {
		var shareTitle = articleInfo.name + " - " + Application.organization.info.name;
		var shareImage = articleInfo.thumbnailUrl ? articleInfo.thumbnailUrl + "@300w_300h_1e_1c" : "";
		var shareDesc = $(articleInfo.text).text();
		var shareUrl = articleInfo.shareUrl || window.location.href;
		// controller.share(shareTitle, shareImage, shareDesc, shareUrl);
		controller.share({
			title: shareTitle,
			imgUrl: shareImage,
			desc: shareDesc,
			link: shareUrl
		});
	}

	// 查看图片
	function checkImage(controller) {
		if (window.wx) {
			$(".article-content img").on("click." + controller.namespace, function() {
				var images = [];
				var image = this.src;
				$(document).find(".article-content img").each(function(idx, item) {
					images.push(item.src);
				});
				wx.previewImage({
					current: image,
					urls: images
				});
			});
		} else {
			$(document).on("click." + controller.namespace, ".article-content img", function() {
				var image = this.src;
				require.async("scripts/lib/ImageBox", function(ImageBox) {
					new ImageBox(image);
				});
			});
		}
	};

	module.exports = Controller;

});