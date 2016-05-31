/**
 * 选择型表单
 */
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	var ChoiceBox = function(options) {
		options = $.extend({
			title: "",
			options: [],
			theme: 'black',
			type: "RADIO",
			container: $(document.body),
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
		modal.html(template("app/templates/public/form/choicebox", {
			// 标题
			title: "请选择" + options.title,
			// 可选项
			options: options.options,
			type: options.type,
			namespace: modal.namespace
		}));

		addListenner(modal);
		Helper.fixed.done();
	}

	function addListenner(modal) {
		var confirm = modal.options.success;
		modal.addAction(".btn.btn-choice-confirm", "click", function() {
			var $checkedInputs = modal.box.find("[name='" + modal.namespace + "']:checked");
			var values = [];
			$($checkedInputs).each(function(idx, item) {
				values.push($(item).val());
			});
			modal.values = values;
			confirm && $.isFunction(confirm) && confirm.call(modal, values, $(this));
			modal.destroy();
		});
		modal.addAction(".btn.btn-close", "click", function() {
			modal.box.addClass("out");
			modal.destroy();
		});
		if (modal.options.type == "RADIO") {
			modal.addAction("[name='" + modal.namespace + "']", "change", function() {
				if ($(this).prop("checked")) {
					modal.box.find("[name='" + modal.namespace + "']").not($(this)).prop("checked", false);
				}
			});
		}
	};

	module.exports = ChoiceBox;
});