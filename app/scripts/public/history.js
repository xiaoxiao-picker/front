define(function(require, exports, module) {
	var HISTORY_NAME = "URLS";
	var LAST_VISIT_TIME = "LAST_VISIT_TIME";
	var CHACHE_TIME = 10 * 60 * 1000; // 缓存10分钟

	var currentTime = new Date().getTime();

	var latestVisitTime; //最后访问页面时间

	var LocalHistory = {
		urls: function() {
			return store.get(HISTORY_NAME, []);
		},
		clear: function() {
			store.remove(HISTORY_NAME);
		},
		push: function(url) {
			var urls = this.urls();
			urls.push(url);
			store.set(HISTORY_NAME, urls);
			store.set(LAST_VISIT_TIME, new Date().getTime());
		},
		back: function(defaultURL) {
			var urls = this.urls();
			var length = urls.length;
			var url;
			if (length <= 1) {
				url = defaultURL;
			} else {
				url = urls[length - 2];
				urls.splice(length - 2, 2);
				store.set(HISTORY_NAME, urls);
			}
			window.location.href = url;
		}
	};

	try {
		latestVisitTime = +store.get(LAST_VISIT_TIME, 0);
	} catch (error) {
		latestVisitTime = 0;
		LocalHistory.clear();
	}


	// 如果上一次最后访问时间离当前时间超过10分钟，则清空浏览记录缓存
	if (latestVisitTime && (currentTime - latestVisitTime > CHACHE_TIME)) {
		LocalHistory.clear();
	}
	latestVisitTime = currentTime;
	store.set(LAST_VISIT_TIME, latestVisitTime);

	

	// 如果之前最后一次访问地址与当前不同，则清空
	var urls = LocalHistory.urls();
	var length = urls.length;
	if (length && urls[length - 1] != window.location.href) {
		LocalHistory.clear();
	}

	module.exports = LocalHistory;
});