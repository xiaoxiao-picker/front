var DEBUG = location.href.indexOf("debug") > 0;
var JSEXT = DEBUG ? "/debug" : "";
var VERSION = "2.7.20";

// config file
seajs.config({

	// 别名配置
	alias: {
		"base": "scripts/base",
		"baseController": "scripts/baseController",

		// factory
		"factory.application": "scripts/factory/Application",
		"factory.organization": "scripts/factory/organization",
		"factory.user": "scripts/factory/user",

		// public
		"advertMaker": "scripts/public/advertMaker",
		"ajaxhandler": "scripts/public/ajaxHandler",
		"array": "scripts/public/array",
		"browser": "scripts/public/browser",
		"config": "scripts/public/config",
		"date": "scripts/public/date",
		"eventListener": "scripts/public/eventListener",
		"helper": "scripts/public/helper",
		"history": "scripts/public/history",
		"AssistiveTouch": "scripts/public/AssistiveTouch",
		"loader": "scripts/public/loader",
		"localStore": "scripts/public/localStore",
		"alert": "scripts/public/Ly.alert",
		"toast": "scripts/public/Ly.toast",
		"ly.modal": "scripts/public/Ly.modal",
		"validation": "scripts/public/validate",
		"public.homeMenu": "scripts/public/HomeMenu",
		"public.statistics": "scripts/public/statistics",

		// directives
		"directive.accordion": "scripts/directives/accordion",

		// lib
		"lib.imageUploader": "scripts/lib/imageUploader",

		"lib.form": "scripts/lib/Form",
		"lib.form.text": "scripts/lib/form/Text",
		"lib.form.date": "scripts/lib/form/Date",
		"lib.form.choice": "scripts/lib/form/Choice",

		// 绑定手机
		"lib.phoneBindBox": "scripts/lib/PhoneBindBox",
		// 绑定邮箱
		"lib.emailBindBox": "scripts/lib/EmailBindBox",

		"lib.makeFields": "scripts/lib/makeFields",
		"ImageBox": "scripts/lib/ImageBox",
		"tips": "scripts/lib/Ly.tips",
		"modalbox": "scripts/lib/modalbox",
		"qrcode": "scripts/lib/QRCode",
		"REQUIREINFO": "scripts/lib/RequireInfo",
		"Color": "scripts/lib/Color",
		"lib.commentBox": "scripts/lib/CommentBox",
		"lib.categorySelector": "scripts/lib/CategorySelector",
		"lib.citySelector": "scripts/lib/CitySelector",
		"lib.searchBox": "scripts/lib/SearchBox",
		"lib.praiseAnimation": "scripts/lib/PraiseAnimation",


		// plugins
		"audiojs": "plugins/audiojs/audiojs/audio.min",
		"dropkick": "plugins/dropkick/dropkick",
		"dropkick.css": "plugins/dropkick/production/css/dropkick.css",


		//templates
		"template": "scripts/public/template",

		// configs


		//services
		'AccountService': 'scripts/services/AccountService',
		'AdvertisementService': 'scripts/services/AdvertisementService',
		'ArticleService': 'scripts/services/ArticleService',
		'AwardService': 'scripts/services/AwardService',
		'CommentService': 'scripts/services/CommentService',
		'EventService': 'scripts/services/EventService',
		'ExhibitionService': 'scripts/services/ExhibitionService',
		'FeedbackService': 'scripts/services/FeedbackService',
		'FormService': 'scripts/services/FormService',
		'HomePageService': 'scripts/services/HomePageService',
		'LogService': 'scripts/services/LogService',
		'LostService': 'scripts/services/LostService',
		'MemberService': 'scripts/services/MemberService',
		'NoticeService': 'scripts/services/NoticeService',
		'NotificationService': 'scripts/services/NotificationService',
		'OrganizationService': 'scripts/services/OrganizationService',
		'PraiseService': 'scripts/services/PraiseService',
		'ProposalService': 'scripts/services/ProposalService',
		'PublicService': 'scripts/services/PublicService',
		'QuestionnaireService': 'scripts/services/QuestionnaireService',
		"RelatedOrganizationService": "scripts/services/RelatedOrganizationService",
		'UserService': 'scripts/services/UserService',
		'VoteService': 'scripts/services/VoteService',
		'TicketService': 'scripts/services/TicketService',
		'WallService': 'scripts/services/WallService',
		'WeChatService': 'scripts/services/WeChatService',
		'MengxiaozhuService': 'scripts/services/MengxiaozhuService',
		'LotteryService': 'scripts/services/LotteryService',
		'RelationService': 'scripts/services/RelationService',

		"wxsdk": "http://res.wx.qq.com/open/js/jweixin-1.0.0.js"
	},

	// 路径配置
	paths: {
		"gallery": "https://a.alipayobjects.com/gallery"
	},

	// 变量配置
	vars: {
		"locale": "zh-cn",
		version: (Date.now && Date.now()) || new Date().getTime()
	},

	// 映射配置
	map: [
		[/^((.*\/scripts)(\/.*)\.js)$/i, "$2" + JSEXT + "$3.js?v=" + VERSION],
		[/^(.*\/styles\/.*\.css)$/i, "$1?v=" + VERSION]
		// [/^(.*\/scripts\/.*\.(?:css|js))(?:.*)$/i, "$1?v=1.10.13"]
		// [".js", ".js?v=1.7.22"]
		// 增加时间戳,避免浏览器缓存
	],

	// 预加载项
	preload: [
		"jquery",
		"plugins/json2"
		// !this.JSON ? "plugins/json2" : "plugins/json2"
	],

	// 调试模式
	debug: DEBUG,

	// Sea.js 的基础路径
	base: "/",

	// 文件编码
	charset: "utf-8"
});
(function() {
	var SUI = window.SUI = window.SUI || {},
		older_SUI, _VERSION = SUI._Version = "0.0.1";
	SUI.noConflict = function() {
		return SUI;
	};
	SUI.version = function() {
		SUI.debug(SUI._Version);
	};
	SUI.debug = function(msg) {
		console.log(msg);
	};
	// 封装seajs模块
	SUI.use = seajs.use;
})();