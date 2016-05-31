define(function(require, exports, module) {
	"use strict";
	var regulars = {
		require: /.{1,}/,
		empty: /^\s*$/,
		phoneNumber: /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/,
		email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		password: /^[\w\W]{6,23}$/,
		authCode: /^[0-9]{4,6}$/,
		money: /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(.[0-9]{1,2})?$/, // money
		Int: /^[0-9]+$/, // int only
		intNull: /^[0-9]*$/, // int & null
		rtrim: /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, // clean space of string
		// longitude: /^(-?((180)|(((1[0-7]\d)|(\d{1,2}))(\.\d+)?)))$/, // 经度
		// latitude: /^(-?((90)|((([0-8]\d)|(\d))(\.\d+)?)))$/ // 纬度
	};

	exports.isEmpty = function(value) {
		return regulars.empty.test(value);
	};
	exports.isPhoneNumber = function(value) {
		return regulars.phoneNumber.test(value);
	};
	exports.isEmail = function(value) {
		return regulars.email.test(value);
	};
	exports.isPassword = function(value) {
		return regulars.password.test(value);
	};
	exports.isAuthCode = function(value) {
		return regulars.authCode.test(value);
	};
	exports.isInt = function(value) {
		return regulars.Int.test(value);
	};
	exports.isIntNull = function(value) {
		return regulars.intNull.test(value);
	};
	exports.isArray = function(obj) {
		// http://www.nowamagic.net/librarys/veda/detail/1250
		return Object.prototype.toString.call(obj) === '[object Array]';
	};
});