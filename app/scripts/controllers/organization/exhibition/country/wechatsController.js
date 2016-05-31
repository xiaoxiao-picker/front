define(function(require, exports, module) {
	require("styles/organization.css");

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var ExhibitionService = require("ExhibitionService");

	var temp, orgId, title, limit;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "exhibition.country.wechats";
		_controller.actions = {
			loadMore: function() {
				var _btn = this;

				loadMore(_controller, _btn);
			},
			showQRCode: function() {
				var _btn = this;
				var wechatId = _btn.attr('data-value');
				var wechat = _controller.wechats.objOfAttr('id', wechatId);

				var modal = Helper.modal({
					closeButton: true
				});
				modal.html(template('app/templates/public/qrcode', {
					qrCodeUrl: wechat.qrUrl,
					name: wechat.name
				}));
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

		temp = 'app/templates/organization/exhibition/country/wechats';
		orgId = Application.organization.id;
		exhibitionId = Helper.param.hash("eid");
		title = decodeURIComponent(Helper.param.search("title"));
		this.backURL = '#organization/' + orgId + '/exhibition/' + exhibitionId + '/info/country';
		limit = +Helper.param.search('limit') || 10;

		if (title) {
			Helper.storePageTitle(orgId, "exhibitionWechats", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "exhibitionWechats") || "全部组织";
		Helper.setTitle(title);

		this.wechats = [];
		this.count = 0;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		var organization = Application.organization.info;
		// 微信分享用
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(this.title, imgUrl, organization.name, window.location.href);

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		ExhibitionService.school.wechat.count(exhibitionId).done(function(data) {
			controller.count = data.result;
			$("#content").html(template(temp, {
				orgId: orgId
			}));
			$(".btn-more").trigger("click");
			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.wechats.length) {
					$(".btn-more").trigger("click");
				}
			});

		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function loadMore(controller, btn) {
		Helper.begin(btn);
		getWechats(controller, function(wechats) {
			$("#Wechats").append(template('app/templates/organization/exhibition/country/wechats-inner', {
				orgId: orgId,
				wechats: wechats
			}));
			var complete = controller.count <= controller.wechats.length;
			btn.parents('.more-container')[complete ? 'addClass' : 'removeClass']('complete');

			Helper.end(btn);
		});
	};

	function getWechats(controller, success, error) {
		controller.state = 'loading';

		var skip = controller.wechats.length;
		ExhibitionService.school.wechat.getList(exhibitionId, skip, limit).done(function(data) {
			var wechats = data.result;
			controller.wechats = controller.wechats.concat(wechats);
			success(wechats);
		}).fail(function(errorMsg) {
			Helper.errorToast(errorMsg);
		}).always(function() {
			controller.state = 'complete';
		});
	};



	module.exports = Controller;
});