define(function(require, exports, module) {
	require('styles/event.css');

	var baseController = require('baseController');
	var bC = new baseController();

	var template = require('template');
	var Helper = require('helper');

	var EventService = require('EventService');
	var UserService = require('UserService');
	var OrganizationService = require("OrganizationService");
	var VoteService = require("VoteService");
	var TicketService = require("TicketService");
	var RelationService = require("RelationService");

	// define global variable
	var orgId;
	var eventId, EventInfo;

	// 服务器与客户端时间差值
	var ServerClientTimeDifference;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "event";
		_controller.actions = {
			//点赞
			praise: function() {
				var btn = this;
				if (btn.hasClass('loading')) {
					return;
				};

				var old_icon = EventInfo.hasPraised ? 'icon-favorite-fill' : 'icon-favorite';
				var new_icon = EventInfo.hasPraised ? 'icon-favorite' : 'icon-favorite-fill';

				Helper.begin(btn);
				var action = EventInfo.hasPraised ? "remove" : "add";
				btn.addClass('loading');
				EventService.praise[action](eventId).done(function() {
					EventInfo.hasPraised = !EventInfo.hasPraised;
					EventInfo.totalPraises = EventInfo.hasPraised ? EventInfo.totalPraises + 1 : EventInfo.totalPraises - 1;
					btn.find(".praise-number").text(EventInfo.totalPraises);
					btn.find(".iconfont").removeClass(old_icon).addClass(new_icon);
				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					Helper.end(btn);
					btn.removeClass('loading');
				});
			},
			signup: function() {
				var btn = this;

				if (EventInfo.compulsivelyBindPhoneNumber) {
					// 确保用户绑定手机号才能进行活动报名
					Application.user.withinPhoneNumber("活动报名需要绑定手机号码！", function() {
						showSignupTimes();
					});
				} else {
					showSignupTimes();
				}

				function showSignupTimes() {
					// --TODO:校校微首页大赛
					if (eventId == "ed3a48b9-46e3-47a3-b490-9f9934550e70") {
						EventInfo.signUpTimes[0].numberOfSignUp = EventInfo.signUpTimes[0].numberOfSignUp + 88;
					}

					if (EventInfo.signUpTimes.length == 0) {
						return Helper.alert("该活动未添加报名时间段，不能报名！");
					}

					EventInfo.signupState = validateOptionState(EventInfo.signUpTimes, 'EVENT');
					var modal = Helper.modal({
						theme: 'black'
					});
					modal.html(template("app/templates/event/info/signup-times", {
						organizationId: Application.organization.id,
						eventInfo: EventInfo
					}));
				}
			},
			// 取消报名
			cancelSignup: function() {
				var btn = this;
				Helper.confirm("确定取消报名？", {}, function() {
					Helper.begin(btn);
					EventService.cancelSignup(eventId).done(function(data) {
						EventInfo.totalSignups--;
						btn.attr("data-xx-action", "signup").find(".title").text('活动报名');
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(btn);
					});
				});
			},
			robTicket: function() {
				var btn = this;
				var ticketId = btn.attr("data-value");
				var ticket = EventInfo.tickets.objOfAttr("id", ticketId);

				if (ticket.compulsivelyBindPhoneNumber) {
					// 确保用户绑定手机号才能进行活动报名
					Application.user.withinPhoneNumber("活动抢票需要绑定手机号码！", function() {
						showTicketTimes();
					});
				} else {
					showTicketTimes();
				}

				function showTicketTimes() {
					if (ticket.ticketOpenTimes.length == 0) {
						return Helper.alert("该电子票未添加时间段，不能抢票！");
					}

					ticket.timeState = validateOptionState(ticket.ticketOpenTimes, 'TICKET');
					var modal = Helper.modal({
						theme: 'black'
					});
					console.log(ticket);
					modal.html(template("app/templates/event/info/ticket-times", {
						organizationId: Application.organization.id,
						eventId: eventId,
						ticket: ticket
					}));
				}
			},
			// 查看电子票二维码
			showTicketQRCode: function() {
				var sourceId = this.attr("data-ticket-id");
				var code = this.attr("data-ticket-code");

				require.async("qrcode", function(qrcode) {
					UserService.ticketSourceTicket(Application.user.id, sourceId).done(function(data) {
						var tickets = data.result;
						if (!tickets.length) {
							Helper.errorAlert('你还没有抢到票哦！');
							return;
						}
						var code = tickets[0].code;
						var captcha = tickets[0].captcha;
						qrcode.show(getCheckTicketImage(sourceId, captcha), "电子票二维码", '<div class="text-red">编号：' + code + '</div><div>扫上面的二维码进行检票</div>');
					}).fail(function(error) {
						Helper.alert(error);
					});
				});
			},
			// 投票
			vote: function() {
				var btn = this;
				var voteId = btn.attr("data-value");

				Helper.jump('#organization/' + orgId + '/vote/' + voteId + '/info');
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
		this.recordURL();
		this.callback = callback;
		orgId = Application.organization.id;
		eventId = Helper.param.hash("eid");

		// 设置后退默认链接
		this.backURL = '#organization/' + orgId + '/events';

		this.render();
	};


	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;

		(function renderHeader() {
			$("#header").html(template("app/templates/public/header", {
				title: '',
				user: Application.user.info
			}));
		})();

		EventService.get(eventId).done(function(data) {
			ServerClientTimeDifference = data.time - (new Date()).getTime();
			EventInfo = data.result;

			// --TODO:校校微首页大赛
			if (eventId == "ed3a48b9-46e3-47a3-b490-9f9934550e70") {
				EventInfo.totalSignups = EventInfo.totalSignups + 88;
				EventInfo.totalPraises = EventInfo.totalPraises + 1024;
			}
			Helper.setTitle(EventInfo.name);
			loadEventInfo(EventInfo);

			wechatShare(controller, EventInfo);
			checkImage(controller);

			controller.scrollToTop();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});

	};

	function loadEventInfo(eventInfo) {
		//处理时间格式
		eventInfo.date = makeEventDate(eventInfo.startDate, eventInfo.endDate);
		// 检测活动报名时间状态
		eventInfo.signupState = validateOptionState(eventInfo.signUpTimes, 'EVENT');

		$("#content").html(template('app/templates/event/info', {
			eventInfo: eventInfo
		}));

		eventInfo.totalVotes && renderVotes();
		eventInfo.totalTicketSources && renderTickets();
		eventInfo.numberOfLotterys && renderLotteries();
		eventInfo.permitComment && renderComments();
	}

	// 渲染绑定投票列表
	function renderVotes() {
		RelationService.getList('EVENT', eventId, 'VOTE').done(function(data) {
			EventInfo.votes = makeEventVotes(data.result);
			$("#VOTES").html(template('app/templates/event/info/vote', {
				votes: EventInfo.votes
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 渲染绑定电子票列表
	function renderTickets() {
		RelationService.getList('EVENT', eventId, 'TICKET').done(function(data) {
			EventInfo.tickets = makeEventTickets(data.result, []);
			$("#TICKETS").html(template('app/templates/event/info/ticket', {
				tickets: EventInfo.tickets
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 渲染绑定抽奖
	function renderLotteries() {
		RelationService.getList('EVENT', eventId, 'LOTTERY').done(function(data) {
			EventInfo.lotteries = makeEventLotteries(data.result);
			$("#LOTTERY").html(template('app/templates/event/info/lottery', {
				lotteries: EventInfo.lotteries
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	};

	// 渲染评论列表
	function renderComments() {
		var commentBox;
		require.async("lib.commentBox", function(CommentBox) {
			commentBox = CommentBox({
				container: $("#CommentsContainer"),
				sourceId: eventId,
				sourceType: 'EVENT',
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
	function wechatShare(controller, EventInfo) {
		var shareTitle = EventInfo.name + " - " + Application.organization.info.name;
		var shareImage = EventInfo.thumbnailUrl ? EventInfo.thumbnailUrl + "@300w_300h_1e_1c" : "";
		var shareDesc = $(EventInfo.description).text();
		var shareUrl = EventInfo.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	}

	// 查看图片
	function checkImage(controller) {
		if (window.wx) {
			$(".event-info img").on("click." + controller.namespace, function() {
				var images = [];
				var image = this.src;
				$(document).find(".event-info img").each(function(idx, item) {
					images.push(item.src);
				});
				wx.previewImage({
					current: image,
					urls: images
				});
			});
		} else {
			$(document).on("click." + controller.namespace, ".event-info img", function() {
				var image = this.src;
				require.async("scripts/lib/ImageBox", function(ImageBox) {
					new ImageBox(image);
				});
			});
		}
	};

	// 活动时间处理
	function makeEventDate(startDate, endDate) {
		var eventTime;
		var startTime = Helper.makedate(startDate, 'MM-dd');
		var endTime = Helper.makedate(endDate, 'MM-dd');
		if (startTime == endTime) {
			eventTime = Helper.makedate(startDate, 'MM-dd hh:mm') + ' -- ' + Helper.makedate(endDate, 'hh:mm');
		} else {
			eventTime = Helper.makedate(startDate, 'MM-dd hh:mm') + ' -- ' + Helper.makedate(endDate, 'MM-dd hh:mm');
		}
		return eventTime;
	};

	function getCheckTicketImage(sid, captcha) {
		return "/api-front/barcode/generate?session=" + Application.getSession() + "&value=" + encodeURIComponent(window.location.origin + "#organization/" + orgId + "/ticket/" + sid + "/check?captcha=" + captcha)
	};

	function makeEventVotes(votes) {
		$(votes).each(function(idx, vote) {
			vote.timeState = validateOptionState([{
				startDate: vote.startDate,
				endDate: vote.endDate
			}], 'VOTE');
		});
		return votes;
	};

	// 根据电子票列表和用户所抢到的电子票列表
	// 组合出用户在该活动中的电子票信息
	function makeEventTickets(ticketSources, userTickets) {
		$(ticketSources).each(function(idx, ticket) {
			ticket.hasCode = userTickets.indexOf(ticket.id) > -1;
			ticket.timeState = validateOptionState(ticket.ticketOpenTimes, 'TICKET');
		});
		return ticketSources;
	}

	function makeEventLotteries(lotteries) {
		$(lotteries).each(function(idx, lottery) {
			lottery.timeState = validateOptionState([{
				startDate: lottery.startDate,
				endDate: lottery.endDate
			}], 'LOTTERY');
		});

		return lotteries;
	}

	/**
	 *	检测[报名／投票／电子票／抽奖]当前状态
	 *	状态值：即将开始／正在进行／已结束／名额已满
	 */
	function validateOptionState(times, sourceType) {
		var currentServerTime = ServerClientTimeDifference + new Date().getTime();
		var upComingCount = 0;
		var onGoingCount = 0;
		var endCount = 0;
		var remain = 0;

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

			//报名、电子票检测剩余数量
			if (sourceType == 'EVENT' || sourceType == 'TICKET') {
				if (remain > -1 && Helper.validation.isInt(time.numberOfRemaining)) {
					remain += time.numberOfRemaining;
				} else {
					remain = -1;
				}
			};
		});

		// 返回状态对象
		if ((sourceType == 'EVENT' || sourceType == 'TICKET') && remain == 0) {
			return {
				color: 'gray',
				title: '名额已满',
				state: 'EMPTY'
			}
		}

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

	module.exports = Controller;
});