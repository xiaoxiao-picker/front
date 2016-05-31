/**
 * 输入框表单
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	/**
	 ****************** TextBox ******************
	 */
	var TextBox = function(options) {
		options = $.extend({
			title: "",
			value: "",
			placeholder: "",
			yesText: "确定",
			noText: "取消",
			type: "TEXT", // TEXT,TEXTAREA
			required: false, // 必填
			container: $(document.body), // 容器
			theme: "black",
			position: "top",
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
		modal.html(template("app/templates/public/form/textbox", {
			// 标题
			title: options.title,
			// 初始值
			value: options.value,
			// 提示语
			placeholder: options.placeholder,
			// 确认按钮值
			yesText: options.yesText,
			// 取消按钮值
			noText: options.noText,
			// 输入数据要求&正则表达式
			valueType: options.valueType,
			// 输入框类型，默认为text。可选[text,textarea]
			type: options.type,
			required: options.required
		}));

		addListenner(modal);

		Helper.fixed.done();

		// 输入框获取焦点
		// setTimeout(function() {
		// 	var $input = modal.box.find(".xx-input");
		// 	var input = $input.get(0);
		// 	if (input.setSelectionRange) {
		// 		input.setSelectionRange(input.value.length, input.value.length);
		// 		input.focus();
		// 	}
		// }, 500);
	}


	function addListenner(modal) {
		var confirm = modal.options.success;
		modal.addAction(".btn.btn-yes", "click", function() {
			var value = modal.box.find(".xx-input").val();
			modal.value = value;
			confirm && $.isFunction(confirm) && confirm.call(modal, $(this));
		});
		modal.addAction(".btn.btn-no", "click", function() {
			modal.box.addClass("out");
			modal.destroy();
		});
	};
	module.exports = TextBox;
});