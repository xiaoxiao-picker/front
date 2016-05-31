define(function(require, exports, module) {
	require('styles/vote.css');
	require("plugins/masonry/get-style-property");
	require("plugins/masonry/masonry.pkgd");
	require("plugins/masonry/imagesloaded.pkgd");

	var baseController = require('baseController');
	var bC = new baseController();

	var VoteService = require('VoteService');
	var PublicService = require("PublicService");
	var RelationService = require("RelationService");

	var template = require('template');

	var Helper = require('helper');

	var orgId;
	var voteId, VoteInfo;
	var keyword;

	var isAttention;
	var qrcode, token;

	var RenderedOptions;

	// 服务器与客户端时间差值
	var ServerClientTimeDifference;

	var OptionsLoadState;

	// 投票计时轮询
	var TimeLoop;

	var Controller = function() {
		var controller = this;
		controller.namespace = "vote.info";
		controller.destroy = function() {
			clearTimeout(TimeLoop);
		};
		controller.actions = {
			loadMore: loadNextPageOptions,
			search: function() {
				require.async("scripts/lib/SearchBox", function(SearchBox) {
					SearchBox(keyword, {
						destroy: function() {
							var scrollTop = $(".vote-options>.inner-title").offset().top - 80;
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
								VoteInfo.optionIds = sortVoteOptionIds(VoteInfo.sortType, optionIds);
								VoteInfo.unloadOptionIds = optionIds;
								RenderedOptions = [];
								$("#VoteOptionsContainer").html("").removeData("masonry");
								insertVoteOptions(10);
								searchbox.destroy();
							}).fail(function(error) {
								Helper.alert(error);
							});
						}
					});
				});
			},
			// 无剩余票数提示
			outOfRemainVote: function() {
				Helper.alert("今日票数已用完，明天再来试试？");
			},
			// 投票未开始提示
			beforeVoteDate: function() {
				Helper.alert("投票尚未开始！");
			},
			// 修改投票选项
			modifyOptions: function() {
				var _input = this;
				var CheckedOptionBoxes = $("input:checkbox[name=vote_option]:checked");
				if (VoteInfo.remainVote == 0) {
					Helper.errorToast('当前无剩余票数！');
					$(_input).attr("checked", false);
				} else if (CheckedOptionBoxes.length > VoteInfo.remainVote) {
					Helper.errorToast('最多只能选择' + VoteInfo.remainVote + '项进行投票！');
					$(_input).attr("checked", false);
				} else {
					renderFooter();
				}
			},
			// 单个投票
			singleVote: function() {
				var _btn = this;
				var optionId = _btn.attr('data-value');
				var option = RenderedOptions.objOfAttr("id", optionId);

				if (!option) return Helper.alert("页面内部错误，请联系管理员！");

				var isOptionModal = _btn.attr("data-option-modal") == "true";

				// 检查并投票
				if (VoteInfo.state == "NOTSTART") {
					return Helper.alert("投票尚未开始！");
				} else if (VoteInfo.state == "OVER") {
					return Helper.alert("投票已结束！");
				}
				// 确保有剩余票
				if (VoteInfo.remainVote <= 0) {
					return Helper.alert("无剩余票数！");
				}

				(function sigleVote() {
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
						VoteInfo.remainVote--;
						VoteInfo.castedOptionIds.push(optionId);

						if (!VoteInfo.repeatable) {
							var $voteButton = $("#VoteOptionsContainer .btn-vote[data-value='" + optionId + "']");
							$voteButton.addClass('disabled').prop("disabled", "disabled").find('.inside-text').html('<span class="iconfont icon-favorite"></span> 已支持');

							if (isOptionModal) {
								_btn.addClass('disabled').attr("data-xx-action", "close");
							}
						}

						// 如果无剩余投票数，则禁用投票按钮
						if (VoteInfo.remainVote <= 0) {
							$("#VoteOptionsContainer .btn-vote").prop("disabled", "disabled").addClass("disabled");

							if (isOptionModal) {
								_btn.addClass('disabled').attr("data-xx-action", "close").find(".inside-text").html("无剩余票数");
							}
						}

						renderFooter();
					}).fail(function(error) {
						Helper.alert(error);
						$number.text(option.totalVotes);
						if (isOptionModal) {
							$optionModalTotalResult.text(option.totalVotes);
						}
						Helper.end(_btn);
					});
				})();

			},
			// 批量投票
			mulVote: function() {
				var btn = this;

				var CheckedOptionBoxes = $("input:checkbox[name=vote_option]:checked");

				if (VoteInfo.compulsory) {
					if (CheckedOptionBoxes.length != VoteInfo.remainVote) {
						Helper.errorToast('必须选择' + VoteInfo.remainVote + '项才可进行投票！');
						return;
					}
				} else {
					if (CheckedOptionBoxes.length == 0) {
						Helper.errorToast("请至少选择一个选项进行投票！");
						return;
					}
				}

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

				(function mulVote() {
					var $checkedOptions = $("input:checkbox[name=vote_option]:checked");
					var checkedOptionIds = [];


					// 投票请求发送之前先将票数+1
					$($checkedOptions).each(function(idx, item) {
						var optionId = $(item).val();
						var option = RenderedOptions.objOfAttr("id", optionId);
						if (!option) return true;

						var $number = $(item).parents(".option-container").find(".number");
						$number.text(++option.totalVotes);
						checkedOptionIds.push(optionId);
					});

					Helper.begin(btn);
					VoteService.cast(voteId, checkedOptionIds.join(',')).done(function(data) {
						Helper.successToast("投票成功");
						// 投票成功减少相对应剩余票数
						VoteInfo.remainVote -= checkedOptionIds.length;
						VoteInfo.castedOptionIds = VoteInfo.castedOptionIds.concat(checkedOptionIds);
						$checkedOptions.removeAttr("checked");
						renderFooter();
					}).fail(function(error) {
						Helper.alert(error);
						// 投票失败票数-1
						$($checkedOptions).each(function(idx, item) {
							var $number = $(item).parents(".option-container").find(".number");
							var optionId = $(item).val();
							var option = RenderedOptions.objOfAttr("id", optionId);
							$number.text(--option.totalVotes);
						});
					}).always(function() {
						Helper.end(btn);
					});
				})();
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

	Controller.prototype.init = function() {
		var controller = this;
		this.recordURL();

		orgId = Application.organization.id;
		voteId = Helper.param.hash("vid") || "";
		keyword = "";
		this.backURL = '#organization/' + orgId + '/votes';

		RenderedOptions = [];

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

			if (VoteInfo.type == 'UGC') {
				return Helper.jump('#organization/' + orgId + '/vote/' + voteId + '/info/ugc');
			}

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

			VoteInfo.rules = [];
			if (VoteInfo.cycle) {
				VoteInfo.rules.push("每人每" + (VoteInfo.cycle > 1 ? VoteInfo.cycle : "") + "天能投" + VoteInfo.tickets + "票。");
			} else {
				VoteInfo.rules.push("每人能投" + VoteInfo.tickets + "票。")
			}

			VoteInfo.rules.push((VoteInfo.repeatable ? "可" : "不可") + "对同一选项重复投票。");
			VoteInfo.compulsory && VoteInfo.rules.push("每次投票需一次性投完所有票。");
		});
		// 获取投票选项ID集合
		var getVoteOptionIds = VoteService.option.getIds(voteId);
		// 获取用户已投选项ID集合
		var getCastedOptionIds = VoteService.getCastedOptionIds(voteId);

		$.when(getVoteInfo, getVoteOptionIds, getCastedOptionIds).done(function(data1, data2, data3) {
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
			VoteInfo.optionIds = sortVoteOptionIds(VoteInfo.sortType, data2.result);
			VoteInfo.unloadOptionIds = VoteInfo.optionIds.clone();
			VoteInfo.castedOptionIds = data3.result;
			VoteInfo.remainVote = VoteInfo.tickets - VoteInfo.castedOptionIds.length;

			// 有时候意外情况下剩余票数为负数（比如：中途修改了投票规则）
			if (VoteInfo.remainVote < 0) VoteInfo.remainVote = 0;

			$("#content").html(template('app/templates/vote/info', {
				vote: VoteInfo,
				orgId: orgId
			}));
			// 投票倒计时
			renderJcountdown();
			renderFooter();

			//抽奖
			VoteInfo.numberOfLotteries && renderLotteries();

			// 如果有投票选项集合才加载第一列
			if (VoteInfo.unloadOptionIds.length == 0) {
				$("#VoteInfo .more-container").addClass("complete").find(".no-more").text("暂未添加选项");
			} else {
				insertVoteOptions(10);
			}

			controller.scrollToTop();
			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (OptionsLoadState == "complete" && VoteInfo.unloadOptionIds.length) {
					loadNextPageOptions();
				}
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

	// 渲染底部按钮
	function renderFooter() {
		if (VoteInfo.remainVote < 0) VoteInfo.remainVote = 0;
		if (VoteInfo.state == "NOTSTART") {
			$("#BtnVoteNotStart").removeClass("hide").siblings(".footer-footer").addClass("hide");
			return;
		} else if (VoteInfo.state == "OVER") {
			$("#BtnVoteOver").removeClass("hide").siblings(".footer-footer").addClass("hide");
			return;
		} else if (VoteInfo.remainVote == 0) {
			$("#BtnRemainVote").removeClass("hide").siblings(".footer-footer").addClass("hide");
			return;
		} else {
			if (VoteInfo.compulsory) {
				var $checkedOptions = $("input:checkbox[name=vote_option]:checked");
				$("#BtnMulVoteBox").removeClass("hide").siblings(".footer-footer").addClass("hide");
				$("#BtnMulVoteBox .count").html($checkedOptions.length + "/" + VoteInfo.remainVote + "已选择");
			} else {
				$("#BtnSingleVoteBox").removeClass("hide").siblings(".footer-footer").addClass("hide");
				$("#BtnSingleVoteBox .count").html(VoteInfo.remainVote + "/" + VoteInfo.tickets + "可投票");
			}
		}
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
			startCountDown();
		}
		// 进行中
		else {
			endCountDown();
		}


		function startCountDown() {
			var callee = arguments.callee;
			var currentTime = ServerClientTimeDifference + new Date().getTime();
			if (VoteInfo.startDate <= currentTime) {
				VoteInfo.state = "UNDERWAY";
				endCountDown();
				renderFooter();
				return;
			}

			distance = Helper.distance(currentTime, VoteInfo.startDate);
			$header.html(distance.local + "后开始");
			TimeLoop = setTimeout(callee, 1000);
		}

		function endCountDown() {
			var callee = arguments.callee;
			var currentTime = ServerClientTimeDifference + new Date().getTime();
			if (VoteInfo.endDate < currentTime) {
				$header.html("投票已结束");
				VoteInfo.state = "OVER";
				return;
			}

			distance = Helper.distance(currentTime, VoteInfo.endDate);
			$header.html(distance.local + "后结束");
			TimeLoop = setTimeout(callee, 1000);
		}
	};

	// 渲染投票选项
	function insertVoteOptions(limit) {
		limit = limit || 10;
		var templateName = "app/templates/vote/info/" + (VoteInfo.compulsory ? "mul-option-list" : "single-option-list");
		var container = $("#VoteOptionsContainer");
		// 从剩余选项中取出ID集合，但仍保留，当加载完成后删除掉
		var optionIds = VoteInfo.unloadOptionIds.slice(0, limit);

		OptionsLoadState = "pending";
		VoteService.option.getListByIds(optionIds.join(','), VoteInfo.hideVotes).done(function(data) {
			VoteInfo.unloadOptionIds.splice(0, limit);
			if (VoteInfo.unloadOptionIds.length == 0) {
				$("#VoteInfo .btn-more").hide();
			}
			var options = data.result;

			RenderedOptions = RenderedOptions.concat(options);

			if (!VoteInfo.compulsory) {
				$.each(options, function(idx, option) {
					option.casted = VoteInfo.castedOptionIds.indexOf(option.id) > -1;
				});
			}

			var html = $(template(templateName, {
				options: options,
				vote: VoteInfo
			}));
			container.append(html);

			if (RenderedOptions.length >= VoteInfo.optionIds.length) {
				$(".more-container").addClass("complete");
			} else {
				$(".more-container").removeClass("complete");
			}

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
			OptionsLoadState = "complete";
		}).fail(function(error) {
			Helper.alert(error);
			OptionsLoadState = "complete";
		});
	};

	// 选项ids排序
	function sortVoteOptionIds(sortType, optionIds) {
		if (sortType == "BY_RANDOM") {
			return optionIds.sort(function(a, b) {
				return Math.random() > 0.5 ? -1 : 1;
			});
		} else {
			return optionIds;
		}
	};

	// 加载下一页
	function loadNextPageOptions() {
		insertVoteOptions();
	};

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

	// 关注提示窗口
	function askAttention() {
		require.async("scripts/lib/askAttention", function(AskAttention) {
			AskAttention(Application.organization.wechat, token, "获取投票资格！");
		});
	}

	module.exports = Controller;
});