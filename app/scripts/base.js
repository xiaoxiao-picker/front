define(function(require, exports, module) {
	// 如果为移动设备，则为加载fastclick.js，以消除300ms的click延迟
	var browser = require("browser");
	if (browser.isMobile) {
		SUI.use("plugins/fastclick", function() {
			if ('addEventListener' in document) {
				FastClick.attach(document.body);
			}
		});
	};
});

