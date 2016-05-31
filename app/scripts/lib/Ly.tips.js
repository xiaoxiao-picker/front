define(function(require, exports, module) {
	var namespace = "Ly.tips";
	var Tips = function(message, options) {
		var _this = this;
		var container = $(document.body);
		this.options = $.extend({
			effects: 'scale'
		}, options);

		var init = (function() {
			var html = [
				'<div class="ly-message-box-container ly-tips-container">',
				'<div class="ly-message-box ' + _this.options.effects + '">',
				'<div class="ly-message-box-body tips">',
				'<div class="ly-message-content">' + message + '</div>',
				'</div>',
				'</div>',
				'</div>'
			].join('');
			_this.messageBox = $(html);
			_this.messageBox.appendTo(container);
			_this.messageBox.on("click." + namespace, ".close", function() {
				_this.destroy();
			});
		})();
	};

	Tips.prototype.destroy = function() {
		this.messageBox.off("." + namespace).remove();
	};

	module.exports = function(message, options) {
		return new Tips(message, options);
	};
});