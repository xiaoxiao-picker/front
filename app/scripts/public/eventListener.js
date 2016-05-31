define(function(require, exports, module) {
	exports.eventListener = function(eventName, actions) {
		$(document).on(eventName, "[data-xx-action]", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			var _this = $(this),
				actionName = _this.attr("data-xx-action"),
				action = actions[actionName];
			action && $.isFunction(action) && action.call(_this, evt);
			return false;
		});
	};
	exports.globalEventListener = function(eventName, dataEventAction, actions) {
		$(document).on(eventName, "[" + dataEventAction + "]", function(evt) {
			evt = evt || window.event;
			preventDefault(evt);
			var _this = $(this);
			var actionName = _this.attr(dataEventAction);
			var action = actions[actionName];
			action && $.isFunction(action) && action.call(_this, evt);
			return false;
		});
	};

	/**
	 * 禁用键盘事件
	 */
	exports.disableKeyBoard = function(keyCodes) {
		$(document).on("keydown", function(evt) {
			evt = evt || window.event;
			if (keyCodes.indexOf(evt.keyCode) != -1) {
				preventDefault(evt);
				return false;
			}
		})
	};


	function preventDefault(event) {
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	}
});