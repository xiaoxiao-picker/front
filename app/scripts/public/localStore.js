/**
 * 本地数据存储
 */
define(function(require, exports, module) {
	
	// 本地存储页面标题
	// page参数请带上orgId，以区分组织
	exports.storePageTitle = function(orgId, page, title) {
		orgId = orgId + "";
		var orgs = store.get("localOrgs", {});

		orgs[orgId] = orgs[orgId] ? orgs[orgId] : {};
		orgs[orgId].pages = orgs[orgId].pages ? orgs[orgId].pages : {};
		orgs[orgId].pages[page] = orgs[orgId].pages[page] ? orgs[orgId].pages[page] : {};
		orgs[orgId].pages[page].title = title;

		store.set("localOrgs", orgs);
	};

	
	exports.getStoredOrgTitle = function(orgId, title) {
		var orgId = orgId + "";
		var orgs = store.get("localOrgs", {});
		orgs[orgId] = orgs[orgId] ? orgs[orgId] : {};
		orgs[orgId].pages = orgs[orgId].pages ? orgs[orgId].pages : {};
		orgs[orgId].pages[title] = orgs[orgId].pages[title] ? orgs[orgId].pages[title] : {};
		return orgs[orgId].pages[title].title;
	};


	exports.userConfig = {
		set: function(key, value) {
			var USERCONFIG = store.get("USERCONFIG", {});
			USERCONFIG[key] = value;
			store.set("USERCONFIG", USERCONFIG);
		},
		get: function(key) {
			var USERCONFIG = store.get("USERCONFIG", {});
			return key ? USERCONFIG[key] : USERCONFIG;
		}
	};
});