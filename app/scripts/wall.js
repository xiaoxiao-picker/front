define(function(require, exports, module) {
	require("array");
	var config = require("config");

	var QRCodeModal = require("scripts/controllers/wall/QRCodeModal");
	var $QRCodeModal;
	var ThemeSelectorModal = require("scripts/controllers/wall/ThemeSelectorModal");
	var $ThemeSelectorModal;
	var WallLotteryModal = require("scripts/controllers/wall/WallLotteryModal");
	var $WallLotteryModal;
	var VoteRankModal = require("scripts/controllers/wall/VoteRankModal");
	var $VoteRankModal;
	var LotteryModal = require("scripts/controllers/wall/LotteryModal");
	var $LotteryModal;
	
	var SponsorModal = require("scripts/controllers/wall/QRCodeModal");
	var $SponsorModal;


	var WallService = require("WallService");
	var VoteService = require("VoteService");
	var RelationService = require("RelationService");
	var template = require('template');
	var Helper = require('helper');
	var Themes = require("scripts/controllers/wall/themes");

	var orgId = Helper.param.search("organizationId");
	var wallId = Helper.param.search("wallId");
	var wallInfo;
	var Organization;
	var MessageQueue = []; // 未播放消息列表
	var ArchivedMessageQueue = [];
	var ammount;
	var LastMessageLength = 0;

	var qrcodeURL, qrcodeMessage;

	// 当前使用的主题
	var currentThemeCode;
	var currentNotice;

	var WallUsers, LOTTERY, LUCKY;

	// 已关联的业务对象
	var RelatedObject = {};

	var Application = window.Application = require("factory.application");

	Application.init(render);


	function render() {
		var getWallInfo = WallService.get(wallId).done(function(data) {
			wallInfo = data.result;
			wallInfo.themeCode = wallInfo.themeCode || "RABBIT";
			wallInfo.themeData = $.parseJSON(wallInfo.themeData || "{}");
			$(document.body).addClass(wallInfo.themeCode);
			if (wallInfo.themeCode == "CUSTOM") {
				$(".mask").css("backgroundImage", "url('" + wallInfo.themeData.backgroundImageUrl + "')");
			}

			Helper.setTitle(wallInfo.title);

			currentThemeCode = wallInfo.themeCode;
			currentNotice = wallInfo.notice;


			if (wallInfo.numberOfVotes) {
				getRelatedObjects("VOTE");
			}

			if (wallInfo.numberOfLotterys) {
				getRelatedObjects("LOTTERY");
			}
		});
		var getInitMessages = WallService.getMessageForInitShow(wallId, 0, 10).done(function(data) {
			MessageQueue = data.result.data.reverse();
			ammount = data.result.total;
		});
		var getWechat = Application.organization.getWechat().done(function() {
			var wechat = Application.organization.wechat;
			var organization = Application.organization;
			var session = Application.getSession();

			qrcodeURL = wechat && wechat.qrCodeUrl ? wechat.qrCodeUrl : "/api-front/barcode/generate?session=" + session + "&value=" + encodeURIComponent("http://" + location.host + "#organization/" + orgId + "/wall/" + wallId + "/message");
			qrcodeMessage = (wechat ? "关注 " + (wechat.alias || wechat.name) + " 回复\"上墙\"" : "扫描右侧二维码") + "参与上墙";
		});
		$.when(getWallInfo, getInitMessages, getWechat).done(function() {
			$("#content").html(template("app/templates/wall/info", {
				org: Application.organization.info,
				wall: wallInfo,
				qrcodeURL: qrcodeURL,
				qrcodeMessage: qrcodeMessage,
				wallNameLength: getCharLength(wallInfo.title),
				qrcodeMessageLength: getCharLength(qrcodeMessage)
			}));
			getNewerWallInfo();
			setTimeout(fillNewerMessages, 5000);
			autoPlay();

			headerMotion();
			noticeMotion();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			$("#frontLoading").hide();
		});
	};

	// 获取墙信息
	function getNewerWallInfo() {
		setTimeout(function() {
			WallService.get(wallId).done(function(data) {
				wallInfo = data.result;
				wallInfo.themeData = $.parseJSON(wallInfo.themeData || "{}");

				// 如果公告被修改后
				if (wallInfo.notice != currentNotice) {
					currentNotice = wallInfo.notice;
					$(".footer .notice").find("span").text(wallInfo.notice);
					noticeMotion();
				}
			}).fail(function(error) {
				Console("获取墙信息失败：" + error);
			}).always(function() {
				getNewerWallInfo();
			});
		}, 10000);
	};

	// 请求更新的消息数据填充进消息等待队列
	function fillNewerMessages() {
		var delay = 5000;
		WallService.getMessageForShow(wallId, ammount, 30).done(function(data) {
			var count = data.result.length;
			var messages = data.result;
			if (messages.length > 0) {
				messages.reverse();
			}

			if (count != 0 && count) {
				ammount += count;
			}
			if (messages.length > 0) {
				// LastMessageId = messages[messages.length - 1].id;
				MessageQueue = MessageQueue.concat(messages);
			}
			// 如果当前已取完则5秒后取数据，如果未取完则3秒后取
			delay = LastMessageLength < count ? 5000 : 8000;
			LastMessageLength = count;
		}).fail(function(error) {
			Console("定时获取消息失败：" + error + "，发起重新请求。");
		}).always(function() {
			setTimeout(fillNewerMessages, delay);
		});
	};

	// 获取上墙所关联的投票/抽奖
	function getRelatedObjects(object) {
		RelationService.getList("WALL", wallId, object).done(function(data) {
			RelatedObject[object] = data.result;
		}).fail(function(error) {
			Helper.alert(error);
		});
	}


	// 播放下一条消息
	function nextMessage() {
		if (!MessageQueue.length) return;
		// 如果墙关闭，则队列照常运行，但屏幕不显示
		if (wallInfo.wallState == "CLOSED") return;
		// 取出第一条信息，并将其从队列中删除
		var message = MessageQueue.splice(0, 1)[0];
		ArchivedMessageQueue.push(message);
		message.user = message.user || {};
		var messageInner = template("app/templates/wall/inner-message", {
			message: message
		});
		$("#COMMENTLIST").prepend(messageInner);

		// 删除第四条之后的历史消息
		var $comments = $("#COMMENTLIST").find(">li.wall-comment");
		$comments.slice(4, $comments.length).remove();
	}

	// 自动播放消息
	function autoPlay() {
		var delay = (11 - MessageQueue.length) * 1000;
		if (delay < 1000) delay = 1000;
		if (delay > 10000) delay = 10000;
		nextMessage();
		setTimeout(autoPlay, delay);
	}



	function headerMotion() {
		var wallTitleBox = $(".wall-info .wall");
		var $title = wallTitleBox.find(".title");
		var $message = wallTitleBox.find(".message");
		motionToMessage();

		function motionToMessage() {
			setTimeout(function() {
				$title.animate({
					opacity: 0
				}, 500);
				$message.animate({
					opacity: 1
				}, 1000, motionToTitle);
			}, 7000);
		}

		function motionToTitle() {
			setTimeout(function() {
				$message.animate({
					opacity: 0
				}, 500);
				$title.animate({
					opacity: 1
				}, 1000, motionToMessage);
			}, 3000);
		}
	}

	function noticeMotion() {
		var noticeBox = $(".footer .notice");
		var noticeSpan = noticeBox.find("span");
		var noticeBoxWidth = noticeBox.width();
		var noticeSpanWidth = noticeSpan.width();
		noticeSpan.css("marginLeft", 0).stop();
		if (noticeSpanWidth > noticeBoxWidth) {
			motionToLeft();

			function motionToLeft() {
				setTimeout(function() {
					noticeSpan.animate({
						marginLeft: noticeBoxWidth - noticeSpanWidth
					}, 10000, "linear", motionToRight);
				}, 2000);
			}

			function motionToRight() {
				setTimeout(function() {
					noticeSpan.animate({
						marginLeft: 0
					}, 0, motionToLeft);
				}, 3000);
			}
		} else {
			noticeSpan.css("marginLeft", 0);
		}
	}



	function Console(message) {
		window.console && window.console.log && console.log(message);
	}


	function getCharLength(s) {
		var l = 0;
		var a = s.split("");
		for (var i = 0; i < a.length; i++) {
			if (a[i].charCodeAt(0) < 299) {
				l++;
			} else {
				l += 2;
			}
		}
		return l;
	}

	var actions = {
		fullScreen: function() {
			var el = document.documentElement,
				rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
				wscript;

			if (typeof rfs != "undefined" && rfs) {
				rfs.call(el);
				return;
			}

			if (typeof window.ActiveXObject != "undefined") {
				wscript = new ActiveXObject("WScript.Shell");
				if (wscript) {
					wscript.SendKeys("{F11}");
				}
			}
		},
		exitFullScreen: function() {
			var el = document,
				cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen,
				wscript;

			if (typeof cfs != "undefined" && cfs) {
				cfs.call(el);
				return;
			}

			if (typeof window.ActiveXObject != "undefined") {
				wscript = new ActiveXObject("WScript.Shell");
				if (wscript != null) {
					wscript.SendKeys("{F11}");
				}
			}
		},
		showMessage: function() {
			var messageBox = $("#COMMENTBOX");
			var messageDetailBox = messageBox.find(".message-detail-box").remove();
			var themeBox = messageBox.find(".wall-theme-selector").hide();
			var lotteryBox = messageBox.find(".wall-lottery-box").hide();
			var voteRankBox = messageBox.find(".vote-result-box").hide();
			var qrcodeBox = messageBox.find(".message-qrcode-box").hide();
			var commentBox = messageBox.find("#COMMENTLIST");
			commentBox.css("visibility", "");
		},
		checkMessage: function() {
			var messageBox = $("#COMMENTBOX");
			var commentBox = messageBox.find("#COMMENTLIST");
			var messageId = this.attr("data-message-id");
			var messageInfo = ArchivedMessageQueue.objOfAttr("id", messageId);
			if (!messageInfo) return;
			var $html = $(template("app/templates/wall/message-detail", {
				message: messageInfo
			}));
			$html.on("click.message-" + messageId, ".btn-close", function() {
				$html.remove();
				commentBox.css("visibility", "");
			});
			$html.appendTo(messageBox);
			commentBox.css("visibility", "hidden");
		},
		showQRCode: function() {
			$SponsorModal && $SponsorModal.state == "opened" && $SponsorModal.destroy();
			$ThemeSelectorModal && $ThemeSelectorModal.state == "opened" && $ThemeSelectorModal.destroy();
			$WallLotteryModal && $WallLotteryModal.state == "opened" && $WallLotteryModal.destroy();
			$VoteRankModal && $VoteRankModal.state == "opened" && $VoteRankModal.destroy();
			$LotteryModal && $LotteryModal.state == "opened" && $LotteryModal.destroy();

			if ($QRCodeModal) {
				if ($QRCodeModal.state == "closed") {
					$QRCodeModal.open();
				} else {
					$QRCodeModal.destroy();
				}
				return;
			}
			$QRCodeModal = QRCodeModal(qrcodeURL, {
				container: $("#COMMENTBOX")
			}).open();
		},
		showSponsor: function() {
			if(!wallInfo.sponsor){
				return Helper.alert("当前上墙未添加赞助商！");
			}
			$QRCodeModal && $QRCodeModal.state == "opened" && $QRCodeModal.destroy();
			$ThemeSelectorModal && $ThemeSelectorModal.state == "opened" && $ThemeSelectorModal.destroy();
			$WallLotteryModal && $WallLotteryModal.state == "opened" && $WallLotteryModal.destroy();
			$VoteRankModal && $VoteRankModal.state == "opened" && $VoteRankModal.destroy();
			$LotteryModal && $LotteryModal.state == "opened" && $LotteryModal.destroy();

			if ($SponsorModal) {
				if ($SponsorModal.state == "closed") {
					$SponsorModal.open();
				} else {
					$SponsorModal.destroy();
				}
				return;
			}
			$SponsorModal = SponsorModal(wallInfo.sponsor, {
				container: $("#COMMENTBOX")
			}).open();
		},
		selectWallTheme: function() {
			$SponsorModal && $SponsorModal.state == "opened" && $SponsorModal.destroy();
			$QRCodeModal && $QRCodeModal.state == "opened" && $QRCodeModal.destroy();
			$WallLotteryModal && $WallLotteryModal.state == "opened" && $WallLotteryModal.destroy();
			$VoteRankModal && $VoteRankModal.state == "opened" && $VoteRankModal.destroy();
			$LotteryModal && $LotteryModal.state == "opened" && $LotteryModal.destroy();

			var themes = Themes.clone();
			if (wallInfo.themeData.backgroundImageUrl) {
				themes.splice(0, 0, {
					code: "CUSTOM",
					name: "自定义",
					previewProfile: wallInfo.themeData.backgroundImageUrl
				});
			}

			if ($ThemeSelectorModal) {
				if ($ThemeSelectorModal.state == "closed") {
					$ThemeSelectorModal.open();
				} else {
					$ThemeSelectorModal.destroy();
				}
				return;
			}

			$ThemeSelectorModal = ThemeSelectorModal(themes, {
				container: $("#COMMENTBOX"),
				activeThemeCode: currentThemeCode,
				select: function(themeCode) {
					currentThemeCode = themeCode;
					$(document.body).attr("class", themeCode);
					if (themeCode == "CUSTOM") {
						$(".mask").css("backgroundImage", "url('" + wallInfo.themeData.backgroundImageUrl + "')");
					} else {
						$(".mask").css("backgroundImage", "");
					}
					this.destroy();
				}
			}).open();
		},
		openLottery: function() {
			$SponsorModal && $SponsorModal.state == "opened" && $SponsorModal.destroy();
			$QRCodeModal && $QRCodeModal.state == "opened" && $QRCodeModal.destroy();
			$ThemeSelectorModal && $ThemeSelectorModal.state == "opened" && $ThemeSelectorModal.destroy();
			$VoteRankModal && $VoteRankModal.state == "opened" && $VoteRankModal.destroy();
			$LotteryModal && $LotteryModal.state == "opened" && $LotteryModal.destroy();

			if ($WallLotteryModal) {
				if ($WallLotteryModal.state == "closed") {
					$WallLotteryModal.open();
				} else {
					$WallLotteryModal.destroy();
				}
				return;
			}

			$WallLotteryModal = WallLotteryModal(wallId, {
				container: $("#COMMENTBOX")
			});
		},
		checkVoteRank: function() {
			if (!RelatedObject["VOTE"] || !RelatedObject["VOTE"].length) {
				return Helper.alert("当前上墙尚未绑定投票！");
			}
			$SponsorModal && $SponsorModal.state == "opened" && $SponsorModal.destroy();
			$QRCodeModal && $QRCodeModal.state == "opened" && $QRCodeModal.destroy();
			$ThemeSelectorModal && $ThemeSelectorModal.state == "opened" && $ThemeSelectorModal.destroy();
			$WallLotteryModal && $WallLotteryModal.state == "opened" && $WallLotteryModal.destroy();
			$LotteryModal && $LotteryModal.state == "opened" && $LotteryModal.destroy();

			if ($VoteRankModal) {
				if ($VoteRankModal.state == "closed") {
					$VoteRankModal.open();
				} else {
					$VoteRankModal.destroy();
				}
				return;
			}

			var vote = RelatedObject["VOTE"][0];
			$VoteRankModal = VoteRankModal(vote, {
				container: $("#COMMENTBOX")
			}).open();
		},
		relatedLottery: function() {
			if (!RelatedObject["LOTTERY"] || !RelatedObject["LOTTERY"].length) {
				return Helper.alert("当前上墙尚未绑定抽奖！");
			}
			$SponsorModal && $SponsorModal.state == "opened" && $SponsorModal.destroy();
			$QRCodeModal && $QRCodeModal.state == "opened" && $QRCodeModal.destroy();
			$ThemeSelectorModal && $ThemeSelectorModal.state == "opened" && $ThemeSelectorModal.destroy();
			$WallLotteryModal && $WallLotteryModal.state == "opened" && $WallLotteryModal.destroy();
			$VoteRankModal && $VoteRankModal.state == "opened" && $VoteRankModal.destroy();

			if ($LotteryModal) {
				if ($LotteryModal.state == "closed") {
					$LotteryModal.open();
				} else {
					$LotteryModal.destroy();
				}
				return;
			}

			var lottery = RelatedObject["LOTTERY"][0];
			var qrcode = makeQRCode(config.pages.origin + "/index.html#organization/" + Application.organization.id + "/lottery/" + lottery.id + "/draw");

			$LotteryModal = LotteryModal(qrcode, {
				container: $("#COMMENTBOX")
			}).open();
		}
	};

	function makeQRCode(url) {
		return "/api-front/barcode/generate?session=" + Application.getSession() + "&value=" + encodeURIComponent(url)
	}

	Helper.globalEventListener("click.wall", "data-xx-action", actions);
});