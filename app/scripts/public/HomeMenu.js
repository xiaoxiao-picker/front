// 系统级菜单，附属于Application对象
define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");

	function HomeMenu() {
		this.namespace = "home-menu";
		this.isActive = false;
		this.container = $(document.body);
	}

	HomeMenu.prototype.init = function() {
		this.box = $(template("app/templates/public/HomeMenu", {
			user: Application.user.info,
			organization: Application.organization.info
		})).attr("hidden", "");

		this.box.appendTo(this.container);

		addListener(this);
		getUnreadCountByMessage();
	};

	HomeMenu.prototype.open = function() {
		var homeMenu = this;

		if (this.isActive) return;

		// Helper.fixed.done();
		this.isActive = true;
		this.box.removeAttr('hidden');
		setTimeout(function() {
			homeMenu.box.addClass('active');
		});
	};
	HomeMenu.prototype.close = function() {
		if (!this.isActive) return;
		// Helper.fixed.cancel();
		var homeMenu = this;
		homeMenu.isActive = false;
		homeMenu.box.removeClass('active');
		setTimeout(function() {
			homeMenu.box.attr('hidden', '');
		}, 500);
	};

	function addListener(homeMenu) {
		homeMenu.box.on("click." + homeMenu.namespace, ".shadow-box", function() {
			homeMenu.close();
		});

		homeMenu.box.on("click." + homeMenu.namespace, ".btn-close", function() {
			homeMenu.close();
		});
	};

	function getUnreadCountByMessage() {
		function getUnreadCount() {
			Application.user.getMessageUnreadCount(true).done(function() {
				var count = Application.user.unReadCount;
				$('.count-message-' + Application.user.info.id).text(count);
				$('.count-message-' + Application.user.info.id)[count ? 'removeClass' : 'addClass']('hide');
				$("#header #userAvatar")[count ? "addClass" : "removeClass"]("notification-active");
				setTimeout(getUnreadCount, 60000);
			});
		};
		getUnreadCount();
	};

	

	var homeMenu = (function() {
		return new HomeMenu();
	})();

	module.exports = homeMenu;
});