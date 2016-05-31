define(function(require, exports, module) {
	require('styles/event.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require('helper');
	var template = require('template');

	var UserService = require('UserService');
	var TicketService = require('TicketService');
	var PublicService = require("PublicService");

	var REQUIREINFO = require("REQUIREINFO");

	var orgId, eventId;
	var sourceId, TicketInfo, SignupRequires, SignupTimes;
	// 服务器与客户端时间差值
	var ServerClientTimeDifference;
	// 剩余票数轮询
	var REMAIN_TICKET_LOOP;

	// define controller
	var Controller = function() {
		var controller = this;
		controller.namespace = "ticket.info";
		controller.destroy = function() {
			clearInterval(REMAIN_TICKET_LOOP);
		};
		controller.actions = {
			// 简介
			toggleTerse: function() {
				this.parents(".ticket-info").find(".context").slideToggle(500);
			},
			signup: function() {
				var btn = this;

				// 抢票之前异步刷新剩余票数信息，与抢票动作不冲突
				refreshTicketRemaining();

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				// 判断当前时间是否可以抢票
				var currentServerTime = ServerClientTimeDifference + new Date().getTime();
				var times = SignupTimes.clone().sort(function(time1, time2) {
					return time2.startDate - time1.startDate;
				});
				var activeTime;
				$(times).each(function(idx, time) {
					var isActive = time.startDate <= currentServerTime && time.endDate >= currentServerTime;
					time.isActive = isActive;
					if (isActive) activeTime = time;
				});
				if (!activeTime) {
					Helper.alert("当前时间不可抢票！");
					return;
				}

				if (activeTime.numberOfLimit && activeTime.numberOfLimit <= activeTime.numberOfSignUp) {
					Helper.alert('当前时间段没有剩余票数！');
					return;
				}

				if (TicketInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("抢票需要绑定手机号码！", function() {
						signup();
					});
				} else {
					signup();
				}

				function signup() {
					Helper.begin(btn);
					TicketService.signup(activeTime.id, REQUIREINFO.fieldsToData(SignupRequires)).done(function(data) {
						Helper.alert("恭喜你抢票成功，你可以保存电子票二维码以便管理员检票！");
						controller.render();
					}).fail(function(error) {
						Helper.errorAlert(error);
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
		sourceId = Helper.param.hash("tid");
		eventId = Helper.param.search("eventId");
		session = Application.getSession();
		this.backURL = eventId ? '#organization/' + orgId + '/event/' + eventId + '/info' : "#organization/" + orgId + "/index";

		TicketInfo = {};
		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: eventId ? "活动抢票" : "电子票",
			user: Application.user.info
		}));

		TicketService.get(sourceId).done(function(data) {
			TicketInfo = makeTicketInfo(data.result, data.time);

			if (!TicketInfo.hasRequested) {
				SignupRequires = makeSignupRequires(TicketInfo);

				require.async("lib.makeFields", function(makeFields) {
					var fieldsHTML = makeFields(SignupRequires, controller.namespace);
					$("#content").html(template("app/templates/ticket/info", {
						orgId: orgId,
						eventId: eventId,
						ticket: TicketInfo
					}));
					$("#TicketSignup").html(fieldsHTML);
				});
			} else {
				TicketService.getTicket(sourceId).done(function(data) {
					var ticket = data.result;
					$("#content").html(template("app/templates/ticket/info", {
						orgId: orgId,
						eventId: eventId,
						ticket: TicketInfo,
						qrcodeUrl: getCheckTicketImage(ticket.id, ticket.captcha)
					}));
				}).fail(function(error) {
					Helper.errorAlert(error);
				});
			}

			// 每隔30秒轮询查询剩余电子票数
			REMAIN_TICKET_LOOP = setInterval(refreshTicketRemaining, 30000);

			// 确保用户已绑定手机号
			if (TicketInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("抢票需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: function() {
								controller.render();
							}
						});
					});
				});
			}
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	}

	// 更新剩余票数信息
	function refreshTicketRemaining() {
		if (TicketInfo.remaining == 0) {
			clearInterval(REMAIN_TICKET_LOOP);
			return;
		}
		TicketService.get(sourceId).done(function(data) {
			var ticket = data.result;
			TicketInfo.remaining = ticket.remaining;
			$("#TicketCount").text("剩余：" + TicketInfo.remaining + "，总数：" + TicketInfo.total);
		}).fail(function(error) {
			// do nothing
		});
	};

	function makeTicketInfo(ticketInfo, currentServerTime) {
		SignupTimes = ticketInfo.ticketOpenTimes;

		ServerClientTimeDifference = currentServerTime - new Date().getTime();
		// 时间排序
		var times = SignupTimes.clone().sort(function(time1, time2) {
			return time2.startDate - time1.startDate;
		});
		var active = false;
		$(times).each(function(idx, time) {
			var isActive = time.startDate <= currentServerTime && time.endDate >= currentServerTime;
			time.isActive = isActive;
			if (isActive) active = true;
		});

		if (ticketInfo.state == 'OPENED' && !active) {
			ticketInfo.state = 'UNACTIVE';
		};

		return ticketInfo;
	};

	function makeSignupRequires(ticketInfo) {
		var texts = ticketInfo.register ? ticketInfo.register.texts : [];
		var dates = ticketInfo.register ? ticketInfo.register.dates : [];
		var choices = ticketInfo.register ? ticketInfo.register.choices : [];
		var images = ticketInfo.register ? ticketInfo.register.images : [];

		var fields = REQUIREINFO.makeRequiredInfos(texts, dates, choices, images);

		$(fields).each(function(idx, field) {
			field.title = field.title == "tel" ? "phoneNumber" : field.title;
			if (["name", "phoneNumber", "studentId", "grade"].indexOf(field.title) > -1) {
				field.value = Application.user.info[field.title];
			} else if (field.title == "gender") {
				var gender = Application.user.info.gender ? ["保密", "男", "女"][Application.user.info.gender] : "";
				$(field.options).each(function(j, option) {
					option.selected = option.name == gender;
				});
			}

			if (field.type == "RADIO" || field.type == "CHECKBOX") {
				field.selected = field.options.arrayWidthObjAttr("selected", true).length > 0;
			}

			if (field.type == "IMAGE") {
				field.values = [];
			}
		});

		return fields;
	};


	function getCheckTicketImage(sid, captcha) {
		return "/api-front/barcode/generate?session=" + session + "&value=" + encodeURIComponent(window.location.origin + "#organization/" + orgId + "/ticket/" + sid + "/check?captcha=" + captcha)
	};

	module.exports = Controller;
});