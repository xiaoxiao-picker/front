define(function(require, exports, module) {
	require('styles/lottery.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LotteryService = require("LotteryService");
	var PublicService = require("PublicService");
	var RouletteWheel = require('scripts/lib/RouletteWheel');

	var rouletteWheel;

	var temp, orgId, lotteryId, LotteryInfo, isAttention;
	var Awards, AwardIndex;
	var RemainCount;
	var ServerClientTimeDifference;
	var HasXiaoXiao;

	var Controller = function() {
		var controller = this;
		this.namespace = "lottery.draw";
		this.destroy = function() {
			$(window).off("resize.roulette.wheel");
		};
		this.actions = {
			draw: function() {
				// 验证抽奖是否在进行中
				var currentTime = ServerClientTimeDifference + new Date().getTime();
				if (currentTime < LotteryInfo.startDate) {
					Helper.alert('抽奖还没开始，请持续关注抽奖开始时间！');
					return;
				}
				if (currentTime > LotteryInfo.endDate) {
					Helper.alert('你来晚了，抽奖已经结束！');
					return;
				};

				// 验证是否有抽奖资格
				// if (!validateRelationChecked()) return;

				// 确保已关注
				if (LotteryInfo.forceAttention && !isAttention) {
					askAttention();
					return;
				}

				if (RemainCount <= 0) {
					Helper.alert('您的抽奖次数已用完，无法继续抽奖！');
					return;
				};

				if (controller.state == 'loading') {
					return;
				};
				rouletteWheel.startRotate();
			},
			showAwardsModal: function() {
				showAwardsModal();
			},
			showMyAwardModal: function() {
				showMyAwardModal();
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

		temp = 'app/templates/lottery/draw';
		orgId = Helper.param.hash("oid") || Application.organization.id;
		lotteryId = Helper.param.hash("lid");

		this.backURL = '#organization/' + orgId + '/index';

		LotteryInfo = {};
		isAttention = false;
		Awards = [];
		AwardIndex = -1;
		RemainCount = -1;
		HasXiaoXiao = false;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html('');

		LotteryService.get(lotteryId).done(function(data) {
			LotteryInfo = data.result;
			Awards = makeAwards(LotteryInfo.awards);
			ServerClientTimeDifference = data.time - new Date().getTime();

			Helper.setTitle(LotteryInfo.name);
			wechatShare(controller, LotteryInfo);

			//TODO-----------BEGIN------------
			//校校惊喜蛋蛋转【15.12.23 -- 16.01.03】
			var xxEndTime = new Date('2016/01/03 23:59').getTime();
			var currentTime = data.time;
			if (currentTime <= xxEndTime) {
				HasXiaoXiao = true;
				temp = 'app/templates/lottery/draw-xx';
			}
			//TODO------------END-------------

			$("#content").html(template(temp, {
				lottery: LotteryInfo
			}));
			var draw = setInterval(function() {
				drawWheel(controller);
				setTimeout(function() {
					clearInterval(draw);
				}, 2000)
			}, 100);

			// 获取抽奖剩余次数，验证状态
			RemainCount = LotteryInfo.frequency - LotteryInfo.numberOfDraw;
			validateState();

			// 如果需要关注微信公众号才能投票则验证用户是否关注
			if (LotteryInfo.forceAttention) {
				insureAttention();
			} else {
				//TODO-----------BEGIN------------
				showXiaoXiaoPrompt();
				//TODO------------END-------------
			}

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeAwards(awards) {
		var newAwards = [];

		var probability = 1.0;
		$.each(awards, function(idx, award) {
			newAwards.push({
				id: award.id,
				name: award.name,
				iconUrl: award.portraitLotteryUrl,
				imageUrl: award.portraitUrl
			});
			probability -= award.probability;
		});

		if (probability > 0) {
			newAwards.push({
				id: null,
				name: LotteryInfo.thankYouText || '谢谢参与',
				iconUrl: LotteryInfo.thankYouImageUrl || 'http://img.xiaoxiao.la//9907617a-bbab-4eb1-8c4c-bdd3c766e6af.png',
				imageUrl: 'http://img.xiaoxiao.la//9907617a-bbab-4eb1-8c4c-bdd3c766e6af.png'
			});
		};

		return newAwards;
	};

	// 大转盘
	function drawWheel(controller) {
		rouletteWheel = new RouletteWheel($("#wheelcanvas")[0], Awards, {
			lotteryId: lotteryId,
			start: function() {
				controller.state = 'loading';
				LotteryService.draw(lotteryId).done(function(data) {
					var award = data.result.award || {};
					award.selected = data.result.selected;
					AwardIndex = getAwardIndex(award);

					rouletteWheel.willStopRotate(AwardIndex);
				}).fail(function(error) {
					Helper.alert(error);
					AwardIndex = -1;
					rouletteWheel.reset();
				});
			},
			stop: function() {
				controller.state = 'complete';
				if (AwardIndex > -1) {
					showResultModal(AwardIndex);
					RemainCount--;
					validateState();
				};
			}
		});

		$(window).on("resize.roulette.wheel", function() {
			rouletteWheel.render();
		});
	};

	/**
	 *	验证绑定[活动/投票]后是否可抽奖
	 *	若否引导跳转到对应页面
	 */
	function validateRelationChecked() {
		var relations = LotteryInfo.relations;
		if (!relations.length) return;

		var relation = relations[0];
		if (!LotteryInfo.hasRelatedChecked) {
			if (relation.sourceType == 'EVENT') {
				relation.message = '你还未报名活动，无法进行抽奖，请先前往活动报名！';
				relation.url = '#organization/' + orgId + '/event/' + relation.sourceId + '/signup';
			} else if (relation.sourceType == 'VOTE') {
				relation.message = '你还未投票，无法进行抽奖，请先前往投票！';
				relation.url = '#organization/' + orgId + '/vote/' + relation.sourceId + '/info';
			} else if (relation.sourceType == 'WALL') {
				relation.message = '你还未发布上墙，无法进行抽奖，请先前往上墙！';
				relation.url = '#organization/' + orgId + '/wall/' + relation.sourceId + '/message';
			}
			Helper.alert(relation.message, function() {
				Helper.jump(relation.url);
			});
		};
		console.log(LotteryInfo.hasRelatedChecked);
		return LotteryInfo.hasRelatedChecked;
	}

	function validateState() {
		if (RemainCount > 0) {
			$(".btn-lottery").attr('data-xx-action', 'draw').removeClass('disable');
		} else {
			$(".btn-lottery").attr('data-xx-action', '').addClass('disable');
		}
		$('.remain .count').text(RemainCount > 0 ? RemainCount : 0);
	};

	function getAwardIndex(award) {
		if (award.selected) {
			return Awards.indexOfAttr('id', award.id);
		} else {
			return Awards.length - 1;
		}
	}

	function showAwardsModal() {
		var modal = Helper.modal({
			theme: 'black'
		});

		modal.html(template('app/templates/lottery/awards-modal', {
			awards: LotteryInfo.awards
		}));

		modal.addAction('.btn-modal-close', 'click', function() {
			modal.destroy();
		});
	};

	function showMyAwardModal() {
		var modal = Helper.modal({
			theme: 'black',
			offset: {
				y: 40
			}
		});

		LotteryService.award.getList(lotteryId).done(function(data) {
			var awards = data.result;
			$.each(awards, function(idx, award) {
				console.log(award.lotteryTicketUrl);
				award.canJump = award.lotteryTicketUrl ? true : false;
				award.jumpUrl = window.location.origin + '/posters/lottery/award.html?oid=' + orgId + '&lid=' + lotteryId + '&aid=' + award.id;
			});
			console.log(awards);
			modal.html(template('app/templates/lottery/my-award-modal', {
				orgId: orgId,
				lotteryId: lotteryId,
				awards: awards,
				easing: $.easing.linear
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});

		modal.addAction('.btn-modal-close', 'click', function() {
			modal.destroy();
		});
	};

	function showResultModal(index) {
		var modal = Helper.modal({
			theme: 'black'
		});

		preImage('./images/lottery/result-bg.png', function() {
			var award = Awards[index];
			modal.html(template('app/templates/lottery/result-modal', {
				orgId: orgId,
				lotteryId: lotteryId,
				hasSignUp: LotteryInfo.hasSignUp,
				award: award
			}));

			modal.addAction('.btn-modal-close', 'click', function() {
				modal.destroy();

				//TODO-----------BEGIN------------
				setTimeout(function() {
					showXiaoXiaoPrompt();
				}, 500);
				//TODO------------END-------------
			});
		});
	};

	//TODO-----------BEGIN------------
	function showXiaoXiaoPrompt() {
		if (HasXiaoXiao && lotteryId != '79af04b3-277a-422d-8f4a-5384084a2a0b' && !RemainCount) {
			var modal = Helper.modal({
				theme: 'deep-black',
				position: 'top'
			});

			modal.html(template('app/templates/lottery/xiaoxiao-modal', {}));
			modal.addAction('.back', 'click', function() {
				if (Application.debug) {
					Helper.alert("关闭！");
				}
				modal.destroy();
			});
			preImage('./images/lottery/xiaoxiao/xx-modal.png', function() {
				var winHeight = $(window).height();
				var $content = modal.box.find(".link-xiaoxiao");
				var height = $content.height();
				$content.css("marginTop", (winHeight - height) / 2 - 25);
			});
		};
	}
	//TODO------------END-------------

	function preImage(url, callback) {
		var img = new Image();
		img.src = url;

		if (img.complete) {
			callback.call(img);
			return;
		}

		img.onload = function() {
			callback.call(img);
		};
	}

	// 如果需要关注才能投票
	// 确保用户已经关注组织公众号
	function insureAttention() {
		require.async("scripts/lib/checkAttention", function(checkAttention) {
			checkAttention("LOTTERY", lotteryId, function(data) {
				isAttention = data.result;
				if (!isAttention) {
					token = data.token;
					askAttention();
				} else {
					//TODO-----------BEGIN------------
					showXiaoXiaoPrompt();
					//TODO------------END-------------
				}
			});
		});
	}

	function askAttention() {
		require.async("scripts/lib/askAttention", function(AskAttention) {
			AskAttention(Application.organization.wechat, token, "获取抽奖资格！");
		});
	}

	// 微信分享
	function wechatShare(controller, LotteryInfo) {
		var shareTitle = LotteryInfo.name + " - " + Application.organization.info.name;
		var shareImage = window.location.origin + '/images/lottery/default.png';
		var shareDesc = LotteryInfo.description;
		var shareUrl = LotteryInfo.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	}

	module.exports = Controller;
});