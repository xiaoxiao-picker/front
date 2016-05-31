define(function(require, exports, module) {
	require("styles/homepage.css");
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var Helper = require('helper');

	var HomePageService = require("HomePageService");

	var HomePageInfo;

	// 音乐控制
	var autoPlay;

	var Controller = function() {
		var controller = this;
		controller.namespace = "organization.index";
		controller.destroy = function() {
			Application.audio && Application.audio.pause();
		};
		controller.actions = {
			play: function() {
				Application.audio.play();
				this.parents(".audio-box").addClass("playing");
				Helper.userConfig.set("BackMusicAutoPlay", true);
			},
			pause: function() {
				Application.audio.pause();
				this.parents(".audio-box").removeClass("playing");
				Helper.userConfig.set("BackMusicAutoPlay", false);
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.recordURL();
		this.callback = callback;
		this.homepageId = Helper.param.search("pid");
		if (this.homepageId == "undefined") this.homepageId = "";

		autoPlay = Helper.userConfig.get("BackMusicAutoPlay");
		this.render();
	};


	Controller.prototype.render = function() {
		var controller = this;
		var callback = this.callback();
		var homepageId = this.homepageId;

		$("#header").html("");

		var organization = Application.organization.info;

		// 如果已指定主题ID则渲染指定主题，否则渲染组织开启状态的主题
		var action = homepageId ? HomePageService.get(homepageId) : HomePageService.getActive(Application.organization.id);
		action.done(function(data) {
			var page = data.result;

			controller.title = page.name || "微首页";
			Helper.setTitle(controller.title);
			// 微信分享用
			var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
			controller.share(controller.title + " - " + organization.name, imgUrl, $(organization.description).text(), window.location.href);

			page.json = JSON.parse(page.json);
			page.json.backMusic = page.json.backMusic || page.json.music || "";
			var templateName = page.json.template;
			require.async("scripts/controllers/homepage/pages/" + templateName, function(Page) {
				HomePageInfo = Page(page);
				HomePageInfo.render(afterRender);
			});
		}).fail(function(message) {
			Helper.alert(message);
		}).always(function() {
			Helper.execute(callback);
		});
	};


	function afterRender() {
		// 如果有背景音乐则播放
		if (HomePageInfo.json.backMusic) {
			playBackgroundMusic(HomePageInfo.json.backMusic);
		}
	};

	function playBackgroundMusic(url) {
		require.async("audiojs", function() {
			var audiojs = window.audiojs;
			audiojs.events.ready(function() {
				var init = true;
				var audioBox = $(".audio-box");
				var audios = audiojs.createAll();
				if (!audios.length) {
					audioBox.remove();
					return;
				};
				Application.audio = audios[0];
				Application.audio.settings.loadError = function() {
					Helper.errorToast("音乐文件加载失败！");
					audioBox.remove();
				};
				Application.audio.settings.init = function() {
					if (init) {
						audioBox.addClass("loading");
						// 安卓版微信不能触发audiojs插件的loadStarted事件 手动触发
						if (Helper.browser.android && Helper.browser.wx) {
							setTimeout(function() {
								if ($(".audio-box").length == 0) return;
								audioBox.removeClass("loading");
								if (init && autoPlay) {
									audioBox.addClass("playing");
									Application.audio.play();
									init = false;
								}
							}, 3000);
						}
					}
				};
				Application.audio.settings.loadStarted = function() {
					if ($(".audio-box").length == 0) return;
					audioBox.removeClass("loading");
					if (init && autoPlay) {
						audioBox.addClass("playing");
						Application.audio.play();
						init = false;
					}
				};
				Application.audio.load(url);
			});
		});
	};

	module.exports = Controller;
});