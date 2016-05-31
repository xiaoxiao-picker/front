define(function(require, exports, module) {
	require('styles/vote.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var VoteService = require("VoteService");
	var PublicService = require("PublicService");
	var template = require('template');
	var Helper = require('helper');

	var orgId;
	var voteId, VoteInfo;
	var optionId, OptionInfo;

	var isAttention;
	var qrcode, token;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "vote.player";
		_controller.actions = {
			vote: function() {
				var btn = this;
				if (VoteInfo.permitAttentionComment && !isAttention) {
					askAttention();
					return;
				}

				if (VoteInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("投票需要绑定手机号码！", function() {
						vote();
					});
				} else {
					vote();
				}

				function vote() {
					Helper.begin(btn);
					var $TotalResult = $("#TotalResult");
					var totalResult = +$TotalResult.text();
					$TotalResult.text(totalResult + 1);
					VoteService.cast(voteId, optionId).done(function(data) {
						Helper.successToast("投票成功!");
					}).fail(function(error) {
						Helper.alert(error);
						$TotalResult.text(totalResult);
					}).always(function() {
						Helper.end(btn);
					});
				}
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
		voteId = Helper.param.hash("vid");
		optionId = Helper.param.hash("pid");

		// 设置后退默认链接
		this.backURL = '#organization/' + orgId + '/vote/' + voteId + '/info';

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		$("#header").html(template("app/templates/public/header", {
			title: '选手详情',
			user: Application.user.info
		}));

		// 获取投票信息
		var getVoteInfo = VoteService.get(voteId).done(function(data) {
			VoteInfo = data.result;
			if (data.time > VoteInfo.endDate) {
				VoteInfo.state = "OVER";
			} else if (data.time < VoteInfo.startDate) {
				VoteInfo.state = "NOTSTART";
			} else {
				VoteInfo.state = "UNDERWAY";
			}

			// 确保用户已绑定手机号
			if (VoteInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("投票需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: controller.render
						});
					});
				});
			}
		});
		// 获取投票选项信息
		var getOptionInfo = VoteService.option.get(optionId).done(function(data) {
			OptionInfo = data.result;
			controller.share(OptionInfo.name, OptionInfo.imgUrl + "@300w_300h_1e_1c", OptionInfo.description, OptionInfo.shareURL);

		});
		// 获取用户已投选项ID集合
		var getCastedOptionIds = VoteService.getCastedOptionIds(voteId);

		$.when(getVoteInfo, getOptionInfo, getCastedOptionIds).done(function(data1, data2, data3) {
			if (VoteInfo.compulsivelyInWechat && !Helper.browser.wx) {
				Helper.alert("请在微信中打开该投票页面！");
				$("#content").html("<p>该投票已被设置只能在微信浏览器中浏览！</p>");
				return;
			}
			VoteInfo.castedOptionIds = data3.result;
			VoteInfo.remainVote = VoteInfo.tickets - VoteInfo.castedOptionIds.length;

			$.each(VoteInfo.castedOptionIds, function(idx, opid) {
				if (OptionInfo.id == opid) {
					OptionInfo.checked = true;
					return false;
				};
			});

			$("#content").html(template("app/templates/vote/player", {
				option: OptionInfo,
				vote: VoteInfo,
				voteId: voteId,
				orgId: orgId
			}));

			// 如果允许评论，则渲染评论模块
			VoteInfo.permitComment && renderComments();

			// 如果需要关注微信公众号才能投票则验证用户是否关注
			if (VoteInfo.permitAttentionComment) {
				insureAttention();
			}
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	}

	// 渲染评论
	function renderComments() {
		require.async("lib.commentBox", function(CommentBox) {
			commentBox = CommentBox({
				container: $("#CommentsContainer"),
				sourceId: optionId,
				sourceType: 'VOTE_OPTION',
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

	// 如果需要关注才能投票
	// 确保用户已经关注组织公众号
	function insureAttention() {
		require.async("scripts/lib/checkAttention", function(checkAttention) {
			checkAttention("VOTE", voteId, function(data) {
				isAttention = data.result;
				if (!isAttention) {
					token = data.token;
					askAttention();
				}
			});
		});

	}

	function askAttention() {
		require.async("scripts/lib/askAttention", function(AskAttention) {
			AskAttention(Application.organization.wechat, token, "获取投票资格！");
		});
	}

	module.exports = Controller;
});