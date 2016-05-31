define(function(require, exports, module) {
	//转化时间格式
	//如date.Format("yyyy-MM-dd")  --->2012-01-02
	Date.prototype.Format = function(format) {
		var o = {
				"M+": this.getMonth() + 1,
				"d+": this.getDate(),
				"h+": this.getHours(),
				"m+": this.getMinutes(),
				"s+": this.getSeconds(),
				"q+": Math.floor((this.getMonth() + 3) / 3),
				"S": this.getMilliseconds()
			}
			//RegExpObject.test(string):如果字符串 string 中含有与 RegExpObject 匹配的文本，则返回 true，否则返回 false。
			//   /(y+)/(正则)匹配前面的子表达式一次或多次。例如，'zo+' 能匹配 "zo" 以及 "zoo"，但不能匹配 "z"。+ 等价于 {1,}。
		if (/(y+)/.test(format)) {
			//RegExp.$1表示匹配到的第一个结果(y表示年)
			format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}
	exports.format = function(date, format) {
		return new Date(parseInt(date)).Format(format);
	};


	/** 
	 * 对日期进行格式化，
	 * @param date 要格式化的日期
	 * @param format 进行格式化的模式字符串
	 *     支持的模式字母有：
	 *     y:年,
	 *     M:年中的月份(1-12),
	 *     d:月份中的天(1-31),
	 *     h:小时(0-23),
	 *     m:分(0-59),
	 *     s:秒(0-59),
	 *     S:毫秒(0-999),
	 *     q:季度(1-4)
	 * @return String
	 * @author yanis.wang
	 * @see	http://yaniswang.com/frontend/2013/02/16/dateformat-performance/
	 */
	Date.prototype.format = function(date, format) {

		date = new Date(date);

		var map = {
			"M": date.getMonth() + 1, //月份 
			"d": date.getDate(), //日 
			"h": date.getHours(), //小时 
			"m": date.getMinutes(), //分 
			"s": date.getSeconds(), //秒 
			"q": Math.floor((date.getMonth() + 3) / 3), //季度 
			"S": date.getMilliseconds() //毫秒 
		};
		format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
			var v = map[t];
			if (v !== undefined) {
				if (all.length > 1) {
					v = '0' + v;
					v = v.substr(v.length - 2);
				}
				return v;
			} else if (t === 'y') {
				return (date.getFullYear() + '').substr(4 - all.length);
			}
			return all;
		});
		return format;
	};

	// 时间比较
	exports.dateDiff = function(start, current) {
		var string;
		var interval = parseInt((current - start) / 1000);
		if (interval < 60) {
			string = "刚刚";
		} else if (interval < 60 * 60) {
			string = parseInt(interval / 60) + "分钟前";
		} else if (interval < 60 * 60 * 24) {
			string = parseInt(interval / (60 * 60)) + "小时前";
		} else if (interval < 60 * 60 * 24 * 7) {
			string = parseInt(interval / (60 * 60 * 24)) + "天前";
		} else {
			string = new Date(parseInt(start)).Format('MM-dd hh:mm');
		}

		return string;
	};

	// 开始时间与结束时间相隔
	exports.distance = function(start, end) {
		var seconds = Math.floor((end - start) / 1000);
		var minutes = Math.floor(seconds / 60);
		var hours = Math.floor(seconds / 60 / 60);
		var days = Math.floor(seconds / 60 / 60 / 24);
		var local; //= (days ? days + "天" : "") + (hours ? hours + "小时") + (minutes ? minutes + "分") + (seconds ? seconds + "秒" : "");
		if (days) {
			local = "<span class='days'>" + days + "</span>天<span class='hours'>" + (hours ? hours % 24 : "") + "</span>小时<span class='minutes'>" + (minutes ? minutes % 60 + "</span>分" : "");
		} else if (hours) {
			local = "<span class='hours'>" + hours + "</span>小时<span class='minutes'>" + (minutes ? minutes % 60 + "</span>分" : "");
		} else if (minutes) {
			local = "<span class='minutes'>" + minutes + "</span>分<span class='seconds'>" + (seconds ? seconds % 60 + "</span>秒" : "");
		} else {
			local = seconds ? "<span class='seconds'>" + seconds + "</span>秒" : "";
		}
		return {
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
			local: local
		};
	};
});