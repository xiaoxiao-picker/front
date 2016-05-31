define(function(require, exports, module) {
	require('styles/vote.css');

	var baseController = require('baseController');
	var bC = new baseController();
	var VoteService = require("VoteService");
	var template = require('template');
	var Helper = require('helper');

	var limit, voteId, VoteInfo;
	var optionId, RenderedOptions;

	var Controller = function() {
		var controller = this;
		controller.namespace = "vote.statistics";
		controller.actions = {
			loadMore: function() {
				var btn = this;

				controller.state = 'loading';
				Helper.begin(btn);

				// 从剩余选项中取出ID集合，但仍保留，当加载完成后删除掉
				var optionIds = VoteInfo.unloadOptionIds.slice(0, limit);

				VoteService.option.getListByIds(optionIds.join(',')).done(function(data) {
					VoteInfo.unloadOptionIds.splice(0, limit);
					var options = data.result;

					$(options).each(function(idx, option) {
						var value = VoteInfo.totalVotes ? Math.round((option.totalVotes / VoteInfo.totalVotes) * 100) / 100 : VoteInfo.totalVotes;
						option.percent = value * 100 + "%";
						option.progress = ($(window).width() - 60) * 0.8 * value;
						option.index = RenderedOptions.length + idx + 1;
					});

					RenderedOptions = RenderedOptions.concat(options);

					var html = $(template('app/templates/vote/statistics/list-inner', {
						options: options,
						total: VoteInfo.totalVotes,
						voteId: voteId,
						orgId: orgId
					}));
					$("#StatisticsList").append(html);
					$(".more-container")[RenderedOptions.length >= VoteInfo.optionIds.length ? "addClass" : "removeClass"]("complete");

					setTimeout(function() {
						$("#StatisticsList .progress").each(function(idx, option) {
							$(option).width(+$(option).attr("data-value"));
						});
					});

				}).fail(function(error) {
					Helper.alert(error);
				}).always(function() {
					controller.state = 'complete';
					Helper.end(btn);
				});
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

		orgId = Application.organization.id;
		voteId = Helper.param.hash("vid");
		limit = +Helper.param.search("limit") || 10;
		this.backURL = '#organization/' + orgId + '/vote/' + voteId + '/info';

		RenderedOptions = [];

		this.render();
	};

	/**
	 * 模板渲染函数
	 */
	Controller.prototype.render = function() {
		var controller = this;

		$("#header").html(template("app/templates/public/header", {
			title: '统计结果',
			user: Application.user.info
		}));

		var getVoteInfo = VoteService.get(voteId).done(function(data) {
			VoteInfo = data.result;
			controller.share(VoteInfo.name, VoteInfo.thumbnailUrl + "@300w_300h_1e_1c", VoteInfo.terse, VoteInfo.shareURL);
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		var getVoteOptionIds = VoteService.option.getIds(voteId);

		$.when(getVoteInfo, getVoteOptionIds).done(function(data1, data2) {
			VoteInfo.optionIds = sortVoteOptionIds(VoteInfo.sortType, data2.result);
			VoteInfo.unloadOptionIds = VoteInfo.optionIds.clone();

			$("#content").html(template('app/templates/vote/statistics/list', {}));
			$(".btn-more").trigger("click");

		}).always(function() {
			Helper.execute(controller.callback);
		});
	};

	// 选项ids排序
	function sortVoteOptionIds(sortType, optionIds) {
		if (sortType == "BY_RANDOM") {
			return optionIds.sort(function(a, b) {
				return Math.random() > 0.5 ? -1 : 1;
			});
		} else {
			return optionIds;
		}
	};

	module.exports = Controller;
});