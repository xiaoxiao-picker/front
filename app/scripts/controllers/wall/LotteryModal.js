define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	function LotteryModal(qrcodeURL, options) {
		var modal = this;
		this.state = "closed";
		this.options = options = $.extend({}, options);
		var messageBox = options.container;
		modal.commentBox = messageBox.find("#COMMENTLIST");
		modal.lotteryBox = $(template("app/templates/wall/lottery-qrcode", {
			qrcodeURL: qrcodeURL
		}));
		modal.lotteryBox.on("click.wall-qrcode", ".btn-close", function() {
			modal.destroy();
		});
		modal.lotteryBox.appendTo(messageBox);
	}


	LotteryModal.prototype.open = function() {
		this.lotteryBox.show();
		this.commentBox.css("visibility", "hidden");
		this.state = "opened";
		return this;
	};

	LotteryModal.prototype.destroy = function() {
		this.lotteryBox.hide();
		this.commentBox.css("visibility", "");
		Helper.execute(this.options.destroy);
		this.state = "closed";
		return this;
	};

	module.exports = function(qrcodeURL, options) {
		return new LotteryModal(qrcodeURL, options);
	};
});