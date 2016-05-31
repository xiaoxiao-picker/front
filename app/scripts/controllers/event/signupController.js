define(function(require, exports, module) {
	require('styles/event.css');

	var baseController = require('baseController');
	var bC = new baseController();

	var UserService = require('UserService');
	var EventService = require('EventService');

	var Helper = require('helper');
	var template = require('template');


	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	// define global variable
	var orgId, eventId;

	var EventInfo, SignupTimes, SignupRequires;
	// 服务器与客户端时间差值
	var ServerClientTimeDifference;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "event.signup";
		_controller.actions = {
			// 报名
			signup: function() {
				var _btn = this;

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				// 判断当前时间是否可以报名
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
					Helper.alert("当前时间不可报名！");
					return;
				}

				if (activeTime.numberOfLimit && activeTime.numberOfLimit <= activeTime.numberOfSignUp) {
					Helper.alert('当前时间段报名人数已满，不能继续报名！');
					return;
				}

				if (EventInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("活动报名需要绑定手机号码！", function() {
						signup();
					});
				} else {
					signup();
				}

				function signup() {
					Helper.begin(_btn);
					EventService.signup(activeTime.id, REQUIREINFO.fieldsToData(SignupRequires)).done(function(data) {
						Helper.alert('恭喜你，报名成功！', function() {
							Helper.jump('#organization/' + orgId + '/event/' + eventId + '/info');
						});
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(_btn);
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
		eventId = Helper.param.hash("eid");

		// 设置后退默认链接
		this.backURL = '#organization/' + orgId + '/event/' + eventId + '/info';

		this.render();
	};

	// 请求活动数据，并渲染，如果为初始化则设置微信分享
	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;

		(function renderHeader() {
			$("#header").html(template("app/templates/public/header", {
				title: '活动报名',
				user: Application.user.info
			}));
		})();

		//获取活动内容
		var getEventInfo = EventService.get(eventId).done(function(data) {
			EventInfo = data.result;
			SignupRequires = makeSignupRequires(EventInfo);

			// 确保用户已绑定手机号
			if (EventInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("活动报名需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: function() {
								controller.render();
							}
						});
					});
				});
			}
		});
		// 获取活动报名时间
		var getSignupTimes = EventService.getSignupTimes(eventId).done(function(data) {
			SignupTimes = data.result;
			var currentServerTime = data.time;
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
			if (!active) {
				Helper.alert("当前时间不可报名！");
			}
		});

		$.when(getEventInfo, getSignupTimes).done(function() {
			var fieldsHTML = makeFields(SignupRequires, controller.namespace);

			$("#content").html(template("app/templates/event/signup", {}));
			$("#EventSignup").html(fieldsHTML);


			if (!EventInfo.allowToSignUp) {
				return Helper.alert("当前活动不可报名！", function() {
					Helper.execute(controller.actions.goBack);
				});
			}

			if (EventInfo.hasSignUped) {
				return Helper.alert("你已经报名，返回活动！", function() {
					Helper.execute(controller.actions.goBack);
				});
			}

			// 微信分享
			var shareTitle = EventInfo.name + " - 报名 - " + Application.organization.info.name;
			var shareImage = EventInfo.thumbnailUrl ? EventInfo.thumbnailUrl + "@300w_300h_1e_1c" : "";
			var shareDesc = $(EventInfo.description).text();
			var shareUrl = EventInfo.shareUrl || (location.origin + location.pathname + "#organization/" + Application.organization.id + "/" + EventInfo.id + "/info");
			controller.share(shareTitle, shareImage, shareDesc, shareUrl);

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function makeSignupRequires(eventInfo) {
		var texts = eventInfo.register.texts;
		var dates = eventInfo.register.dates;
		var choices = eventInfo.register.choices;
		var images = eventInfo.register.images;

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



	module.exports = Controller;
});