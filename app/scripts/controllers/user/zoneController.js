define(function(require, exports, module) {
	require("styles/user.css");
	require("plugins/datepicker/common.css");
	require("plugins/datepicker/iscroll");
	require("plugins/datepicker/date");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var UserService = require("UserService");

	var orgId, title;
	var userId, userQRCode;

	var Controller = function() {
		var controller = this;
		controller.namespace = "user.zone";
		controller.actions = {
			uploadProfile: function() {
				var $input = $(this);
				var file = $input.get(0).files[0];
				if (!file) return;
				require.async("lib.imageUploader", function(imageUploader) {
					imageUploader(file, {
						title: "设置用户头像",
						jcrop: {
							aspectRatio: 1,
							minSize: [32, 32]
						},
						beforeUpload: function() {
							$input.parents(".avatar-container").addClass("loading");
						},
						destroy: function() {
							$input.parents(".avatar-container").removeClass("loading");
						},
						success: function(imageUrl) {
							var $container = $input.parents(".avatar-container").addClass("loading");
							UserService.update(userId, {
								portraitUrl: imageUrl
							}).done(function() {
								controller.userInfo.portraitUrl = imageUrl;
								controller.renderInfo();
								refreshUserAvatar(userId, imageUrl);
							}).fail(function(error) {
								Helper.alert(error);
							}).always(function() {
								$container.removeClass("loading");
							});
						},
						error: function(message) {
							Helper.alert(message);
						},
						always: function() {
							$input.parents(".avatar-container").removeClass("loading");
						}
					});
					$input.val("");
				});
			},
			bindPhone: function() {
				if (controller.userInfo.phoneNumber) {
					// Helper.alert("您已经绑定手机号，暂不支持解绑！");
					return;
				}
				require.async("lib.phoneBindBox", function(PhoneBindBox) {
					PhoneBindBox({
						success: function() {
							controller.userInfo = Application.user.info;
							controller.renderInfo();
						}
					});
				});
			},
			bindEmail: function() {
				if (controller.userInfo.email) {
					// Helper.alert("您已经绑定邮箱，暂不支持解绑！");
					return;
				}
				require.async("lib.emailBindBox", function(EmailBindBox) {
					EmailBindBox({
						success: function(modal) {
							modal.destroy();
							controller.renderInfo();
						}
					});
				});
			},
			editTextField: function() {
				var target = $(this).attr("data-target");
				var targetTitle = $(this).find(".title").text();
				require.async("lib.form.text", function(TextBox) {
					TextBox({
						title: targetTitle,
						placeholder: "请填写你的" + targetTitle,
						value: controller.userInfo[target] || "",
						success: function(btn) {
							var modal = this;
							Helper.begin(btn);
							var data = {};
							data[target] = modal.value;
							UserService.update(userId, data).done(function(data) {
								controller.userInfo[target] = modal.value;
								controller.renderInfo();
								modal.destroy();
							}).fail(function(error) {
								Helper.errorAlert(error);
							}).always(function() {
								Helper.end(btn);
							});
						}
					});
				});
			},
			chooseGender: function() {
				var target = $(this).attr("data-target");
				var targetTitle = $(this).find(".title").text();
				require.async("lib.form.choice", function(ChoiceBox) {
					var options = [{
						id: 1,
						name: "男",
						selected: Application.user.info.gender == 1
					}, {
						id: 2,
						name: "女",
						selected: Application.user.info.gender == 2
					}, {
						id: 0,
						name: "保密",
						selected: Application.user.info.gender == 0
					}];
					ChoiceBox({
						title: targetTitle,
						placeholder: "请选择你的" + targetTitle,
						options: options,
						success: function(values, btn) {
							var modal = this;

							if (!values.length) {
								Helper.errorToast("请选择你的性别！");
								return;
							}

							Helper.begin(btn);
							UserService.update(userId, {
								gender: +values[0]
							}).done(function(data) {
								controller.userInfo.gender = +values[0];
								controller.renderInfo();
								modal.destroy();
							}).fail(function(error) {
								Helper.errorAlert(error);
							}).always(function() {
								Helper.end(btn);
							});
						}
					});
				});
			},
			synchronize: function() {
				Helper.confirm("该操作将同步微信的头像、昵称、性别和故乡数据！", function() {
					$.when(Application.getPublicAppId()).done(function() {
						var redirect_uri = encodeURIComponent(window.location.origin + "/synchronize.html?redirect=" + encodeURIComponent(window.location.href));
						var authUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + Application.publicAppId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
						window.location.href = authUrl;
					}).fail(function(error) {
						Helper.alert(error);
					});
				});
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
		userId = Helper.param.search('uid') || Application.user.id;
		title = decodeURIComponent(Helper.param.search("title"));

		this.backURL = '#organization/' + orgId + '/index';

		if (title) {
			Helper.storePageTitle(orgId, "userZone", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "userZone") || "个人资料";
		Helper.setTitle(title);

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: '',
			user: Application.user.info
		}));
		controller.scrollToTop();

		if (userId == Application.user.id) {
			controller.userInfo = Application.user.info;
			controller.renderInfo();
			Helper.execute(controller.callback);
			var user = controller.userInfo;
			var name = user.name || user.nickname || user.phoneNumber;
		} else {
			UserService.get(userId).done(function(data) {
				controller.userInfo = data.result;
				controller.renderInfo();
				var user = controller.userInfo;
				var name = user.name || user.nickname || user.phoneNumber;
			}).fail(function(error) {
				Helper.errorAlert(error);
			}).always(function() {
				Helper.execute(controller.callback);
			});
		}
	};

	Controller.prototype.renderInfo = function() {
		var controller = this;

		$("#content").html(template("app/templates/user/zone", {
			orgId: orgId,
			user: controller.userInfo,
			editable: userId == Application.user.id,
			isWechat: Helper.browser.wx
		})).find("[grade]").date({}, function(date) {
			if (!date) return;
			var oldDate = controller.userInfo.grade;
			var date = new Date(date).getTime() + "";
			UserService.update(userId, {
				grade: date
			}).done(function(data) {
				controller.userInfo.grade = date;
				controller.renderInfo();
			}).fail(function(error) {
				Helper.errorAlert(error);
				controller.userInfo.grade = oldDate;
			});
		}, function() {});

		var user = controller.userInfo;
		var name = user.name || user.nickname || user.phoneNumber;
		var imageUrl = user.portraitUrl ? user.portraitUrl + "@300w_300h_1e_1c" : "";

		controller.share(name, imageUrl, name);
	};

	function refreshUserAvatar(userId, avatar) {
		$(".avatar-user-" + userId).each(function(idx, item) {
			var param = $(item).attr("data-param") || "@100w_100h_1e_1c";
			$(item).attr("src", avatar + param);
		});
	}

	module.exports = Controller;
});