define(function(require, exports, module) {
	require('styles/proposal.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ProposalService = require("ProposalService");

	var REQUIREINFO = require("REQUIREINFO");
	var makeFields = require("lib.makeFields");

	var orgId;

	var Controller = function() {
		var controller = this;
		this.namespace = "proposal.edit";
		this.actions = {
			save: function() {
				var $btn = this;

				var messages = REQUIREINFO.validateFields(Requires);
				if (messages.length > 0) {
					Helper.errorToast(messages[0]);
					return;
				}

				Helper.begin($btn);
				ProposalService.add(orgId, fieldsToData()).done(function(data) {
					Helper.alert("提交成功！");
					Helper.jump('#organization/' + orgId + '/proposals');
				}).fail(function(error) {
					Helper.errorAlert(error);
				}).always(function() {
					Helper.end($btn);
				});
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function() {
		var controller = this;
		this.recordURL();

		orgId = Application.organization.id;
		this.templateUrl = 'app/templates/proposal/edit';
		this.backURL = '#organization/' + orgId + '/proposals?status=user';

		this.render();

		// 确保用户已绑定手机号
		if (!Application.user.info.phoneNumber) {
			Helper.confirm("编辑内容需要绑定手机号码！", function() {
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

		Helper.setTitle("编辑");

		$("#header").html(template("app/templates/public/header", {
			title: '编辑',
			user: Application.user.info
		}));

		Application.organization.getProposalCategoryList().done(function() {
			Requires = makeRequires();
			var fieldsHTML = makeFields(Requires, controller.namespace);

			$("#content").html(template(controller.templateUrl, {}));
			$("#ProposalEdit").html(fieldsHTML);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});



	};

	function makeRequires() {
		var categories = Application.organization.proposalCategories.clone();

		var fields = [{
			id: "categoryId",
			rank: 1,
			required: true,
			name: "分类",
			type: "RADIO",
			options: categories
		}, {
			id: 'title',
			rank: 2,
			required: true,
			name: '标题',
			type: 'TEXT'
		}, {
			id: 'description',
			rank: 3,
			required: true,
			name: '内容',
			type: 'TEXTAREA'
		}, {
			id: 'images',
			rank: 4,
			required: false,
			name: '图片',
			type: "IMAGE",
			options: {
				limit: 5
			},
			values: []
		}];

		return fields;
	}

	function fieldsToData() {
		var data = {};
		$.each(Requires, function(idx, item) {
			if (item.id == "categoryId") {
				data.categoryId = item.options.objOfAttr("selected", true).id;
			} else if (item.id == "title") {
				data.title = item.value;
			} else if (item.id == "description") {
				data.text = item.value;
			} else if (item.id == "images") {
				data.thumbnailUrls = item.values.join(',');
			}
		});

		return data;
	}

	module.exports = Controller;
});