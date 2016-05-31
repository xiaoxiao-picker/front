define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	function QRCodeModal(qrcodeURL, options) {
		var modal = this;
		this.state = "closed";
		this.options = options = $.extend({}, options);
		var messageBox = options.container;
		modal.commentBox = messageBox.find("#COMMENTLIST");
		modal.qrcodeBox = $(template("app/templates/wall/wall-qrcode", {
			qrcodeURL: qrcodeURL,
			wechat: Application.organization.wechat
		}));
		modal.qrcodeBox.on("click.wall-qrcode", ".btn-close", function() {
			modal.destroy();
		});
		modal.qrcodeBox.appendTo(messageBox);
	}


	QRCodeModal.prototype.open = function() {
		this.qrcodeBox.show();
		this.commentBox.css("visibility", "hidden");
		this.state = "opened";
		return this;
	};

	QRCodeModal.prototype.destroy = function() {
		this.qrcodeBox.hide();
		this.commentBox.css("visibility", "");
		Helper.execute(this.options.destroy);
		this.state = "closed";
		return this;
	};

	module.exports = function(qrcodeURL, options) {
		return new QRCodeModal(qrcodeURL, options);
	};
});