/**
 * 输入框表单
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	/**
	 ****************** DateBox ******************
	 */
	var DateBox = function(options) {
		options = $.extend({
			title: "",
			value: "",
			placeholder: "",
			yesText: "确定",
			noText: "取消",
			type: "DATE", // DATE,DATETIME
			required: false, // 必填
			container: $(document.body), // 容器
			theme: "black",
			destroy: function() {
				Helper.fixed.cancel();
			}
		}, options);
		var modal = Helper.modal(options);
		init(modal);
		return modal;
	};

	function init(modal) {
		var options = modal.options;
		modal.html(template("app/templates/public/form/datebox", {
			// 标题
			title: options.title,
			// 初始值
			value: options.value,
			// 提示语
			placeholder: options.placeholder
		}));

		Helper.fixed.done();

		// 输入框获取焦点
		setTimeout(function() {
			var $input = modal.box.find(".xx-input");
			var input = $input.get(0);
			if (input.setSelectionRange) {
				input.setSelectionRange(input.value.length, input.value.length);
				input.focus();
			}
		}, 500);
	}
	module.exports = DateBox;
});