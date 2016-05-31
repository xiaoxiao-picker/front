 define(function(require, exports, module) {
 	require('styles/proposal.css');

 	var baseController = require('baseController');
 	var bC = new baseController();
 	var template = require('template');
 	var Helper = require('helper');
 	var date = require('date');
 	var ProposalService = require("ProposalService");

 	var CategorySelector = require('lib.categorySelector');
 	var categorySelector;

 	var orgId;

 	var categoryId, status, limit, title;

 	var sortType = "TIME"; // TIME-[最新],HOT-[最热]

 	var Controller = function() {
 		var controller = this;
 		this.namespace = "proposal.list";
 		this.actions = {
 			selectCategory: function() {
 				var categories = Application.organization.proposalCategories.clone();
 				categories.splice(0, 0, {
 					id: "",
 					name: "全部分类"
 				});

 				$(categories).each(function(idx, category) {
 					category.selected = category.id == categoryId;
 					category.url = "#organization/" + orgId + "/proposals&categoryId=" + category.id + "&status=" + status + "&title=" + title;
 				});

 				if (categorySelector && categorySelector.isActive) {
 					categorySelector.close();
 				} else {
 					categorySelector = CategorySelector({
 						categories: categories
 					});
 				}
 			},
 			search: function() {
 				require.async('lib.searchBox', function(SearchBox) {
 					SearchBox('', {
 						search: function(btn) {
 							keyword = this.value;
 							if (!this.value || Helper.validation.isEmpty(this.value)) {
 								Helper.errorToast('请输入搜索关键词');
 								return;
 							}

 							Helper.begin(btn);
 							ProposalService.getList({
 								organizationId: orgId,
 								skip: 0,
 								limit: 100,
 								keyword: keyword
 							}).done(function(data) {
 								var proposals = makeProposals(data.result);
 								$("#SearchResults").html(template('app/templates/proposal/results-inner', {
 									orgId: orgId,
 									proposals: proposals
 								}));
 							}).fail(function(error) {
 								Helper.errorToast(error);
 							}).always(function() {
 								Helper.end(btn);
 							});
 						}
 					});
 				});
 			},
 			loadMore: function() {
 				var $btn = this;
 				if (controller.proposals.length < controller.count) {
 					loadMore(controller, $btn);
 				}
 			},
 			// 跳转编辑
 			add: function() {
 				Helper.jump('#organization/' + orgId + '/proposal/edit');
 			},
 			resort: function() {
 				var $btn = this;
 				var type = $(this).attr("data-sort-type");
 				if (type == sortType) return;
 				sortType = type;
 				controller.proposals = [];

 				Helper.loader.show();
 				controller.render(function(){
 					Helper.loader.hide();
 				});
 			}
 		};
 	};

 	bC.extend(Controller);

 	Controller.prototype.init = function() {
 		this.templateUrl = "app/templates/proposal/list";
 		this.recordURL();

 		orgId = Application.organization.id;
 		title = decodeURIComponent(Helper.param.search("title"));
 		status = Helper.param.search('status') || 'UNSOLVED';
 		categoryId = Helper.param.search("categoryId") || "";
 		this.backURL = '#organization/' + orgId + '/index';
 		limit = +Helper.param.search("limit") || 10;

 		// 存储标题
 		if (title) {
 			Helper.storePageTitle(orgId, "proposals", title);
 		}
 		title = title || Helper.getStoredOrgTitle(orgId, "proposals") || "提案列表";
 		Helper.setTitle(title);

 		this.proposals = [];
 		this.count = 0;

 		this.render(this.callback);
 	};


 	Controller.prototype.render = function(callback) {
 		var controller = this;

 		var organization = Application.organization.info;
 		// 微信分享用
 		var imgUrl = organization.logoUrl ? organization.logoUrl + '@300w_300h_1e_1c' : "";
 		this.share(title, imgUrl, "热门提案全在这 — " + organization.name, window.location.href);

 		(function renderList() {
 			// render header
 			var renderHeader = Application.organization.getProposalCategoryList().done(function() {
 				var categories = Application.organization.proposalCategories.clone();
 				proposalCategoryFilter(categories);
 				var category = categories.objOfAttr("id", categoryId);

 				if (!category) {
 					categoryId = "";
 				}
 				var name = category ? category.name : "全部分类";
 				$("#header").html(template("app/templates/public/header", {
 					title: status == 'USER' ? '我的' : '<a data-xx-action="selectCategory"><span>' + name + '</span><span class="iconfont icon-arrow-drop-down"></span></a>',
 					user: Application.user.info
 				}));
 			});

 			$.when(renderHeader, status == 'USER' ? ProposalService.user.count() : ProposalService.count(orgId, status, categoryId)).done(function(data1, data2) {
 				controller.count = data2.result;
 				renderInit();
 			}).fail(function(error) {
 				Helper.alert(error);
 			}).always(function() {
 				Helper.execute(callback);
 			});

 			function renderInit() {
 				$("#content").html(template(controller.templateUrl, {
 					orgId: orgId,
 					title: title,
 					currentTab: status,
 					sortType: sortType
 				}));

 				if (!controller.count) {
 					$(".proposal-list-container").html(template('app/templates/public/empty', {}));
 					return;
 				}

 				$(".btn-more").trigger("click");


 				// 页面滑动到底部自动加载
 				controller.scrollToBottom(function() {
 					if (controller.state == "loading") return;
 					if (controller.count > controller.proposals.length) {
 						$(".btn-more").trigger("click");
 					}
 				});
 			}
 		})();
 	};



 	function loadMore(controller, btn) {
 		controller.state = 'loading';
 		var skip = controller.proposals.length;

 		Helper.begin(btn);
 		if (status == 'USER') {
 			ProposalService.user.getList(skip, limit).done(function(data) {
 				var proposals = makeProposals(data.result, data.time);
 				controller.proposals = controller.proposals.concat(proposals);
 				success(proposals);
 			}).fail(function(error) {
 				Helper.alert(error);
 			}).always(function() {
 				controller.state = 'complete';
 			});
 		} else {
 			ProposalService.getList({
 				organizationId: orgId,
 				state: status,
 				skip: skip,
 				limit: limit,
 				categoryId: categoryId,
 				heat: sortType == "HOT"
 			}).done(function(data) {
 				var proposals = makeProposals(data.result, data.time);
 				controller.proposals = controller.proposals.concat(proposals);
 				success(proposals);
 			}).fail(function(error) {
 				Helper.alert(error);
 			}).always(function() {
 				controller.state = 'complete';
 			});
 		}

 		function success(proposals) {
 			$("#Proposals").append(template('app/templates/proposal/list-inner', {
 				proposals: proposals,
 				status: status,
 				orgId: orgId
 			}));
 			var complete = controller.count <= controller.proposals.length;
 			$(".more-container")[complete ? "addClass" : "removeClass"]("complete");

 			Helper.end(btn);
 		}
 	}

 	function makeProposals(proposals, currentTime) {
 		$.each(proposals, function(idx, proposal) {
 			proposal.createTime = Helper.dateDiff(proposal.createDate, currentTime);
 		});
 		return proposals;
 	}

 	function proposalCategoryFilter(categories) {
 		template.helper("proposalCategoryFilter", function(categoryId) {
 			var category = categories.objOfAttr("id", categoryId);
 			return category ? category.name : "未分类";
 		});
 	}


 	module.exports = Controller;
 });