define(function(require, exports, module) {
	require('styles/lost.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');
	var LostService = require("LostService");

	var temp, orgId, lostId;

	var Controller = function() {
		var controller = this;
		this.namespace = "lost.info";
		this.actions = {
			remove: function() {
				var _btn = this;

				var text = status == "LOST" ? "失物招领" : "寻物启事";

				Helper.confirm("确定删除该" + text + "?", {}, function() {
					Helper.begin(_btn);
					LostService.remove(lostId).done(function(data) {
						Helper.alert('删除成功!', function() {
							Helper.jump('#organization/' + orgId + 'lost/list?status=' + status);
						});
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			finish: function() {
				var _btn = this;

				var text = status == "LOST" ? "已归还失主" : "已找到失物";

				Helper.confirm("确定" + text + "?", {}, function() {
					Helper.begin(_btn);
					LostService.changeStatus(lostId, true).done(function(data) {
						Helper.successToast(text);
						controller.render();
					}).fail(function(error) {
						Helper.errorAlert(error);
					}).always(function() {
						Helper.end(_btn);
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
		this.callback = callback;
		this.recordURL();
		temp = 'app/templates/lost/info';
		orgId = Helper.param.hash("oid") || Application.organization.id;
		userId = Application.user.info.id;
		lostId = Helper.param.hash("lid");
		status = Helper.param.search('status') || 'LOST';
		this.backURL = '#organization/' + orgId + '/lost/list?status=' + status;

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: status == 'LOST' ? "招领详情" : "寻物详情",
			user: Application.user.info
		}));

		LostService.get(lostId).done(function(data) {
			controller.lostInfo = makeLost(data.result);
			Helper.setTitle(controller.lostInfo.title);

			$("#content").html(template(temp, {
				orgId: orgId,
				lostId: lostId,
				userId: userId,
				status: status,
				lost: controller.lostInfo
			}));

			wechatShare(controller, controller.lostInfo);
			checkImage(controller);
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	function makeLost(data) {
		data.contactInfo = $.parseJSON(data.contactInfo);
		data.picUrls = data.picUrls && data.picUrls.split(',') || [];

		return data;
	};

	// 微信分享
	function wechatShare(controller, lostInfo) {
		var shareTitle = lostInfo.title + " - " + Application.organization.info.name;
		var shareImage = lostInfo.picUrls.length ? lostInfo.picUrls[0] + "@300w_300h_1e_1c" : "";
		var shareDesc = lostInfo.text;
		var shareUrl = lostInfo.shareUrl || window.location.href;
		controller.share(shareTitle, shareImage, shareDesc, shareUrl);
	};

	// 查看图片
	function checkImage(controller) {
		if (window.wx) {
			$(".images-wrapper img").on("click." + controller.namespace, function() {
				var image = this.src.substring(0, this.src.indexOf('@'));
				wx.previewImage({
					current: image,
					urls: controller.lostInfo.picUrls
				});
			});
		} else {
			$(document).on("click." + controller.namespace, ".images-wrapper img", function() {
				var image = this.src.substring(0, this.src.indexOf('@'));
				require.async("scripts/lib/ImageBox", function(ImageBox) {
					new ImageBox(image);
				});
			});
		}
	};

	module.exports = Controller;
});