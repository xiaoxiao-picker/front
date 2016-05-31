define(function(require, exports, module) {
	var $ = SUI.$;
	var Helper = require("helper");

	var namespace = "modalbox";

	/**
	 *	options
	 *	@param	title			标题
	 *	@param	closeAction		关闭事件
	 *	@param	modalId			模态层ID(必要)
	 *	@param	navId			导航栏ID
	 *	@param	template
	 *	...
	 */
	var ModalBox = function(options) {
		this.options = options;
		addListeners(this);
	};

	ModalBox.prototype.render = function() {
		var modalBox = this;
		
		if (modalBox.options.navId) {
			var tabsHeader = modalBox.options.navId.parents(".xx-inner-header");
			tabsHeader.animate({
				opacity: "0.0"
			}, 200);
		}

		modalBox.options.modalId.html(modalBox.options.template('app/templates/public/modal-box', {
			title: modalBox.options.title,
			closeAction: modalBox.options.closeAction ? modalBox.options.closeAction : "closeModal"
		}));
		modalBox.options.modalId.find(".xx-shadow-box").css({
			opacity: "0.0"
		});
		modalBox.options.modalId.find(".xx-shadow-box").animate({
			opacity: "1.0"
		}, 300);
	};

	ModalBox.prototype.close = function() {
		var modalBox = this;

		modalBox.options.modalId.html("");

		if (modalBox.options.navId) {
			var tabsHeader = modalBox.options.navId.parents(".xx-inner-header");
			tabsHeader.css({
				opacity: "1.0"
			});
		}
		this.options.modalId.off("." + namespace);
	};

	// 事件监听
	function addListeners(box) {
		var close = box.options.close;
		box.options.modalId.on("click." + namespace, ".btn-close", function() {
			box.close();
			close && $.isFunction(close) && close.call(box, $(this));
		});
	};

	module.exports = ModalBox;
});