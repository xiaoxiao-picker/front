define(function(require, exports, module) {
	require('base');
	var $ = SUI.$;
	var Toast = require('toast');
	var sysConfig = require('config');
	var regulars = sysConfig.regulars;

	/**
	 * 单个表单验证方法
	 * @param  {String} value         表单的值
	 * @param  {String} rules          表单的验证规则
	 * @param  {Function} fnCallback    正确的处理方法
	 * @param  {Function} errorCallback 错误的处理方法
	 */
	var formValid = function(value, rules, fnCallback, errorCallback) {
		var result = true;
		value = $.trim(value);
		rules = rules.split('|');
		$.each(rules, function(k, v) {
			if (result) {
				switch (v) {
					// 验证规则
					case 'email':
						if (!regulars.email.test(value))
							result = false;
						break;
					case 'phone':
						if (!regulars.phoneNumber.test(value))
							result = false;
						break;
					case 'require':
						if (!value)
							result = false;
						break;
					case 'number':
						if (!$.isNumeric(value))
							result = false;
						break;
					case 'money':
						if (!regulars.money.test(value))
							result = false;
						break;
					case 'int':
						if (!regulars.Int.test(value))
							result = false;
						break;
					case 'intNull':
						if (!regulars.intNull.test(value))
							result = false;
						break;
					case 'notNum':
						if ($.isNumeric(value))
							result = false;
						break;
					case 'longitude':
						if (!regulars.longitude.test(value)) {
							result = false;
						}
						break;
					case 'latitude':
						if (!regulars.latitude.test(value)) {
							result = false;
						}
						break;
				}
			}
		});
		if (!result) {
			errorCallback && $.isFunction(errorCallback) && errorCallback();
			return false;
		} else {
			fnCallback && $.isFunction(fnCallback) && fnCallback();
			return true;
		}
	};

	/**
	 * validate all the input which has attr 'data-validate-rule',return 'true' when all through else return 'false'
	 * @param  {jquery obj} form 		the form need validation
	 * @return {boolean}
	 */
	var formValidate = function(form) {
		var validateResult = true,
			validateMsg;
		form.find("[data-validate-rule]").each(function(idx, item) {
			var tips = $(item).attr("data-tips") || $(item).attr("placeholder");
			if (!validate(item)) {
				validateResult = false;
				validateMsg = tips;
				errMsg(validateMsg, 2000);
				return;
			}
		});
		return validateResult;
	};

	function validate(input) {
		var $this = $(input),
			rule = $this.attr("data-validate-rule"),
			tips = $this.attr("data-tips"),
			value = $this.val();
		return formValid(value, rule, function() {
			$this.parents(".form-group").removeClass("has-error");
		}, function() {
			$this.parents(".form-group").addClass("has-error");
			$this.attr("value", "").attr("placeholder", tips);
		});
	}

	/**
	 * 验证表单，并在所有表单验证正确的时候返回表单数据
	 * @param  {String} sel     [表单选择器]
	 * @param  {Object} options [配置参数]
	 * @return {Boolean|Object} [当错误时返回false，正确时返回所有的对象]
	 */
	var getFormData = function(sel, options) {
		options = options || {};
		var $form = $(sel),
			data = {},
			error = false,
			dataArray = $form.serializeArray(),
			parentNodeCondition = options.parentNodeCondition || ".form-group",
			parentNodeErrorClass = options.parentNodeErrorClass || "has-error";
		$form.find("[data-validate-rule]:not(.hide)").each(function(k, v) {
			var _val = $(v).val(),
				tips = $(v).attr("data-tips") || $(v).attr("placeholder"),
				_rule = $(v).attr("data-validate-rule");
			formValid(_val, _rule, function() {
				$(v).parents(parentNodeCondition).removeClassparentNodeErrorClass
			}, function() {
				errMsg(tips);
				$(v).parents(parentNodeCondition).addClass(parentNodeErrorClass);
				error = true;
			});
		});
		!error && $.map(dataArray, function(obj) {
			if (/\[\]$/.test(obj.name)) { // 处理checkbox,radio等name后面带[]的情况
				var tmpName = obj.name.match(/^(.*)\[\]$/, "")[1];
				if (!data.hasOwnProperty(tmpName))
					data[tmpName] = [];
				data[tmpName].push($.isNumeric(obj.value) ? +obj.value : obj.value);
			} else if (obj.name.indexOf("->") != -1) { // 强类型转换,处理
				var result = obj.name.match(/^(.*)(\-\>(.*))/),
					tmpName = result[1],
					type = result[3];
				switch (type) {
					case 'String':
						data[tmpName] = "" + obj.value;
						break;
					case 'Integer':
						data[tmpName] = +obj.value;
						break;
					default:
						data[tmpName] = "" + obj.value;
						break;
				}
			} else {
				// Name start with * will not be considered
				// 忽略以*开始的name的字段
				// 默认做自动类型转换，数字为数字，文本为String
				if (!(obj.name.charCodeAt(0) == 42))
				// data[obj.name] = $.isNumeric(obj.value) ? +obj.value : obj.value;
				// fixed:默认为string，若需要Integer则需要设定name="AAA->Integer"
					data[obj.name] = obj.value;
			}
		});
		return error ? false : $.extend(data, options);
	};

	exports.formValid = formValid;
	exports.formValidate = formValidate;
	exports.getFormData = getFormData;
	exports.isEmail = function(value) {
		return regulars.email.test(value);
	};
	exports.isPhoneNumber = function(value) {
		return regulars.phoneNumber.test(value);
	};

	function errMsg(message) {
		Toast.toast(message, {
			theme: 'danger'
		});
	};
});