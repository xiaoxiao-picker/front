define(function(require,exports,module){
	var routerObj = require("scripts/router");
	var route = function(url) {
		if(routerObj.hasOwnProperty(url)) {
			return routerObj[url];
		} else {
			for(route in routerObj) {
				if(routerObj[route].hasOwnProperty('regExp')) {
					var routeRegExp = new RegExp(routerObj[route].regExp);
					if(routeRegExp.test(url)) {
						/**
						 * Fix Bug: 修复多个参数无法获取到的问题
						 */
						var valueArr = url.match(routeRegExp),
							paramArr = route.match(/:([\w]*)/g);
						for(var i=1,len=valueArr.length;i<len;i++) {
							routerObj[route][paramArr[i-1].slice(1)] = valueArr[i];
						}
						return routerObj[route];
					}
				}
			}
			return null;
		}
	};
	module.exports = route;
});