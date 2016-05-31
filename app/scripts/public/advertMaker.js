define(function(require, exports, module) {
	module.exports = function(advertisementCode) {
		advertisementCode = advertisementCode || "暂无广告来源";
		return '<section class="advert-box"><div class="line"><hr></div><h4><span>广告</span></h4><div class="advert-content">' + advertisementCode + '</div></section>';
	};
});