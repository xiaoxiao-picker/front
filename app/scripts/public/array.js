define(function(require, exports, module) {
	(!Array.prototype.indexOf) && (
		Array.prototype.indexOf = function(elt) {
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0)
				from += len;
			for (; from < len; from++) {
				if (from in this &&
					this[from] === elt)
					return from;
			}
			return -1;
		}
	);

	Array.prototype.clone = function() {
		return this.concat();
		// return [].concat(this);
		// return this.slice(0);
	};

	Array.prototype.remove = function(value) {
		var index = this.indexOf(value);
		return this.splice(index, 1);
	};
	Array.prototype.removeByAttr = function(attr, attrValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasOwnProperty(attr) && this[i][attr] == attrValue)
				this.splice(i, 1);
		};
		return this;
	};

	// 该方法仅对对象组成的数组有效
	// 获取数组中第一个key,value相匹配的索引
	Array.prototype.indexOfByAttr = function(attr, attrValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasOwnProperty(attr) && this[i][attr] == attrValue)
				return i;
		};
		return -1;
	};
	Array.prototype.indexOfAttr = function(attr, attrValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasOwnProperty(attr) && this[i][attr] == attrValue)
				return i;
		};
		return -1;
	};
	Array.prototype.objOfAttr = function(attr, attrValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].hasOwnProperty(attr) && this[i][attr] == attrValue)
				return this[i];
		};
		return undefined;
	};
	// 该方法仅对对象组成的数组有效
	// 获取数组中对象属性的集合
	Array.prototype.arrayOfAttr = function(attr) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			result.push(this[i][attr]);
		};
		return result;
	};
	// 该方法仅对对象组成的数组有效
	// 返回对象属性与值集合相匹配的对象
	Array.prototype.arrayWidthObjAttrs = function(attr, values) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (values.indexOf(this[i][attr]) != -1)
				result.push(this[i]);
		};
		return result;
	};
	Array.prototype.arrayWidthOutObjAttrs = function(attr, values) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (values.indexOf(this[i][attr]) == -1)
				result.push(this[i]);
		};
		return result;
	};
	Array.prototype.arrayWidthObjAttr = function(attr, value) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (value == this[i][attr])
				result.push(this[i]);
		};
		return result;
	};
	// demos
	// var array = [{
	// 	name: "picker",
	// 	gender: "male",
	// 	age: 20
	// }, {
	// 	name: "miko",
	// 	gender: "female",
	// 	age: 18
	// }];
	// console.log(array.indexOfAttr("name","picker")); 
	// console.log(array.objOfAttr("name","picker")); 
	// console.log(array.arrayOfAttr("name")); 
	// console.log(array.arrayInObjAttrs("name",["picker","miko"])); 
});