define(function(require, exports, module) {
	var Helper = require("helper");
	var CommentService = require('CommentService');
	var PraiseService = require("PraiseService");
	var template = require('template');

	var listTemp = "app/templates/public/comment/list";
	var innerTemp = "app/templates/public/comment/inner-list";
	var rowsTemp = "app/templates/public/comment/rows";

	var ModalBox = require('modalbox');
	var modalbox;

	var orgId, userId, skip, pageIndex;

	var CommentBox = function(options) {
		this.namespace = "comment-box";
		this.template = options.template || template;
		this.container = options.container || $(document.body);
		this.options = $.extend({
			state: true,
			sourceId: 0,
			sourceType: 'EVENT',
			limit: 10
		}, options);

		orgId = Application.organization.id;
		userId = Application.user.id;

		addListener(this);
	};

	CommentBox.prototype.render = function() {
		var box = this;
		var options = box.options;

		pageIndex = 0;
		skip = pageIndex * options.limit;

		renderInit(box, function() {
			if (!box.count) {
				box.container.html(template('app/templates/public/empty', {}));
				return;
			}

			var complete = box.count <= box.comments.length;
			box.container.html(box.template(listTemp, {
				orgId: orgId,
				sourceId: options.sourceId,
				sourceType: options.sourceType,
				comments: box.comments,
				complete: complete
			}));
			options.complete && $.isFunction(options.complete) && options.complete.call(box, box.count);
		});
	}

	CommentBox.prototype.renderMore = function(callback) {
		var box = this;
		var options = box.options;

		pageIndex++;
		skip = pageIndex * box.options.limit;

		CommentService.getList(options.sourceType, options.sourceId, skip, options.limit).done(function(data) {
			var comments = makeComments(data.result, box.memberRank);
			box.comments = box.comments.concat(comments);

			box.container.find(".comments").append(box.template(rowsTemp, {
				orgId: orgId,
				sourceId: options.sourceId,
				sourceType: options.sourceType,
				comments: comments
			}));

		}).fail(function(error) {
			Helper.errorAlert(error);
			pageIndex--;
		}).always(function() {
			callback && $.isFunction(callback) && callback.call(box, "");
		});
	}

	/**
	 *	其他页面内容中的评论
	 */
	CommentBox.prototype.innerRender = function() {
		var box = this;
		var options = box.options;
		skip = 0;

		box.container.html(box.template('app/templates/public/loading', {}));
		renderInit(box, function() {
			box.container.html(box.template(innerTemp, {
				orgId: orgId,
				sourceId: options.sourceId,
				sourceType: options.sourceType,
				comments: box.comments,
				count: box.count,
				limit: options.limit
			}));
			options.complete && $.isFunction(options.complete) && options.complete.call(box, box.count);
		});
	};

	function renderInit(box, done) {
		var options = box.options;

		// 获取总数
		var getCount = CommentService.count(options.sourceType, options.sourceId).done(function(data) {
			box.count = data.result;
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		// 获取列表
		var getList = CommentService.getList(options.sourceType, options.sourceId, skip, options.limit).done(function(data) {
			box.comments = data.result;
			box.currentTime = data.time;
		}).fail(function(error) {
			Helper.errorAlert(error);
		});

		$.when(Application.user.getRank(), getCount, getList).done(function() {
			// 获取在当前组织的等级
			box.memberRank = Application.user.rank[orgId];
			box.comments = makeComments(box.comments, box.memberRank, box.currentTime);

			Helper.execute(done);
		});
	};

	function makeComments(comments, memberRank, currentTime) {
		$.each(comments, function(idx, comment) {
			comment.createTime = Helper.dateDiff(comment.createDate, currentTime);
			if (memberRank > 0 || comment.user && comment.user.id == userId) {
				comment.canRemove = true;
			} else {
				comment.canRemove = false;
			}
		});

		return comments;
	};

	function addListener(box) {
		var options = box.options;

		// 显示编辑评论弹出层
		box.container.on('click.' + box.namespace, ".btn-comment", function(evt) {
			showComment();
		});

		// 显示编辑回复弹出层
		box.container.on('click.' + box.namespace, ".btn-reply", function(evt) {
			var _btn = $(this);
			var index = _btn.attr("data-value");
			var comment = box.comments[index];
			showComment(comment.user);
		});

		function showComment(user) {
			require.async('lib.form', function(Form) {
				var textBox = new Form.TextBox({
					title: user ? '编辑回复' : '编辑评论',
					type: 'TEXTAREA',
					placeholder: user ? '@' + (user.nickname || user.phoneNumber || '匿名') : '写下你这一刻的想法...',
					success: function() {
						var _btn = $(this);

						if (Helper.validation.isEmpty(textBox.value)) {
							Helper.alert('评论内容不得为空');
							return;
						};

						Helper.begin(_btn);
						CommentService.add(options.sourceType, options.sourceId, textBox.value, user ? user.id : '').done(function(data) {
							textBox.destroy();
							options.comment && $.isFunction(options.comment) && options.comment.call(box, "");
						}).fail(function(error) {
							Helper.errorAlert(error);
						}).always(function() {
							Helper.end(_btn);
						});
					}
				});
			});
		};

		// 删除[评论/回复]
		box.container.on('click.' + box.namespace, ".btn-remove", function(evt) {
			var _btn = $(this);
			var index = _btn.attr("data-value");
			var comment = box.comments[index];

			Helper.confirm("确认删除该条评论？", {}, function() {
				Helper.begin(_btn);
				CommentService.remove(comment.id).done(function(data) {
					Helper.successToast('删除成功');
					options.remove && $.isFunction(options.remove) && options.remove.call(box, "");
				}).fail(function(error) {
					Helper.errorAlert(error);
				}).done(function() {
					Helper.end(_btn);
				});
			});
		});

		// 点赞
		box.container.on('click.' + box.namespace, ".btn-praise", function(evt) {
			var _btn = $(this);
			var index = _btn.attr("data-value");
			var comment = box.comments[index];

			if (!_btn.hasClass("praising")) {
				_btn.addClass("praising");

				var action = _btn.hasClass("active") ? 'remove' : 'add';

				Helper.begin(_btn);
				CommentService.praise[action](comment.id).done(function(data) {
					var praise_count = +$(_btn.find('.praise-count')).text();

					$(_btn.find('.praise-count')).text(_btn.hasClass("active") ? --praise_count : ++praise_count);
					_btn.toggleClass('active');

				}).fail(function(error) {
					Helper.errorAlert(error);
				}).always(function() {
					Helper.end(_btn);
					_btn.removeClass("praising");
				});
			};

		});
	}

	CommentBox.prototype.destroy = function() {
		var box = this;
		box.container.off("." + box.namespace);
		skip = 0;
		pageIndex = 0;
	}

	function preventDefault(event) {
		event = event || window.event;
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
	};

	module.exports = function(options) {
		return new CommentBox(options);
	};
});