define(function(require, exports, module) {
	require('styles/wall.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require('helper');
	var WallService = require("WallService");
	var template = require('template');

	var Themes = require("scripts/controllers/wall/themes");

	var orgId, wallId;
	var wallInfo
	var user;
	var Controller = function() {
		var _controller = this;
		this.namespace = "wall.message";
		this.destroy = function() {
			$(document.body).css("backgroundImage", "").removeClass("back-image").removeClass("back-fixed");
		};
		this.actions = {
			makeTextForm: function() {
				if (wallInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("添加上墙消息需要绑定手机号码！", function() {
						addMessage();
					});
				} else {
					addMessage();
				}


				function addMessage() {
					require.async("lib.form.text", function(TextBox) {
						TextBox({
							title: "上墙",
							placeholder: "请填写上墙消息！",
							type: "TEXTAREA",
							value: "",
							success: function(btn) {
								var modal = this;
								var value = modal.value;
								if (value.length > 140) {
									Helper.errorToast("上墙消息字数不能超过140字！");
									return;
								} else if (value.length == 0) {
									Helper.errorToast("上墙消息不能为空！");
									return;
								}
								var $COMMENTNUMBER = $("#COMMENTNUMBER");
								var number = +$COMMENTNUMBER.text();
								var date = new Date().getTime();

								Helper.begin(btn);
								WallService.addMessage(wallId, value).done(function(data) {
									modal.destroy();
									$COMMENTNUMBER.text(++number);
									var singleMessage = template("app/templates/wall/add-single-message", {
										user: user,
										text: value,
										date: date
									});
									$("#WALLCOMMENTS").prepend(singleMessage);
								}).fail(function(error) {
									Helper.errorToast("上墙失败：" + error);
								}).always(function() {
									Helper.end(btn);
								});
							}
						});
					});
				}
			}
		};
	};
	bC.extend(Controller);

	Controller.prototype.init = function(callback) {
		var controller = this;
		this.recordURL();
		organization = Application.organization.info;
		user = Application.user.info;
		orgId = Helper.param.hash("oid") || organization.id;

		wallId = Helper.param.hash("wid");
		if (!wallId) {
			Helper.errorAlert('参数不足！');
			return;
		}


		// 设置后退默认链接
		this.backURL = '#organization/' + orgId + '/index';

		render(callback);
		Helper.disableKeyBoard([13]);
	};


	function render(callback) {
		WallService.get(wallId).done(function(data) {
			wallInfo = data.result;
			wallInfo.themeData = $.parseJSON(wallInfo.themeData);
			var backImage = wallInfo.themeCode == "CUSTOM" ? wallInfo.themeData.backgroundImagUrl : Themes.objOfAttr("code", wallInfo.themeCode).backgroundImage;
			$(document.body).addClass("back-image back-fixed");
			$(document.body).css("backgroundImage", "url('" + backImage + "')");

			Helper.setTitle(wallInfo.title + "--我要上墙");
			// $("#header").html("");

			(function renderHeader() {
				$("#header").html(template("app/templates/public/header", {
					title: '',
					user: Application.user.info
				}));
			})();

			renderMessages();
			
			// 确保用户已绑定手机号
			if (wallInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("添加上墙消息需要绑定手机号码！", function() {
					require.async("lib.phoneBindBox", function(PhoneBindBox) {
						PhoneBindBox({
							success: function() {
								render(callback);
							}
						});
					});
				});
			}
		}).fail(function(error) {
			Helper.errorToast(error);
		}).always(function() {
			callback && Helper.execute(callback);
		});

		if (Helper.browser.wx && (!Application.user.info.nickname || !Application.user.info.portraitUrl)) {
			Helper.confirm("您当前无昵称或头像，建议先同步微信信息", function() {
				Helper.jump("organization/" + Application.organization.id + "/user/zone");
			});
		}
	};



	function renderMessages() {
		WallService.getUserMessages(wallId, user.id).done(function(data) {

			var count = data.result.total;
			var messages = data.result.data;
			var html = "";
			html = template("app/templates/wall/add-message", {
				wall: wallInfo,
				user: user,
				messages: messages,
				count: count
			});
			
			$("#content").html(html);

			var winHeight = $(window).height();
			$("#WALLCOMMENTS").height(winHeight - 260);

		}).fail(function(error) {
			// renderMessages();
		});
	};



	module.exports = Controller;
});