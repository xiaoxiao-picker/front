define(function(require, exports, module) {
	require('styles/user.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var FeedbackService = require("FeedbackService");

	var temp, orgId, limit;
	var title;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "user.feedback.list";
		_controller.actions = {
			loadMore: function() {
				var _btn = this;

				loadMore(_controller, _btn);
			},	
			reply: function() {
				require.async('lib.form', function(Form) {
				 	var textBox = new Form.TextBox({
				 		type: 'TEXTAREA',
				 		placeholder: '发表自己的意见',
				 		success: function() {
				 			var _btn = $(this);

				 			if (!textBox.value.length) {
				 				Helper.errorToast('意见内容不得为空！');
				 				return;
				 			};

				 			Helper.begin(_btn);
				 			FeedbackService.add(orgId, textBox.value).done(function(data) {
				 				_controller.feedbacks = [];
				 				_controller.render();
				 				textBox.destroy();
				 			}).fail(function(error) {
				 				Helper.errorAlert(error);
				 			}).always(function() {
				 				Helper.end(_btn);
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
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/user/feedback/list';
		orgId = Application.organization.id;
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/index';
		limit = +Helper.param.search('limit') || 10;

		if (title) {
			Helper.storePageTitle(orgId, "feedback", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "feedback") || "意见反馈";
		Helper.setTitle(title);

		this.feedbacks = [];
		this.count = 0;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		FeedbackService.count(orgId).done(function(data) {
			controller.count = data.result;
			$("#content").html(template(temp, {}));
			$('.btn-more').trigger('click');
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			scrollToBottom();
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {
		Helper.begin(btn);

		var skip = controller.feedbacks.length;
		FeedbackService.getList(orgId, skip, limit).done(function(data) {
			var feedbacks = data.result;
			controller.feedbacks = controller.feedbacks.concat(data.result);

			$("#Feedbacks").prepend(template('app/templates/user/feedback/list-inner', {
				feedbacks: makeFeedbacks(feedbacks),
				user: Application.user.info,
				organization: Application.organization.info
			}));
			var complete = controller.count > controller.feedbacks.length;
			$('.more-container')[complete ? 'removeClass' : 'addClass']('hide');

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.end(btn);
		});
	};

	function makeFeedbacks(feedbacks) {
		feedbacks.sort(function(a, b) {
			return a.createDate - b.createDate;
		});

		return feedbacks;
	};

	function scrollToBottom() {
		$(document.body).animate({
			scrollTop: $(document).height()
		}, 500);
	}

	module.exports = Controller;
});