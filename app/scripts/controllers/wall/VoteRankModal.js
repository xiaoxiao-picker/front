define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var config = require("config");

	var VoteService = require("VoteService");

	var VOTERANK;

	function VoteRankModal(vote, options) {
		var modal = this;
		this.state = "closed";
		this.vote = vote;
		this.options = options = $.extend({}, options);
		var messageBox = options.container;
		modal.commentBox = messageBox.find("#COMMENTLIST");


		modal.voteRankBox = $(template("app/templates/wall/vote-result", {
			wechat: Application.organization.wechat,
			voteURL: makeQRCode(config.pages.origin + "/index.html#organization/" + Application.organization.id + "/vote/" + vote.id + "/info"),
			vote: vote
		}));
		modal.voteRankBox.on("click.vote-result", ".btn-close", function() {
			modal.destroy();
		});
		modal.voteRankBox.on("click.vote-result", ".qrcode", function() {
			modal.voteRankBox.find(".vote-qrcode").show().animate({
				opacity: 1
			}, 200);
		});
		modal.voteRankBox.on("click.vote-result", ".closeQRCode", function() {
			modal.voteRankBox.find(".vote-qrcode").animate({
				opacity: 0
			}, 200, function() {
				$(this).hide();
			});
		});

		modal.voteRankBox.appendTo(messageBox);
	}


	VoteRankModal.prototype.open = function() {
		var modal = this;
		this.voteRankBox.show();
		this.commentBox.css("visibility", "hidden");
		this.state = "opened";

		reloadVoteRank(this.vote.id);

		function reloadVoteRank(voteId) {
			VoteService.option.getRank(voteId, 0, 10).done(function(data) {
				var participants = data.result.participants;
				modal.voteRankBox.find(".message").text("（共" + participants + "参与）");
				modal.voteRankBox.find(".content").html(template("app/templates/wall/vote-result-inner", {
					totalCount: data.result.totalResult,
					options: data.result.options
				}));

				$(data.result.options).each(function(index,option){
					modal.voteRankBox.find("#"+option.id).width(option.totalVotes*100/data.result.totalResult+"%");
				});

				// 每10秒轮询一次
				VOTERANK = setTimeout(function() {
					reloadVoteRank(voteId);
				}, 10000);
			}).fail(function(error) {
				Helper.alert(error);
			});
		}
		return modal;
	};

	VoteRankModal.prototype.destroy = function() {
		this.voteRankBox.hide();
		this.commentBox.css("visibility", "");
		Helper.execute(this.options.destroy);
		this.state = "closed";
		clearTimeout(VOTERANK);
		return this;
	};

	module.exports = function(vote, options) {
		return new VoteRankModal(vote, options);
	};

	function makeQRCode(url) {
		return "/api-front/barcode/generate?session=" + Application.getSession() + "&value=" + encodeURIComponent(url)
	}
});