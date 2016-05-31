define(function(require, exports, module) {
	require('styles/vote.css');
	require("plugins/masonry/get-style-property");
	require("plugins/masonry/masonry.pkgd");
	require("plugins/masonry/imagesloaded.pkgd");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');

	var VoteService = require('VoteService');
	var PublicService = require("PublicService");
	var RelationService = require("RelationService");

	var orgId;
	var voteId, VoteInfo, RenderType;
	var keyword;
	var OptionsLoadState;

	var isAttention;
	var qrcode, token;

	var RenderedOptions;
	var RankOptions;

	// 服务器与客户端时间差值
	var ServerClientTimeDifference;

	var Controller = function() {
		var controller = this;
		controller.namespace = "vote.info.ugc";
		controller.actions = {
			search: function() {
				require.async("scripts/lib/SearchBox", function(SearchBox) {
					SearchBox(keyword, {
						destroy: function() {
							var scrollTop = $(".vote-options").offset().top - 80;
							$(document).scrollTop(scrollTop);
						},
						search: function(btn) {
							var searchbox = this;
							keyword = searchbox.value || "";

							VoteService.option.getIds(voteId, keyword).done(function(data) {
								var optionIds = data.result;
								if (optionIds.length == 0) {
									Helper.errorToast("查无此选项！");
									keyword = "";
									return;
								}
								VoteInfo.optionIds = optionIds;
								RenderedOptions = [];
								RankOptions = [];
								$("#VoteOptionsContainer").html("").removeData("masonry");
								if (RenderType == "RANK") {
									renderStatistics();
								} else {
									renderVoteOptions();
								}

								searchbox.destroy();
							}).fail(function(error) {
								Helper.alert(error);
							});
						}
					});
				});
			},
			loadMore: loadNextPageOptions,
			switchTab: function() {
				var btn = this;
				RenderType = btn.attr('data-value');

				btn.addClass('active').siblings().removeClass('active');

				$('#VoteOptionsContainer')[RenderType == 'RANK' ? 'addClass' : 'removeClass']('hide');
				$('#RankingsContainer')[RenderType == 'RANK' ? 'removeClass' : 'addClass']('hide');
				if (RenderType == 'RANK') {
					!RankOptions.length && renderStatistics();
				} else {
					!RenderedOptions.length && renderVoteOptions();
				}
			},
			singleVote: function() {
				var _btn = this;
				var optionId = _btn.attr('data-value');
				var option = RenderedOptions.objOfAttr("optionId", optionId);

				if (!option) return Helper.alert("页面内部错误，请联系管理员！");

				var isOptionModal = _btn.attr("data-option-modal") == "true";

				// 检查并投票
				if (VoteInfo.state == "NOTSTART") {
					Helper.alert("投票尚未开始！");
					return;
				} else if (VoteInfo.state == "OVER") {
					Helper.alert("投票已结束！");
					return;
				}
				// 确保已关注
				if (VoteInfo.permitAttentionComment && !isAttention) {
					askAttention();
					return;
				}

				if (VoteInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("投票需要绑定手机号码！", function() {
						sigleVote();
					});
				} else {
					sigleVote();
				}

				function sigleVote() {
					var $number = $(".option-container[data-value='" + optionId + "']").find('.number');
					$number.text(option.totalVotes + 1);

					// 如果是单个选项弹窗点击投票，则弹窗中的票数需要增加
					if (isOptionModal) {
						var $optionModalTotalResult = $("#TotalResult");
						$optionModalTotalResult.text(option.totalVotes + 1);
					}

					Helper.begin(_btn);
					VoteService.cast(voteId, optionId).done(function(data) {
						Helper.successToast("投票成功");
						Helper.end(_btn);
						option.totalVotes++;
						VoteInfo.castedOptionIds.push(optionId);

						var $voteButton = $("#VoteOptionsContainer .btn-vote[data-value='" + optionId + "']");
						$voteButton.prop("disabled", "disabled").find('.inside-text').html('<span class="iconfont icon-favorite-fill"></span> 已赞');

						if (isOptionModal) {
							_btn.addClass('disabled').attr("data-xx-action", "close").find('.inside-text').html('<span class="iconfont icon-favorite-fill"></span> 已赞');
						}

					}).fail(function(error) {
						Helper.alert(error);
						var $number = $('.' + optionId).parents('.option-box').find('.number');;
						var number = +$number.text();
						$number.text(number - 1);
						Helper.end(_btn);
					});
				}

			},
			checkOption: function() {
				var optionId = $(this).attr("data-option-id");

				require.async("scripts/controllers/vote/option", function(OptionBox) {
					OptionBox(optionId, {
						voteInfo: VoteInfo
					});
				});
			},
			// 抽奖
			drawLottery: function() {
				var btn = this;
				var lotteryId = btn.attr("data-value");

				Helper.jump('#organization/' + orgId + '/lottery/' + lotteryId + '/draw');
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
		voteId = Helper.param.hash("vid") || "";
		keyword = "";
		this.backURL = '#organization/' + orgId + '/votes';

		RenderType = 'OPTIONS';
		RenderedOptions = [];
		RankOptions = [];

		this.render();
	};


	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;

		$("#header").html(template("app/templates/public/header", {
			title: '',
			user: Application.user.info
		}));



		// 获取投票信息
		var getVoteInfo = VoteService.get(voteId).done(function(data) {
			VoteInfo = data.result;

			controller.share(VoteInfo.name, VoteInfo.thumbnailUrl + "@300w_300h_1e_1c", VoteInfo.terse, VoteInfo.shareURL);
			ServerClientTimeDifference = data.time - new Date().getTime();
			// 设置标题
			Helper.setTitle(VoteInfo.name);
			if (data.time > VoteInfo.endDate) {
				VoteInfo.state = "OVER";
			} else if (data.time < VoteInfo.startDate) {
				VoteInfo.state = "NOTSTART";
			} else {
				VoteInfo.state = "UNDERWAY";
			}
		});

		// 获取用户报名状态
		var getSignUpState = VoteService.signup.getState(voteId);
		// 获取用户已投选项ID集合
		var getCastedOptionIds = VoteService.getCastedOptionIds(voteId);
		// 获取投票选项id集合
		var getVoteOptionIds = VoteService.option.getIds(voteId);

		$.when(getVoteInfo, getSignUpState, getCastedOptionIds, getVoteOptionIds).done(function(data1, data2, data3, data4) {
			VoteInfo.signUpState = data2.result;
			VoteInfo.optionIds = data4.result;

			if (VoteInfo.compulsivelyInWechat && !Helper.browser.wx) {
				Helper.alert("请在微信中打开该投票页面！");
				$("#content").html("<p style='margin-top:100px;text-align:center;'>该投票已被设置只能在微信浏览器中浏览！</p>");
				return;
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

			VoteInfo.castedOptionIds = data3.result;


			$("#content").html(template('app/templates/vote/ugc/info', {
				vote: VoteInfo,
				orgId: orgId
			}));

			// 投票倒计时
			renderJcountdown();
			//抽奖
			VoteInfo.numberOfLotteries && renderLotteries();

			renderVoteOptions();

			controller.scrollToTop();
			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				loadNextPageOptions();
			});
			// 如果需要关注微信公众号才能投票则验证用户是否关注
			if (VoteInfo.permitAttentionComment) {
				insureAttention();
			}

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	// 倒计时
	function renderJcountdown() {
		var $header = $("#VoteInfo .vote-header>h2");
		// 已结束
		if (VoteInfo.state == "OVER") {
			$header.html("投票已结束");
		}
		// 未开始
		else if (VoteInfo.state == "NOTSTART") {
			$header.html("投票开始倒计时");
		}
		// 进行中
		else {
			(function() {
				var callee = arguments.callee;
				currentTime = ServerClientTimeDifference + new Date().getTime();
				if (VoteInfo.endDate < currentTime) {
					$header.html("投票已结束");
					return;
				}

				distance = Helper.distance(currentTime, VoteInfo.endDate);
				$header.html(distance.local + "后结束");
				setTimeout(callee, 1000);
			})();
		}
	};

	function renderVoteOptions(limit) {
		if (VoteInfo.totalOptions == 0) {
			$("#VoteInfo .more-container").addClass("complete").find(".no-more").text("暂未添加选项");
			return;
		}

		limit = limit || 10;
		var skip = RenderedOptions.length;

		var templateName = "app/templates/vote/ugc/options";
		var container = $("#VoteOptionsContainer");

		OptionsLoadState = 'loading';
		VoteService.option.getListByUGC(voteId, {
			skip: skip,
			limit: limit,
			orderBy: 'createDate',
			keyword: keyword
		}).done(function(data) {
			var options = makeVoteOptions(data.result.options);
			RenderedOptions = RenderedOptions.concat(options);
			var html = $(template(templateName, {
				options: options,
				vote: VoteInfo
			}));
			container.append(html);
			$(".more-container")[RenderedOptions.length >= VoteInfo.optionIds.length ? "addClass" : "removeClass"]("complete");
			if (!container.data("masonry")) {
				container.imagesLoaded(function() {
					container.masonry({
						itemSelector: '.option-container',
						isAnimated: true,
						gutterWidth: 0
					});
				});
			} else {
				container.imagesLoaded(function() {
					container.masonry("appended", html, true);
				});
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			OptionsLoadState = 'complete';
		});
	}

	function makeVoteOptions(options) {
		$.each(options, function(idx, option) {
			$.each(VoteInfo.castedOptionIds, function(c_idx, castedOptionId) {
				if (option.optionId == castedOptionId) {
					option.casted = true;
				};
			});
		});

		return options;
	}

	function renderStatistics(limit) {
		if (VoteInfo.totalOptions == 0) {
			$("#VoteInfo .more-container").addClass("complete").find(".no-more").text("暂未添加选项");
			return;
		}

		limit = limit || 10;
		var skip = RankOptions.length;
		var container = $('#RankingsContainer');

		OptionsLoadState = 'loading';
		VoteService.option.getListByUGC(voteId, {
			skip: skip,
			limit: limit,
			keyword: keyword
		}).done(function(data) {
			var options = data.result.options;
			RankOptions = RankOptions.concat(options);
			var html = template('app/templates/vote/ugc/rankings', {
				options: options,
				skip: skip
			});
			container.append(html);
			$(".more-container")[RankOptions.length >= VoteInfo.optionIds.length ? "addClass" : "removeClass"]("complete");
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			OptionsLoadState = 'complete';
		});
	};

	function loadNextPageOptions() {
		if (RenderType == 'RANK') {
			if (OptionsLoadState != 'loading' && VoteInfo.optionIds.length > RankOptions.length) {
				renderStatistics();
			}
		} else {
			if (OptionsLoadState != 'loading' && VoteInfo.optionIds.length > RenderedOptions.length) {
				renderVoteOptions();
			}
		}
	}


	// 渲染绑定抽奖
	function renderLotteries() {
		RelationService.getList('VOTE', voteId, 'LOTTERY').done(function(data) {
			VoteInfo.lotteries = makeVoteLotteries(data.result);
			$("#LOTTERY").html(template('app/templates/vote/info/lottery', {
				lotteries: VoteInfo.lotteries
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	function makeVoteLotteries(lotteries) {
		$(lotteries).each(function(idx, lottery) {
			lottery.timeState = validateOptionState([{
				startDate: lottery.startDate,
				endDate: lottery.endDate
			}], 'LOTTERY');
		});

		return lotteries;
	}

	/**
	 *	检测[抽奖]当前状态
	 *	状态值：即将开始／正在进行／已结束／名额已满
	 */
	function validateOptionState(times) {
		var currentServerTime = ServerClientTimeDifference + new Date().getTime();
		var upComingCount = 0;
		var onGoingCount = 0;
		var endCount = 0;

		$(times).each(function(idx, time) {
			var state;
			if (currentServerTime < time.startDate) {
				state = 'UPCOMING';
				upComingCount++;
			} else if (time.startDate <= currentServerTime && time.endDate >= currentServerTime) {
				state = 'ONGOING';
				onGoingCount++;
			} else {
				state = 'END';
				endCount++;
			}
			time.state = state;
		});

		if (onGoingCount) {
			return {
				color: 'red',
				title: '正在进行',
				state: 'ONGOING'
			};
		} else if (upComingCount) {
			return {
				color: 'green',
				title: '即将开始',
				state: 'UPCOMING'
			};
		} else {
			return {
				color: 'gray',
				title: '已结束',
				state: 'END'
			};
		}
	}

	// 如果需要关注才能投票
	// 确保用户已经关注组织公众号
	function insureAttention() {
		var organization = Application.organization;
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