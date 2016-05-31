define({
	/* ============= 组织 ============== */
	// 微首页
	"organization/:oid/index": {
		controller: "homepage/indexController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/index"
	},
	"organization/:oid/zone": {
		controller: "organization/zoneController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/zone"
	},
	"organization/:oid/join": {
		controller: "organization/joinController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/join"
	},

	"organization/:oid/list/school": {
		controller: "organization/exhibition/school/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/list\\/school"
	},
	"organization/:oid/exhibition/:rid/info/school": {
		controller: "organization/exhibition/school/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/exhibition\\/([a-zA-Z0-9\\-]+)\\/info\\/school"
	},
	"organization/:oid/list/country": {
		controller: "organization/exhibition/country/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/list\\/country"
	},
	"organization/:oid/exhibition/:eid/info/country": {
		controller: "organization/exhibition/country/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/exhibition\\/([a-zA-Z0-9\\-]+)\\/info\\/country"
	},
	"organization/:oid/exhibition/:eid/wechats": {
		controller: "organization/exhibition/country/wechatsController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/exhibition\\/([a-zA-Z0-9\\-]+)\\/wechats"
	},
	"organization/:oid/ticket/:sid/check": {
		controller: "organization/checkTicketController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/ticket\\/([a-zA-Z0-9\\-]+)\\/check"
	},

	/* ============= 用户 ============== */
	"organization/:oid/user/zone": {
		controller: "user/zoneController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/zone"
	},
	"organization/:oid/user/history/event": {
		controller: "user/history/eventController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/history/event"
	},
	"organization/:oid/user/history/lottery": {
		controller: "user/history/lotteryController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/history/lottery"
	},
	"organization/:oid/user/history": {
		controller: "user/history/eventController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/history"
	},
	"organization/:oid/user/notifications": {
		controller: "user/notificationsController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/notifications"
	},
	"organization/:oid/user/notices": {
		controller: "user/noticesController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/notices"
	},
	"organization/:oid/user/notice/:nid/info": {
		controller: "user/noticesController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/notice\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/user/feedback": {
		controller: "user/feedbackController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/feedback"
	},
	
	"organization/:oid/user/:uid/resume": {
		controller: "user/resumeController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/user\\/([a-zA-Z0-9\\-]+)\\/resume"
	},

	/* ============= 活动 ============== */
	"organization/:oid/events": {
		controller: "event/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/events"
	},
	"organization/:oid/event/:eid/info": {
		controller: "event/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/event\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/event/:eid/signup": {
		controller: "event/signupController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/event\\/([a-zA-Z0-9\\-]+)\\/signup"
	},

	// 电子票
	"organization/:oid/ticket/:tid/info": {
		controller: "ticket/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/ticket\\/([a-zA-Z0-9\\-]+)\\/info"
	},

	/* ============= 投票 ============== */
	"organization/:oid/votes": {
		controller: "vote/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/votes"
	},
	"organization/:oid/vote/:vid/info/ugc": {
		controller: "vote/ugc/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/vote\\/([a-zA-Z0-9\\-]+)\\/info/ugc"
	},
	"organization/:oid/vote/:vid/info": {
		controller: "vote/default/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/vote\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/vote/:vid/option/:pid/info": {
		controller: "vote/playerController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/vote\\/([a-zA-Z0-9\\-]+)\\/option\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/vote/:vid/statistics": {
		controller: "vote/statisticsController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/vote\\/([a-zA-Z0-9\\-]+)\\/statistics"
	},
	"organization/:oid/vote/:vid/signup": {
		controller: "vote/ugc/signupController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/vote\\/([a-zA-Z0-9\\-]+)\\/signup"
	},

	/* ============= 文章 ============== */
	"organization/:oid/articles": {
		controller: "article/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/articles"
	},
	"organization/:oid/article/:aid/info": {
		controller: "article/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/article\\/([a-zA-Z0-9\\-]+)\\/info"
	},

	/* ============= 评论 ============== */
	"organization/:oid/:stype/:sid/comments": {
		controller: "comment/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/([a-zA-Z_]+)\\/([a-zA-Z0-9\\-]+)\\/comments"
	},

	/* ============= 提案 ============== */
	"organization/:oid/proposals": {
		controller: "proposal/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/proposals"
	},
	"organization/:oid/proposal/edit": {
		controller: "proposal/editController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/proposal\\/edit"
	},
	"organization/:oid/proposal/:pid/info": {
		controller: "proposal/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/proposal\\/([a-zA-Z0-9\\-]+)\\/info"
	},

	/* ============= 问卷 ============== */
	"organization/:oid/questionnaires": {
		controller: "questionnaire/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/questionnaires"
	},
	"organization/:oid/questionnaire/:pid/info": {
		controller: "questionnaire/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/questionnaire\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/questionnaire/:pid/signup": {
		controller: "questionnaire/signupController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/questionnaire\\/([a-zA-Z0-9\\-]+)\\/signup"
	},
	"organization/:oid/questionnaire/:pid/statistics": {
		controller: "questionnaire/statisticsController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/questionnaire\\/([a-zA-Z0-9\\-]+)\\/statistics"
	},

	/* ============= 失物招领 ============== */
	"organization/:oid/lost/list": {
		controller: "lost/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lost\\/list"
	},
	"organization/:oid/lost/edit": {
		controller: "lost/editController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lost\\/edit"
	},
	"organization/:oid/lost/:lid/info": {
		controller: "lost/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lost\\/([a-zA-Z0-9\\-]+)\\/info"
	},

	/* ============= 微信上墙 ============== */
	"organization/:oid/wall/:wid/info": {
		controller: "wall/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/wall\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/wall/:wid/message": {
		controller: "wall/messageController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/wall\\/([a-zA-Z0-9\\-]+)\\/message"
	},

	/* ============= 图文回复 ============== */
	"organization/:oid/wechat/article/:aid/info": {
		controller: "wechat/articleController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/wechat\\/article\\/([a-zA-Z0-9\\-]+)\\/info"
	},

	/* ============= 成绩与课表 ============== */
	"organization/:oid/mengxiaozhu/bind": {
		controller: "mengxiaozhu/bindController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/mengxiaozhu\\/bind"
	},
	"organization/:oid/mengxiaozhu/mxzmain": {
		controller: "mengxiaozhu/mxzmainController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/mengxiaozhu\\/mxzmain"
	},
	"organization/:oid/mengxiaozhu/score": {
		controller: "mengxiaozhu/scoreController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/mengxiaozhu\\/score"
	},
	"organization/:oid/mengxiaozhu/timetable": {
		controller: "mengxiaozhu/timetableController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/mengxiaozhu\\/timetable"
	},

	/* ============= 关联组织文章/活动 ============== */
	"organization/:oid/relation/list": {
		controller: "organization/relation/listController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/relation\\/list"
	},
	"organization/:oid/relation/events": {
		controller: "relation/eventsController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/relation\\/events"
	},
	"organization/:oid/relation/articles": {
		controller: "relation/articlesController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/relation\\/articles"
	},

	/* ============= 大转盘 ============== */
	"organization/:oid/lottery/:lid/draw": {
		controller: "lottery/drawController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lottery\\/([a-zA-Z0-9\\-]+)\\/draw"
	},
	"organization/:oid/lottery/:lid/info": {
		controller: "lottery/infoController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lottery\\/([a-zA-Z0-9\\-]+)\\/info"
	},
	"organization/:oid/lottery/:lid/signup": {
		controller: "lottery/signupController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lottery\\/([a-zA-Z0-9\\-]+)\\/signup"
	},
	"organization/:oid/lottery/:lid/result": {
		controller: "lottery/resultController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lottery\\/([a-zA-Z0-9\\-]+)\\/result"
	},
	"organization/:oid/lottery/:lid/award/:aid/check": {
		controller: "lottery/awardController",
		regExp: "organization\\/([a-zA-Z0-9\\-]+)\\/lottery\\/([a-zA-Z0-9\\-]+)\\/award\\/([a-zA-Z0-9\\-]+)\\/check"
	},
	
});