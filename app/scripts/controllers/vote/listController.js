define(function(require, exports, module) {
	require('styles/vote.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var VoteService = require('VoteService');
	var template = require('template');
	var Helper = require('helper');

	var orgId, title, keyword, limit, pageIndex, Type;

	var Controller = function() {
		var _controller = this;
		this.namespace = "votes";
		this.actions = {
			loadMore: function() {
				var _btn = this;

				Helper.begin(_btn);
				getVotes(_controller, function(votes) {
					insertVotes(_controller, votes);
					Helper.end(_btn);
				});
			}
		};
	};

	bC.extend(Controller);
	/**
	 * 初始化参数，渲染模板
	 */
	Controller.prototype.init = function(callback) {
		this.callback = callback;
		this.recordURL();

		orgId = Application.organization.id;
		keyword = Helper.param.search("keyword") || "";
		title = decodeURIComponent(Helper.param.search("title"));
		Type = Helper.param.search("type") || "DEFAULT";
		this.backURL = '#organization/' + orgId + '/index';
		limit = 10;
		pageIndex = 0;

		if (title) {
			Helper.storePageTitle(orgId, "votes", title);
		}
		title = title || Helper.getStoredOrgTitle(orgId, "votes") || "投票列表";
		// 设置标题
		Helper.setTitle(title);

		this.votes = [];
		this.count = 0;

		this.render();
	};


	Controller.prototype.render = function() {
		var controller = this;

		// 微信分享用
		var organization = Application.organization.info;
		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
		this.share(title + " - " + organization.name, imgUrl, organization.name, window.location.href);

		$("#header").html(template("app/templates/public/header", {
			title: title,
			user: Application.user.info
		}));

		controller.tab = {
			className: 'tab-2',
			menus: [{
				type: 'DEFAULT',
				hash: '#organization/' + orgId + '/votes?type=DEFAULT',
				icon: 'icon-friend',
				title: '常规投票'
			}, {
				type: 'UGC',
				hash: '#organization/' + orgId + '/votes?type=UGC',
				icon: 'icon-earth',
				title: 'UGC投票'
			}]
		};

		VoteService.getCount(orgId, keyword).done(function(data) {
			controller.count = data.result;

			if (!controller.count) {
				$("#content").html(template('app/templates/public/empty', {
					currentTab: Type,
					tab: controller.tab
				}));
				return;
			}

			(function renderVotes() {
				getVotes(controller, function(votes) {
					controller.votes = controller.votes.concat(votes);

					var complete = controller.count <= controller.votes.length;
					$("#content").html(template("app/templates/vote/list", {
						orgId: orgId,
						votes: votes,
						complete: complete,
						currentTab: Type,
						tab: controller.tab
					}));
				});
			})();

			// 页面滑动到底部自动加载
			controller.scrollToBottom(function() {
				if (controller.state == "loading") return;
				if (controller.count > controller.votes.length) {
					$(".btn-more").trigger("click");
				}
			});

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	// 向服务器取数据
	function getVotes(controller, success, error) {
		var skip = pageIndex * limit;

		controller.state = 'loading';

		VoteService.getList(orgId, skip, limit, keyword, Type).done(function(data) {
			var votes = makeVotes(data.result, data.time);
			success(votes);
			pageIndex++;
		}).fail(function(error) {
			Helper.errorAlert(error);
		}).always(function() {
			controller.state = "complete";
		});
	};

	// 插入
	function insertVotes(controller, votes) {

		controller.votes = controller.votes.concat(votes);
		var hasMore = controller.count > controller.votes.length;
		$("#VotesContainer").append(template('app/templates/vote/list-inner', {
			votes: votes,
			orgId: orgId
		}));
		$(".more-container")[hasMore ? "removeClass" : "addClass"]("complete");
	};

	// 处理投票数据
	function makeVotes(votes, currentTime) {
		$(votes).each(function(idx, vote) {
			vote.progress = makeProgress(vote.startDate, vote.endDate, currentTime);
		});
		return votes;

		function makeProgress(start, end, current) {
			if (start > current) {
				return {
					state: "NOTSTART",
					distance: Helper.distance(current, start).local
				};
			} else if (end < current) {
				return {
					state: "OVER",
					distance: Helper.distance(end, current).local
				};
			} else if (current >= start && current <= end) {
				return {
					state: "UNDERWAY",
					distance: Helper.distance(start, end).local
				};
			} else return {
				state: "UNKNOWN",
				distance: null
			};
		};
	};



	module.exports = Controller;
});