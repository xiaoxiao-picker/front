define(function(require, exports, module) {
	"use strict";

	var EventService = require("EventService");
	var ArticleService = require("ArticleService");
	var ProposalService = require("ProposalService");
	var OrganizationService = require('OrganizationService');
	var RelatedOrganizationService = require("RelatedOrganizationService");

	var Organization = function(id, options) {
		options = $.extend({}, options);
		this.id = id;
		this.info = options.info;
	};

	Organization.prototype.reload = function() {
		var organization = this;
		return OrganizationService.get(organization.id).done(function(data) {
			organization.info = data.result;
		});
	};

	Organization.prototype.getConfig = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.config) {
			return OrganizationService.getOrganizationConfig(organization.id).done(function(data) {
				organization.config = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getWechat = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.wechat) {
			return OrganizationService.getWechat(organization.id).done(function(data) {
				organization.wechat = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getExtend = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.extend) {
			return OrganizationService.getExtendInfo(organization.id).done(function(data) {
				organization.extend = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getCategoryList = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.categories) {
			return OrganizationService.getCategoryList(organization.id).done(function(data) {
				organization.categories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getEventCategoryList = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.eventCategories) {
			return EventService.getCategoryList(organization.id).done(function(data) {
				organization.eventCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getArticleCategoryList = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.articleCategories) {
			return ArticleService.getCategoryList(organization.id).done(function(data) {
				organization.articleCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getProposalCategoryList = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.proposalCategories) {
			return ProposalService.getCategoryList(organization.id).done(function(data) {
				organization.proposalCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	// 获取已关联组织的数量
	Organization.prototype.getRelatedOrganizationCount = function(refresh) {
		var organization = this;
		refresh = refresh ? true : false;
		if (refresh || !organization.hasOwnProperty("relatedOrganizationCount")) {
			return RelatedOrganizationService.getCount(organization.id).done(function(data) {
				organization.relatedOrganizationCount = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	module.exports = function(id, options) {
		return new Organization(id, options);
	};


	// 返回一个拒绝的Deferred对象
	function resolveDeferredObject() {
		var defer = $.Deferred();
		defer.resolve();
		return defer.promise();
	}
});