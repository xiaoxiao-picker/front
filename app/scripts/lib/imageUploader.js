define(function(require, exports, module) {
	require("plugins/jcrop/js/jquery.Jcrop.min");
	require("plugins/jcrop/css/jquery.Jcrop.min.css");

	var Helper = require("helper");
	var template = require("template");

	var point1, point2;
	var xsize, ysize;
	var jcrop_api;

	var blobType;
	try {
		new Blob();
		blobType = 1;
	} catch (e) {
		// 安卓中不能直接使用 new Blob()
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
		if (e.name == 'TypeError' && window.BlobBuilder) {
			blobType = 2;
		} else if (e.name == "InvalidStateError") {
			// InvalidStateError (tested on FF13 WinXP)
			blobType = 3;
		} else {
			// We're screwed, blob constructor unsupported entirely   
			blobType = 4;
		}
	}


	function uploader(file, options) {
		if (!file) return;
		var rFilter = /^(image\/jpeg|image\/png)$/i;
		if (!rFilter.test(file.type)) {
			Helper.alert("请选择正确格式的图片（jpg,png）");
			return;
		}



		options = $.extend({
			title: "图片上传",
			position: "top",
			// beforeUpload: function() {},
			// success: function() {},
			// error: function() {},
			// always: function() {},
			jcrop: {
				bgFade: true, // use fade effect
				bgOpacity: .5, // fade opacity
				// minSize: [32, 32], // min crop size
				// aspectRatio: 1, // keep aspect ratio 1:1
			}
		}, options);


		Helper.execute(options.beforeUpload);

		if (blobType == 4) { //blobType == 2 || blobType == 3 ||
			uploadImage(file, file.name, options);
			return;
		}

		var modal = Helper.modal(options);
		modal.file = file;
		modal.image = {};

		modal.html(template("app/templates/public/image-uploader/box", {
			title: options.title
		}));


		// preview element
		var oImage = modal.box.find("#preview").get(0);

		$(oImage).css("maxHeight", $(window).height() - 200);

		// prepare HTML5 FileReader
		var oReader = new FileReader();
		oReader.onload = function(e) {
			// e.target.result contains the DataURL which we can use as a source of the image
			oImage.src = e.target.result;
			oImage.onload = function() { // onload event handler
				// destroy Jcrop if it is existed
				if (typeof jcrop_api != 'undefined') {
					jcrop_api.destroy();
					jcrop_api = null;
				}

				xsize = oImage.naturalWidth / $(oImage).width();
				ysize = oImage.naturalHeight / $(oImage).height();

				addListenner(modal, oImage, file.name);

				setTimeout(function() {
					// initialize Jcrop
					$(oImage).Jcrop($.extend({
						onChange: updateInfo,
						onSelect: updateInfo,
						onRelease: clearInfo
					}, modal.options.jcrop), function() {
						// Store the Jcrop API in the jcrop_api variable
						jcrop_api = this;
						// use the Jcrop API to get the real image size
						var bounds = this.getBounds();

						boundx = bounds[0];
						boundy = bounds[1];
						var point1 = {
							x: boundx / 4, //(boundx - w) / 2,
							y: boundy / 4 //(boundy - h) / 2
						};
						var point2 = {
							x: boundx * 3 / 4, //(boundx - w) / 2 + w,
							y: boundy * 3 / 4 //(boundy - h) / 2 + h
						};

						jcrop_api.animateTo([point1.x, point1.y, point2.x, point2.y]);
					});
				}, 10);

				function updateInfo(c) {
					modal.image.x1 = Math.round(c.x * xsize);
					modal.image.y1 = Math.round(c.y * ysize);
					modal.image.x2 = Math.round(c.x2 * xsize);
					modal.image.y2 = Math.round(c.y2 * ysize);
					modal.image.width = Math.round(c.w * xsize);
					modal.image.height = Math.round(c.h * ysize);
					modal.image.selectedWidth = c.w;
					modal.image.selectedHeight = c.h;
				}

				function clearInfo() {
					modal.image = {};
				}
			};
		};
		oReader.readAsDataURL(file);


		return modal;
	}


	function addListenner(modal, image, imageName) {
		modal.addAction(".btnUpload", "click", function() {
			var btn = this;

			Helper.begin(btn);
			var blob = imageReader(image, modal);

			uploadImage(blob, imageName, {
				beforeUpload: function() {},
				afterUpload: function() {},
				success: function(imageURL) {
					modal.destroy();
					modal.options.success(imageURL);
				},
				error: function(message) {
					modal.destroy();
					modal.options.error(message);
				},
				always: function() {
					Helper.end(btn);
				}
			});
		});
	}


	function imageReader(image, modal) {
		if (!modal.image.hasOwnProperty("x1")) {
			modal.image = {
				x1: 0,
				y1: 0,
				width: image.naturalWidth,
				height: image.naturalHeight,
				selectedWidth: $(image).width(),
				selectedHeight: $(image).height()
			};
		}
		var canvas = document.createElement("canvas");
		canvas.width = modal.image.selectedWidth;
		canvas.height = modal.image.selectedHeight;
		var context = canvas.getContext("2d");
		context.drawImage(image, modal.image.x1, modal.image.y1, modal.image.width, modal.image.height, 0, 0, canvas.width, canvas.height);



		var data = canvas.toDataURL();
		var arr = data.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
		data = arr[1];
		data = window.atob(data);
		var ia = new Uint8Array(data.length);
		for (var i = 0; i < data.length; i++) {
			ia[i] = data.charCodeAt(i);
		};

		if (blobType == 1) {
			return new Blob([ia], {
				type: mime
			});
		} else if (blobType == 2) {
			// var bb = new BlobBuilder();
			// bb.append(ia.buffer);
			// var blob = bb.getBlob(mime);
			// return blob;

			return canvas.toDataURL().split(',')[1];
		} else if (blobType == 3) {
			return new Blob([ia.buffer], {
				type: mime
			});
		} else {
			return modal.file;
		}
	}

	function uploadImage(blob, imageName, options) {
		if (blob.hasOwnProperty("size") && blob.size > 2 * 1000 * 1024) {
			Helper.alert("上传的图片不得超过2M！");
			return;
		}


		var xhr = new XMLHttpRequest();
		var data = new FormData();
		data.append("session", Application.getSession());
		data.append("uploadfile", blob);
		data.append("fileName", imageName);

		// 安卓版微信 dataform 中的blob会被传空，所以采用base64字符串提交
		var url = blobType == 2 ? "/api-front/picture/upload-base64" : "/api-front/picture/upload";

		xhr.open("post", url, true);
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.onreadystatechange = function(a, b, c) {
			if (xhr.readyState === 4) {
				// 上传成功的处理方法
				if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
					var resultData = $.parseJSON(xhr.responseText);
					if (resultData.status == "OK") {
						var imageURL = resultData.result;
						options.success(imageURL);
					} else {
						options.error(resultData.message);
					}
				} else { // 上传失败的处理，移除预览
					options.error(xhr.statusText);
				}
				xhr = null;
				Helper.execute(options.always);
			}
		}
		xhr.send(data);
	}

	module.exports = function(file, options) {
		return new uploader(file, options);
	};
});