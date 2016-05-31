define(function(require, exports, module) {
	module.exports = {
		showHomeMenu: function() {
			Application.homeMenu.open();
		},
		previewImage: function() {
			var $image = $(this);
			var imageUrl = $image.attr("data-image-url") || $image.attr("src");
			if (!imageUrl) return;
			if (window.wx) {
				var images = [];
				images.push(imageUrl);
				wx.previewImage({
					current: imageUrl,
					urls: images
				});
			} else {
				require.async("scripts/lib/ImageBox", function(ImageBox) {
					new ImageBox(imageUrl);
				});
			}
		}
	};
});