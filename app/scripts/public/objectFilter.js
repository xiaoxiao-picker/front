/*
 * 处理由ajax请求返回的带null的数据对象
 * 如果属性中值为null，则将null置为{}
 */
define(function(require, exports, module) {

	function filter(data) {
		if (isNull(data)) {
			return {};
		} else if (isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				data[i] = filter(data[i]);
			};
		} else if (isObject(data)) {
			for (var attr in data) {
				data[attr] = filter(data[attr]);
			}
		}
		return data;
	}

	module.exports = filter;

	function isNull(obj) {
		return Object.prototype.toString.call(obj) === "[object Null]";
	}

	function isArray(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	function isObject(obj) {
		return Object.prototype.toString.call(obj) === "[object Object]";
	}
});