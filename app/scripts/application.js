//
//                   _ooOoo_
//                  o8888888o
//                  88" . "88
//                  (| -_- |)
//                  O\  =  /O
//               ____/`---'\____
//             .'  \\|     |//  `.
//            /  \\|||  :  |||//  \
//           /  _||||| -:- |||||-  \
//           |   | \\\  -  /// |   |
//           | \_|  ''\---/''  |   |
//           \  .-\__  `-`  ___/-. /
//         ___`. .'  /--.--\  `. . __
//      ."" '<  `.___\_<|>_/___.'  >'"".
//     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//     \  \ `-.   \_ __\ /__ _/   .-` /  /
//======`-.____`-.___\_____/___.-`____.-'======
//                   `=---='
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            佛祖保佑       永无BUG

define(function(require, exports, module) {
	require("base");
	require("array");
	require("directive.accordion");
	var controller = null;
	var template = require('template');
	var previousController;
	var previousControllerNS = "";
	var router = require('scripts/public/router');
	var Helper = require("helper");
	var browser = require("browser");

	var UserService = require("UserService");

	var Application = require('factory.application');
	var HomeMenu = require("public.homeMenu");

	// 渲染函数，根据controller参数实例化控制器，保存到controller参数
	var render = function(controller, fnCallback) {
		fnCallback = fnCallback || function() {
			// 渲染完成后执行 hashChange end
			$(document).trigger("sui.mvc.router.change.end");
		};

		var controllerBase = "scripts/controllers/";
		var _controller = controller; // 避免在SUI.use环境中参数污染controller变量
		var routeRes = router(_controller);
		var controllerName = controllerBase + ((routeRes && routeRes['controller']) ? routeRes['controller'] : (controller + "Controller"));
		SUI.use(controllerName, function(Controller) {
			require.async("assets/stylesheets/iconfont.css");
			// Fixed：判断controller是否存在，避免用户输入错误url导致系统卡死	 
			if (!Controller) {
				Helper.alert("无效的URL地址！！！");
				Helper.execute(fnCallback);
				return;
			}

			var controller = new Controller();
			controller.callback = fnCallback;
			controller.organizationId = Application.organization.id;
			controller.initialize().init(fnCallback);

			Helper.modal().clear();
			Application.homeMenu.close();

			if (Application.audio && Application.audio.pause) {
				Application.audio.pause();
			}

			var namespace = controller.namespace || _controller.replace(/\//g, ".").toLowerCase();
			previousController = controller;
			// 在主循环中保存上一个对象的NS,用于解绑.NS命名空间下的事件委托,防止内存溢出
			previousControllerNS = namespace;

			$(document.body).removeAttr('class').addClass(namespace.replace(/\./g, "-"));
		});
	};

	// 监听路由变化开始
	$(document).on("sui.mvc.router.change.start", function() {
		var ns = previousControllerNS || "index";
		$(document).off("." + ns);
		Helper.loader.show();
	});
	// 监听路由变化结束
	$(document).on("sui.mvc.router.change.end", function() {
		$(document).scrollTop(0);
		Helper.loader.hide();
		// cnzz统计
		Helper.statistics();
	});
	// 监听APP级别的hashchange事件
	$(window).on('hashchange.application', function() {
		$(document).trigger("sui.mvc.router.change.start");
		hash = window.location.hash.replace(new RegExp(/(\/)+/g), "/");
		controller = hash ? hash.match(/^#([\w\/\-\u4e00-\u9fa5]+)\??/)[1] : 'index';
		var organizationId = Helper.param.hash("oid");

		if (previousController && previousController.destroy) {
			var destroy = previousController.destroy;
			Helper.execute(destroy);
		}

		if (organizationId != Application.organization.id) {
			Application.organizationRefresh(renderController);
		} else {
			renderController();
		}
		// 渲染具体页面
		function renderController() {
			render(controller);
		}
	});

	var orgId = Helper.param.hash("oid");

	// 初始化用户，全局唯一的用户示例
	window.Application = Application;
	Application.init(function() {
		Application.homeMenu = HomeMenu;
		Application.homeMenu.init();
		// 手动触发APP界别

		// 如果检测为微信浏览器且不在iframe中，则加载微信Api
		if (browser.isMobile && browser.wx && window.parent == window) {
			require.async("scripts/public/wechat", function(wechat) {
				wechat(function() {
					$(window).trigger('hashchange.application');
					$("#frontLoading").hide();
				});
			});
		} else {
			$(window).trigger('hashchange.application');
			$("#frontLoading").hide();
		}

		setTimeout(synchronization, 500);
	});


	// 如果用户头像或昵称为空，则建议同步微信数据
	function synchronization() {
		if (browser.wx && (!Application.user.info.portraitUrl || !Application.user.info.nickname)) {
			Application.user.getConfig().done(function() {
				if (Application.user.config.showSynchronization) {
					// Helper.confirm("是否同步微信的头像、昵称、性别和故乡数据！", function() {
					$.when(Application.getPublicAppId()).done(function() {
						var redirect_uri = encodeURIComponent(window.location.origin + "/synchronize.html?redirect=" + encodeURIComponent(window.location.href));
						var authUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + Application.publicAppId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
						window.location.href = authUrl;
					}).fail(function(error) {
						Helper.alert(error);
					});
					// });
					UserService.config.update(Application.user.id, {
						showSynchronization: false
					});
				}
			}).fail(function(error) {
				// Helper.alert(error);
			});
		}
	}


	// 全局事件
	var globalActions = require("scripts/public/global-actions");
	Helper.globalEventListener("click.global", "data-xx-action", globalActions);
});