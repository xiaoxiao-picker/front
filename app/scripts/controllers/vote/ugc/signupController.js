define(function(require, exports, module) {
	require('styles/vote.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var Helper = require('helper');
	var template = require('template');

	var VoteService = require('VoteService');

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var orgId, voteId;
	var VoteInfo, SignUpInfo, SignupRequires;
	// 服务器与客户端时间差值
	var ServerClientTimeDifference;

	// define controller
	var Controller = function() {
		var _controller = this;
		_controller.namespace = "vote.signup";
		_controller.actions = {
			// 报名
			signup: function() {
				var _btn = this;

				if (!validateSignUpTime()) {
					Helper.alert("当前时间不可报名！");
					return;
				}

				var messages = REQUIREINFO.validateFields(SignupRequires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				if (VoteInfo.compulsivelyBindPhoneNumber) {
					Application.user.withinPhoneNumber("报名需要绑定手机号码！", function() {
						signup();
					});
				} else {
					signup();
				}

				function signup() {
					Helper.begin(_btn);

					var action = SignUpInfo.id ? VoteService.signup.update(voteId, SignUpInfo.id, fieldsToData()) : VoteService.signup.add(voteId, fieldsToData());
					action.done(function(data) {
						Helper.successToast(SignUpInfo.id ? '修改报名信息成功！' : '恭喜你，报名成功！');
						Helper.jump('#organization/' + orgId + '/vote/' + voteId + '/info/ugc');
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
		voteId = Helper.param.hash("vid");

		// 设置后退默认链接
		this.backURL = '#organization/' + orgId + '/vote/' + voteId + '/info/ugc';

		this.render();
	};

	// 请求活动数据，并渲染，如果为初始化则设置微信分享
	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback;
		var userInfo = Application.user.info;

		(function renderHeader() {
			$("#header").html(template("app/templates/public/header", {
				title: '投票报名',
				user: Application.user.info
			}));
		})();

		var getVoteInfo = VoteService.get(voteId).done(function(data) {
			VoteInfo = data.result;
			var currentServerTime = data.time;
			ServerClientTimeDifference = currentServerTime - new Date().getTime();

			// 确保用户已绑定手机号
			if (VoteInfo.compulsivelyBindPhoneNumber && !Application.user.info.phoneNumber) {
				Helper.confirm("投票报名需要绑定手机号码！", function() {
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

		var getSignUpInfo = VoteService.signup.getList(voteId).done(function(data) {
			SignUpInfo = data.result.length ? data.result[0] : {
				name: userInfo.name || "",
				gender: userInfo.gender || 0,
				description: "",
				imageUrls: "",
				realName: userInfo.name || "",
				phoneNumber: userInfo.phoneNumber || ""
			};
		});

		$.when(getVoteInfo, getSignUpInfo).done(function() {
			SignupRequires = makeRequires();
			var fieldsHTML = makeFields(SignupRequires, controller.namespace);

			$("#content").html(template("app/templates/vote/ugc/signup", {
				signup: SignUpInfo
			}));
			$("#VoteSignup").html(fieldsHTML);

			if (SignUpInfo.state == 'APPROVE') {
				fieldsHTML.off('click.' + controller.namespace);
				fieldsHTML.find('button[removeImage]').addClass('hide');
				fieldsHTML.find('.image-add').addClass('hide');
			};

			if (!SignUpInfo.state && !validateSignUpTime()) {
				return Helper.alert("当前时间不可报名！", function() {
					Helper.execute(controller.actions.goBack);
				});
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(callback);
		});
	};

	function makeRequires() {
		var userInfo = Application.user.info;

		var fields = [{
			id: 'name',
			rank: 1,
			required: true,
			name: '名称',
			type: 'TEXT',
			value: SignUpInfo.name || userInfo.name
		}, {
			id: "gender",
			rank: 2,
			required: true,
			name: "性别",
			type: "RADIO",
			selected: !!SignUpInfo.gender,
			options: [{
				id: "1",
				name: "男",
				selected: SignUpInfo.gender == 1
			}, {
				id: "2",
				name: "女",
				selected: SignUpInfo.gender == 2
			}]
		}, {
			id: 'description',
			rank: 3,
			required: true,
			name: '简介',
			type: 'TEXTAREA',
			value: SignUpInfo.description
		}, {
			id: 'imageUrls',
			rank: 4,
			required: true,
			name: '照片',
			type: "IMAGE",
			options: {
				limit: 1
			},
			values: SignUpInfo.imageUrls ? SignUpInfo.imageUrls.split(",") : []
		}, {
			id: 'realName',
			rank: 5,
			required: true,
			name: '联系人',
			type: 'TEXT',
			value: SignUpInfo.realName
		}, {
			id: 'phoneNumber',
			rank: 6,
			required: true,
			name: '手机号',
			type: 'TEXT',
			value: SignUpInfo.phoneNumber
		}];


		return fields;
	};

	function fieldsToData() {
		var data = {};
		$.each(SignupRequires, function(idx, item) {
			if (item.id == "name" || item.id == "description" || item.id == "realName" || item.id == "phoneNumber") {
				data[item.id] = item.value;
			} else if (item.id == "imageUrls") {
				data.imageUrls = item.values.join(",");
			} else if (item.id == "gender") {
				data.gender = +item.options.objOfAttr("selected", true).id;
			}
		});

		return data;
	};

	function validateSignUpTime() {
		var currentServerTime = ServerClientTimeDifference + new Date().getTime();
		var isActive = VoteInfo.startDate <= currentServerTime && VoteInfo.endDate >= currentServerTime;

		return isActive;
	};

	module.exports = Controller;
});