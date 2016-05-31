define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var VoteService = require("VoteService");


	function OptionBox(optionId, options) {
		var optionBox = this;

		var modal = Helper.modal({
			loading: true,
			position: "top"
		});

		(function init() {
			VoteService.option.get(optionId, options.voteInfo.hideVotes).done(function(data) {
				optionBox.optionInfo = data.result;
				
				optionBox.optionInfo.casted = options.voteInfo.castedOptionIds.indexOf(optionId) > -1;

				modal.html(template("app/templates/vote/option", {
					option: optionBox.optionInfo,
					vote: options.voteInfo
				}));

				modal.addAction("[data-xx-action='close']", "click", function() {
					modal.destroy();
				});
				// 如果允许评论，则渲染评论模块
				options.voteInfo.permitComment && (function() {
					require.async("lib.commentBox", function(CommentBox) {
						commentBox = CommentBox({
							container: modal.box.find("#CommentsContainer"),
							sourceId: optionId,
							sourceType: 'VOTE_OPTION',
							limit: 5,
							comment: function() {
								commentBox.innerRender();
							},
							remove: function() {
								commentBox.innerRender();
							}
						});
						commentBox.innerRender();
					});
				})();
			}).fail(function(error) {
				Helper.alert(error);
				modal.destroy();
			});
		})();
	}

	module.exports = function(optionId, options) {
		return new OptionBox(optionId, options);
	};
});