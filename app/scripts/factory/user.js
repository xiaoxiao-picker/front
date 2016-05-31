define(function(require, exports, module) {
	var Helper = require("helper");
	var NotificationService = require("NotificationService");
	var UserService = require("UserService");

	var User = function(userId) {
		this.id = userId;
	};

	User.prototype.reload = function() {
		var userId = this.id;
		var user = this;
		return UserService.get(userId).done(function(data) {
			user.info = data.result;
			user.info.grade = user.info.grade ? +user.info.grade : null;
		});
	};

	User.prototype.getConfig = function(refresh) {
		var user = this;
		refresh = refresh ? true : false;
		if (refresh || !user.config) {
			return UserService.config.get(user.id).done(function(data) {
				user.config = data.result;
			});
		} else {
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}
	};

	User.prototype.getRank = function(refresh) {
		var user = this;
		refresh = refresh ? true : false;
		user.rank = user.rank || {};

		var orgId = Application.organization.id;
		if (!orgId) {
			var defer = $.Deferred();
			defer.reject("组织ID为空");
			return defer.promise();
		}
		if (refresh || !user.rank[orgId]) {
			return UserService.getMemberRank(orgId).done(function(data) {
				user.rank[orgId] = data.result;
			});
		} else {
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}
	};

	// 确保用户已绑定手机号码才能操作
	User.prototype.withinPhoneNumber = function(message, callback) {
		var user = this;
		if (user.info.phoneNumber) {
			Helper.execute(callback);
			return;
		}
		// 如果未绑定手机号，则弹出绑定手机层
		Helper.confirm(message, function() {
			require.async("lib.phoneBindBox", function(PhoneBindBox) {
				PhoneBindBox({
					success: callback
				});
			});
		});
	};

	User.prototype.getMessageUnreadCount = function(refresh) {
		var user = this;
		refresh = refresh ? true : false;
		if (refresh) {
			return NotificationService.unReadCount().done(function(data) {
				user.unReadCount = data.result;
			});
		} else {
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}
	};

	User.prototype.name = function() {
		var user = this;
		return user.info.name || user.info.nickname || user.info.phoneNumber || user.info.id || user.id;
	};

	module.exports = function(userId) {
		return new User(userId);
	};
});