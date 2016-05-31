define(function(require, exports, module) {
	var template = require("template");

	// 储存Modal对象集合
	var Modals = [];

	var Modal = function(options) {
		var modal = this;
		// 若不传options参数则提供clear方法
		if (Object.prototype.toString.call(options) === '[object Undefined]') return;

		this.options = $.extend(true, {
			container: $(document.body),
			template: "app/templates/public/modal/container",
			theme: 'white',
			effectsIn: 'topIn',
			effectsOut: 'topOut',
			zIndex: 1030,
			loading: false,
			closeButton: false,
			position: 'center',
			backgroundAlpha: '0.5',
			offsetY: 0,
			actions: {
				".btn-close": {
					event: "click",
					fnc: function() {
						modal.destroy();
					}
				}
			}, // 行为注入
			destroy: function() {}
		}, options);

		// modal层的状态，true为打开状态，false为关闭状态
		this.active = false;
		this.container = this.options.container;
		this.namespace = "modal." + new Date().getTime();
		init(this);
	};


	function init(modal) {
		modal.box = $(template(modal.options.template, {
			zIndex: modal.options.zIndex,
			theme: modal.options.theme,
			effects: modal.options.effectsIn,
			closeButton: modal.options.closeButton,
			loading: modal.options.loading,
			className: "blue"
		}));
		modal.box.appendTo(modal.container);
		setTimeout(function() {
			modal.box.addClass('fade');
		});

		addListener(modal);
		modal.open();
		Modals.push(modal);
	}

	function addListener(modal) {

		// 行为注入
		$.each(modal.options.actions, function(selector, action) {
			action.prevent = action.prevent === false ? false : true;
			action.event = action.event || "click";
			modal.box.on(action.event + "." + modal.namespace, selector, function(evt) {
				action.prevent && (preventDefault(evt));
				action.fnc && $.isFunction(action.fnc) && action.fnc.call($(this), modal, evt);
			});
		});
	}

	Modal.prototype.open = function() {
		this.active = true;
		$(document.body).addClass("modal-open");
	};
	Modal.prototype.close = function() {
		var modal = this;
		modal.active = false;
		modal.box.removeClass('fade');
		modal.box.find(".content").removeClass(modal.options.effectsIn).addClass(modal.options.effectsOut);
		modal.box.off("." + modal.namespace);
		this.options.destroy.call(this);
		Modals.remove(modal); // 从队列中删除该modal

		setTimeout(function() {
			modal.box.remove();
			var length = $(".modal-backdrop ").length;
			if (length == 0) {
				$(document.body).removeClass("modal-open");
			}
		}, 500);
	};
	Modal.prototype.destroy = function() {
		this.close();
	};
	Modal.prototype.toggle = function() {
		this[this.active ? "close" : "open"]();
	};
	Modal.prototype.html = function(html) {
		var modal = this;
		this.box.find(".content").html(html);
		if (this.options.position == "center") {
			setTimeout(function() {
				modal.locate();
			}, 100);
		}
	};
	Modal.prototype.locate = function() {
		var modal = this;
		var winHeight = $(window).height();
		var $content = modal.box.find(".content");
		var height = $content.height();

		$content.css("marginTop", (height < (winHeight - 50) ? ((winHeight - height) / 2) : 0) + modal.options.offsetY);
	};


	Modal.prototype.addAction = function(selector, eventType, fnc, prevent) {
		var _this = this;
		prevent = prevent === false ? false : true;
		_this.box.on(eventType + "." + _this.namespace, selector, function(evt) {
			prevent && (preventDefault(evt));
			fnc.call($(this), _this, evt);
		});
	};

	// 返回modal集合
	Modal.prototype.getModals = function() {
		return Modals;
	};
	// 关闭所有modal
	Modal.prototype.clear = function() {
		while (Modals.length > 0) {
			Modals[0].close();
		}
	};


	module.exports = function(options) {
		return new Modal(options);
	};

	function execute(fn, data) {
		fn && $.isFunction(fn) && fn(data);
	}

	function preventDefault(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	};
});