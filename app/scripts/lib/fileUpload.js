define(function(require, exports, module) {
	var Helper = require("helper");
	var Application = require("factory.application");
	exports.upload = function(file, options) {
		options = $.extend({
			url: '/api-front/picture/upload',
			session: Application.getSession(),
			maxSize: 2, // 单位M
			success: function() {},
			error: function() {},
			progress: function() {}
		}, options);
		if (!file) {
			return;
		}
		if (file.size > options.maxSize * 1000 * 1024) {
			return Helper.alert("上传图片不能大于" + options.maxSize + "M！");
		}
		var xhr = new XMLHttpRequest();
		var data = new FormData();
		data.append("session", options.session);
		data.append("uploadfile", file);
		data.append("filename", file.name);

		// 如果有进度方法则监听事件
		xhr.upload.addEventListener("progress", function(evt) {
			if (evt.lengthComputable) {
				options.progress((evt.loaded / evt.total) * 100);
			} else {
				// No data to calculate on
			}
		}, false);

		xhr.open("post", options.url, true);
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		// Set appropriate headers
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				// 上传成功的处理方法
				if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
					options.success(xhr.responseText);
				} else { // 上传失败的处理，移除预览
					options.error(xhr.statusText);
				}
				xhr = null;
			}
		}
		xhr.send(data);
	};
});