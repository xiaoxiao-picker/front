define(function(require, exports, module) {
	var namespace = "imagebox";

	function ImageBox(image, container) {
		container = container || $(document.body);
		var mask = $('<div class="imagebox-mask"></div>');
		var html = [
			'<a href="javascript:void(0);">',
			'<div class="imagebox-container">',
			'<img class="image" src="../../../images/default/loading.gif" />',
			'</div>',
			'</a>'
		].join('');
		mask.html(html);
		container.append(mask).addClass("modal-open");

		addListener(mask);
		render(image);

		function render(src) {
			var image = new Image();
			image.src = src;
			image.onload = function() {
				var $image = mask.find("img");
				$image.attr("src", src);
				$image.css({
					marginTop: -$image.height() / 2,
					marginLeft: -$image.width() / 2
				});
			};
		};

		function remove(mask) {
			container.removeClass("modal-open");
			mask.off("." + namespace).addClass("remove");
			setTimeout(function(){
				mask.remove();
				mask=null;
			},1000)
		}

		function addListener(mask) {
			mask.on("click." + namespace, function() {
				remove(mask);
			});
		}
	};
	module.exports = ImageBox;

});