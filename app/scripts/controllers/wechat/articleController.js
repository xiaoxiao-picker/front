define(function(require, exports, module) {
	require('styles/wechat.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var WeChatService = require('WeChatService');

	var temp, articleId;

	var Controller = function() {
		this.namespace = "wechat.article";
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/wechat/article';
		orgId = Application.organization.id;
		articleId = Helper.param.hash("aid");
		this.backURL = '#organization/' + orgId + '/index';

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: '详情',
			user: Application.user.info
		}));

		WeChatService.getArticle(articleId).done(function(data) {
			var articleInfo = data.result;
			Helper.setTitle(articleInfo.title);

			$("#content").html(template(temp, {
				info: articleInfo
			}));

			controller.share(articleInfo.title, articleInfo.picUrl + "@300h_300w_1c_1e", $(articleInfo.description).text());
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});

	}

	module.exports = Controller;
});