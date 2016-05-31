define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取评论总数
	exports.count = function(subjectType, subjectId) {
		return globalResponseHandler({
			url: 'comment/' + subjectType + '/' + subjectId + '/count'
		}, {
			description: '获取评论总数'
		});
	};

	// 获取评论列表
	exports.getList = function(subjectType, subjectId, skip, limit) {
		return globalResponseHandler({
			url: 'comment/' + subjectType + '/' + subjectId + '/list',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取评论列表'
		});
	};

	// 获取热门评论列表
	exports.getListByHot = function(subjectType, subjectId, skip, limit) {
		return globalResponseHandler({
			url: 'comment/' + subjectType + '/' + subjectId + '/list-by-heat',
			data: {
				skip: skip,
				limit: limit
			}
		}, {
			description: '获取热门评论列表'
		});
	};

	// 添加[评论/回复]
	exports.add = function(subjectType, subjectId, text, targetId) {
		var data = {
			text: text
		};
		if (targetId) {
			data.targetUserId = targetId;
		};
		return globalResponseHandler({
			url: 'comment/' + subjectType + '/' + subjectId + '/add',
			type: 'post',
			data: data
		}, {
			description: '添加[评论/回复]'
		});
	};

	// 删除[评论/回复]
	exports.remove = function(commentId) {
		return globalResponseHandler({
			url: 'comment/' + commentId + '/remove',
			type: 'post'
		}, {
			description: '删除[评论/回复]'
		});
	};
	
	exports.praise = {
		// 评论点赞
		add: function(commentId) {
			return globalResponseHandler({
				url: 'comment/' + commentId + '/praise/add',
				type: 'post'
			}, {
				description: '评论点赞'
			});
		},
		// 评论取消赞
		remove: function(commentId) {
			return globalResponseHandler({
				url: 'comment/' + commentId + '/praise/remove',
				type: 'post'
			}, {
				description: '评论取消赞'
			});
		}
	};

});