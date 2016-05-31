define(function(require, exports, module) {
	var Helper = require("helper");
	var template = require("template");
	var WallService = require("WallService");

	function WallLotteryModal(wallId, options) {
		var modal = this;
		this.state = "closed";
		this.options = options = $.extend({}, options);

		var WallUsers, LOTTERY, LUCKY;

		draw();

		function draw() {
			var messageBox = options.container;
			modal.commentBox = messageBox.find("#COMMENTLIST");
			modal.lotteryBox = $(template("app/templates/wall/wall-lottery", {}));

			var $userAvatar = modal.lotteryBox.find(".user-avatar");
			var $userName = modal.lotteryBox.find(".user-name>span");

			modal.lotteryBox.on("click.wall-lottery", ".btn-close", function() {
				modal.destroy();
			});
			modal.lotteryBox.on("click.wall-lottery", "#btnLottery", function() {
				var btn = $(this);
				var number = +modal.lotteryBox.find("#lotteryNumber").val();
				if (number > WallUsers.length) {
					return Helper.alert("抽奖人数不能大于总人数！");
				}
				Helper.begin(btn);
				startLottery();
				WallService.makeLottery(wallId, number).done(function(data) {
					var luckyMen = data.result;
					renderLuckyMen(luckyMen, btn);
					Helper.end(btn);
					btn.attr("disabled", "disabled");
				}).fail(function(error) {
					Helper.alert("抽奖失败：" + error);
					clearInterval(LOTTERY);
					$userAvatar.attr("src", "/images/wall-theme/avatar.png");
					$userName.text("");
					Helper.end(btn);
				});
			});
			modal.lotteryBox.on("click.wall.lottery", "#nextLottery", function() {
				clearInterval(LUCKY);
				clearInterval(LOTTERY);
				WallUsers = [];
				modal.lotteryBox.remove();
				draw();
			});


			(function initLotteryData() {
				WallService.getRepliedUsers(wallId, 100).done(function(data) {
					WallUsers = data.result.data;
					modal.lotteryBox.find("#partInCount").text(data.result.total);
					modal.lotteryBox.find("#btnLottery").removeAttr("disabled");
					modal.open();
				}).fail(function(error) {
					Helper.alert("获取上墙用户列表失败：" + error);
				});
			})();

			function startLottery() {
				var length = WallUsers.length;

				LOTTERY = setInterval(function() {
					var index = Math.ceil(Math.random() * (length - 1));
					var man = WallUsers[index];
					$userAvatar.attr("src", man.portraitUrl ? man.portraitUrl + "@100w_100h_1e_1c" : "/images/default/avatar.jpg");
					$userName.text(man.nickname || man.name || man.phoneNumber || "匿名");
				}, 200);
			}

			function renderLuckyMen(men, btn) {
				var length = men.length;
				var container = modal.lotteryBox.find(".result-container .content");
				var luckySpan = modal.lotteryBox.find("#luckyCount");
				// 结果清空
				container.html('');
				var i = 0;
				var man;

				// 至少5秒后开始显示结果
				LUCKY = setInterval(function() {
					if (i > length - 1) {
						clearInterval(LUCKY);
						clearInterval(LOTTERY);
						man = men[length - 1];
						$userAvatar.attr("src", man.portraitUrl ? man.portraitUrl + "@100w_100h_1e_1c" : "/images/default/avatar.jpg");
						$userName.text(man.nickname || man.name || man.phoneNumber || "匿名");
						btn.html("本轮抽奖结束");
						return;
					}
					man = men[i++];
					var html = [
						'<div class="lucky lucky-' + man.id + ' clearfix">',
						'<span class="index">' + i + '</span>',
						'<img class="avatar" src="' + man.portraitUrl + '@100w_100h_1e_1c" onerror="this.src=/images/default/avatar.jpg" />',
						'<div class="user-info">',
						'<p class="name ellipsis">' + man.nickname || "匿名" + '</p>',
						'<p class="tel">' + man.phoneNumber + '</p>',
						'</div>',
						'</div>'
					].join('');
					luckySpan.text(i);
					container.append(html);
				}, 1000);
			}

			modal.lotteryBox.appendTo(messageBox);
		}
	}


	WallLotteryModal.prototype.open = function() {
		this.lotteryBox.show();
		this.commentBox.css("visibility", "hidden");
		this.state = "opened";
		return this;
	};

	WallLotteryModal.prototype.destroy = function() {
		this.lotteryBox.hide();
		this.commentBox.css("visibility", "");
		Helper.execute(this.options.destroy);
		this.state = "closed";
		return this;
	};

	module.exports = function(wallId, options) {
		return new WallLotteryModal(wallId, options);
	};
});