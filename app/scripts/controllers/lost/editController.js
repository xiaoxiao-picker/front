define(function(require, exports, module) {
	require('styles/lost.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LostService = require("LostService");

	var temp, orgId, lostId, status;

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var Controller = function() {
		var _controller = this;
		this.namespace = "lost.edit";
		this.actions = {
			save: function() {
				var btn = this;
				var messages = REQUIREINFO.validateFields(Requires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				Application.user.withinPhoneNumber((status == 'LOST' ? "编辑失物招领" : "编辑寻物启事") + "需要绑定手机号码！", function() {
					LostService.add(orgId, fieldsToData()).done(function(data) {
						Helper.successToast('创建成功!');
						Helper.jump('#organization/' + orgId + '/lost/list?status=' + status);
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(btn);
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
		var controller = this;
		this.recordURL();
		this.callback = callback;

		temp = 'app/templates/lost/edit';
		orgId = Application.organization.id;
		status = Helper.param.search('status') || 'LOST';
		this.backURL = "#organization/" + orgId + '/lost/list?status=' + status;

		this.render();

		// 确保用户已绑定手机号
		if (!Application.user.info.phoneNumber) {
			Helper.confirm((status == 'LOST' ? "编辑失物招领" : "编辑寻物启事") + "需要绑定手机号码！", function() {
				require.async("lib.phoneBindBox", function(PhoneBindBox) {
					PhoneBindBox({
						success: controller.render
					});
				});
			});
		}


	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: status == 'LOST' ? "编写失物招领" : "编写寻物启事",
			user: Application.user.info
		}));

		Requires = makeRequires();
		var fieldsHTML = makeFields(Requires, controller.namespace);

		$("#content").html(template(temp, {}));
		$("#LostEdit").html(fieldsHTML);

		Helper.execute(controller.callback);
	};

	function makeRequires() {
		var typeName = status == 'LOST' ? "拾物" : "失物";

		var texts = [{
			id: 'lost-title',
			rank: 1,
			required: true,
			title: typeName + '名称',
			type: 'TEXT'
		}, {
			id: 'lost-address',
			rank: 3,
			required: true,
			title: typeName + '地点',
			type: 'TEXT'
		}, {
			id: 'lost-description',
			rank: 4,
			required: true,
			title: typeName + '简介',
			type: 'TEXTAREA'
		}, {
			id: 'lost-name',
			rank: 5,
			required: true,
			title: 'name',
			type: 'TEXT'
		}, {
			id: 'lost-phone',
			rank: 6,
			required: true,
			title: 'phoneNumber',
			type: 'TEXT'
		}, {
			id: 'lost-qq',
			rank: 7,
			required: false,
			title: 'QQ号码',
			type: 'TEXT'
		}];
		var dates = [{
			id: 'lost-date',
			rank: 2,
			required: true,
			title: typeName + '时间'
		}];
		var images = [{
			id: 'lost-images',
			rank: 8,
			required: false,
			title: typeName + '照片或样品图'
		}];

		var fields = REQUIREINFO.makeRequiredInfos(texts, dates, [], images);

		$(fields).each(function(idx, field) {
			if (["name", "phoneNumber"].indexOf(field.title) > -1) {
				field.value = Application.user.info[field.title];
			}

			if (field.type == "IMAGE") {
				field.values = [];
			}
		});

		return fields;
	};

	function fieldsToData() {
		var data = {
			type: status,
			contactInfo: {}
		};
		$.each(Requires, function(idx, item) {
			switch (item.rank) {
				case 1:
					data.title = item.value;
					break;
				case 2:
					data.eventDate = item.value;
					break;
				case 3:
					data.location = item.value;
					break;
				case 4:
					data.text = item.value;
					break;
				case 5:
					data.contactInfo.name = item.value;
					break;
				case 6:
					data.contactInfo.phone = item.value;
					break;
				case 7:
					data.contactInfo.qq = item.value;
					break;
				case 8:
					data.picUrls = item.values.join(',');
					break;
			};
		});

		data.contactInfo = JSON.stringify(data.contactInfo);

		return data;
	};

	module.exports = Controller;
});