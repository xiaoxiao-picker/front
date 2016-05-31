define(function(require, exports, module) {
	require('styles/proposal.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ProposalService = require("ProposalService");

	var orgId, proposalId;

	var Controller = function() {
		var _controller = this;
		this.namespace = "proposal.info";
		this.actions = {
			report: function() {
				var _btn = this;

				if (_btn.hasClass('actived')) {
					Helper.errorToast('已举报过，不能再次操作！');
					return;
				};
				require.async("lib.form.choice", function(ChoiceBox) {
					ChoiceBox({
						title: '举报理由',
						options: [{
							id: '恶意攻击',
							name: '恶意攻击',
							selected: true
						}, {
							id: '广告欺诈',
							name: '广告欺诈'
						}, {
							id: '淫秽色情',
							name: '淫秽色情'
						}, {
							id: '骚扰谩骂',
							name: '骚扰谩骂'
						}, {
							id: '反动政治',
							name: '反动政治'
						}, {
							id: '其他',
							name: '其他'
						}],
						success: function(values) {
							ProposalService.report(proposalId, values[0]).done(function(data) {
								Helper.successToast('举报成功，等待组织管理员审核！');
								_btn.addClass('actived');
								_btn.find('.report-text').text('已举报');
							}).fail(function(error) {
								Helper.errorToast(error);
							});
						}
					});
				});
			},
			praise: function() {
				var _btn = this;
				var praiseCount = +_btn.find('.praise-count').text();

				if (!_btn.hasClass("praising")) {
					_btn.addClass("praising");

					Helper.begin(_btn);
					var action = _btn.hasClass('actived') ? 'remove' : 'add';
					ProposalService.praise[action](proposalId).done(function(data) {
						_btn.find('.praise-count').text(_btn.hasClass('actived') ? --praiseCount : ++praiseCount);
						_btn.toggleClass('actived');
					}).fail(function(error) {
						Helper.errorToast(error);
					}).always(function() {
						Helper.end(_btn);
						_btn.removeClass("praising");
					});
				}
			},
			use: function() {
				var _btn = this;
				var type = _btn.attr('data-value');
				var count = +_btn.find('.count').text();

				if (_controller.proposal.used > 0) {
					Helper.errorToast('你已经操作过，不能再次点击！');
					return;
				};

				if (!_btn.hasClass("using")) {
					_btn.addClass("using");

					Helper.begin(_btn);
					var action = type == 'FUL' ? 'useful' : 'useless';
					ProposalService[action](proposalId).done(function(data) {
						_btn.find('.count').text(++count);
						_btn.addClass('actived');
						_controller.proposal.used = type == 'FUL' ? 1 : 2;
					}).fail(function(error) {
						Helper.errorToast(error);
					}).always(function() {
						Helper.end(_btn);
						_btn.removeClass("using");
					});
				}
			},
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.templateUrl = 'app/templates/proposal/info';
		this.recordURL();

		orgId = Application.organization.id;
		proposalId = Helper.param.hash("pid");
		status = Helper.param.search('status') || 'UNSOLVED';
		this.backURL = '#organization/' + orgId + '/proposals?status=' + status;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		ProposalService.get(proposalId).done(function(data) {
			controller.proposal = makeProposal(data.result, data.time);
			Helper.setTitle(controller.proposal.title);

			$("#header").html(template("app/templates/public/header", {
				title: controller.proposal.title || "详情",
				user: Application.user.info
			}));

			$("#content").html(template(controller.templateUrl, {
				orgId: orgId,
				proposal: controller.proposal
			}));

			if (controller.proposal.commentState == 'OPEN') {
				renderComments();
			}

			wechatShare(controller, controller.proposal);
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});

	};

	/**
	 *	评论
	 */
	function renderComments() {
		require.async("lib.commentBox", function(CommentBox) {
			var commentBox = CommentBox({
				container: $("#CommentsContainer"),
				sourceId: proposalId,
				sourceType: 'PROPOSAL',
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
	}

	function makeProposal(proposal, currentTime) {
		proposal.createTime = Helper.dateDiff(proposal.createDate, currentTime);
		return proposal;
	}

	// 微信分享
	function wechatShare(controller, proposal) {
		var shareTitle = proposal.title + " - " + Application.organization.info.name;
		var shareImage = proposal.thumbnailUrls ? proposal.thumbnailUrls[0] + "@300w_300h_1e_1c" : "";
		var shareDesc = proposal.text;
		var shareUrl = proposal.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	}

	// 查看图片
	function checkImage(controller) {
		if (window.wx) {
			$(".images-wrapper img").on("click." + controller.namespace, function() {
				var images = [];
				var image = this.src;
				$(document).find(".images-wrapper img").each(function(idx, item) {
					images.push(item.src);
				});
				wx.previewImage({
					current: image,
					urls: images
				});
			});
		} else {
			$(document).on("click." + controller.namespace, ".images-wrapper img", function() {
				var image = this.src;
				require.async("scripts/lib/ImageBox", function(ImageBox) {
					new ImageBox(image);
				});
			});
		}
	}

	module.exports = Controller;
});