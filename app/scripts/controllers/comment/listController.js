define(function(require, exports, module) {
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');

	var VoteService = require("VoteService");

	var CommentBox = require('lib.commentBox');
	var commentBox;

	var orgId, sourceType, sourceId;

	var Controller = function() {
		var controller = this;
		this.namespace = "comment.list";
		this.actions = {
			loadMore: function() {
				var btn = this;

				controller.state = "loading";

				Helper.begin(btn);
				commentBox.renderMore(function() {
					Helper.end(btn);
					var complete = commentBox.count <= commentBox.comments.length;
					btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');
					controller.state = "complete";
				});
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		var controller = this;
		this.recordURL();
		this.callback = callback;

		orgId = Application.organization.id;
		sourceType = Helper.param.hash('stype') || 'EVENT';
		sourceId = Helper.param.hash('sid');

		// 设置后退默认链接
		if (sourceType == 'ARTICLE') {
			this.backURL = '#organization/' + orgId + '/article/' + sourceId + '/info';
		} else if (sourceType == 'EVENT') {
			this.backURL = '#organization/' + orgId + '/event/' + sourceId + '/info';
		} else if (sourceType == "VOTE_OPTION") {
			VoteService.option.get(sourceId).done(function(data) {
				var voteId = data.result.id;
				controller.backURL = "#organization/" + orgId + "/vote/" + voteId + "/info";
			}).fail(function(error) {
				controller.backURL = "#organization/" + orgId + "/index";
			}).always(function() {

			});
		}

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: '全部评论',
			user: Application.user.info
		}));

		controller.state = "loading";

		commentBox = CommentBox({
			container: $("#content"),
			sourceId: sourceId,
			sourceType: sourceType,
			limit: 10,
			comment: function() {
				commentBox.render();
			},
			remove: function() {
				commentBox.render();
			},
			complete: function() {
				Helper.execute(controller.callback);
				controller.state = "complete";
			}
		});
		commentBox.render();

		// 页面滑动到底部自动加载
		controller.scrollToBottom(function() {
			if (controller.state == "loading") return;
			if (commentBox.count > commentBox.comments.length) {
				$(".btn-more").trigger("click");
			}
		});
	};



	Controller.prototype.destroy = function() {
		commentBox.destroy();
	};

	module.exports = Controller;
});