/**
 * 模仿android toast 提示
 */
define(function(require, exports, module) {
	var toastNumber = 0;
	var Toast = function() {
		this.options = {
			delay: 2000,
			theme: 'default', //['default','theme','success','danger','warn']
			position: 'left' //['left','center','right']
		};
	};
	Toast.prototype.init = function(message, options) {
		var _this = this;
		_this.message = message;
		_this.options = $.extend(_this.options, options);
	};
	Toast.prototype.createHTML = function() {
		var options = this.options;
		var top = 0; // (0 + toastNumber * 33);
		var messageBox = $('<div class="ly-toast-box-container" style="top:' + top + 'px;"></div>');
		var html = [
			'<div class="ly-toast-box clearfix ' + options.theme + ' ' + options.position + '" >',
			'<div class="ly-toast-box-header">',
			'<span class="iconfont icon-' + {
				success: 'done-fill',
				warn: 'info-fill',
				danger: 'cancel-fill'
			}[options.theme] || 'info-fill',
			'"></span>',
			'</div>',
			'<div class="ly-toast-box-body">',
			this.message,
			'</div>',
			'<div class="ly-toast-box-footer">',
			'<span class="iconfont icon-close btn-close"></span>',
			'</div>',
			'</div>'
		].join('');
		messageBox.html(html);
		this.messageBox = messageBox;
		this.eventListener();
	};
	Toast.prototype.eventListener = function() {
		var _this = this,
			delay, timer;
		_this.messageBox
			.on('click', '.btn-close', function() {
				_this.destroy();
			})
			.on('mouseover', '.ly-toast-box-body', function() {
				clearTimeout(timer);
			}).on('mouseout', '.ly-toast-box-body', function() {
				autoclose();
			});
		delay = _this.options.delay;
		autoclose();

		function autoclose() {
			delay && (timer = setTimeout(function() {
				_this.destroy();
			}, delay))
		}
	};

	Toast.prototype.render = function(message, options) {
		this.init(message, options);
		this.createHTML();
		this.messageBox.appendTo(document.body);
		toastNumber++;
	};
	Toast.prototype.destroy = function() {
		var _this = this;
		_this.messageBox.off('mouseover').off('mouseout').off("click").animate({
			top: -10,
			opacity: 0
		}, 1000, 'swing', function() {
			_this.messageBox.remove();
		});
		toastNumber--;
	};

	exports.toast = function(message, options) {
		(new Toast()).render(message, options)
	};
});