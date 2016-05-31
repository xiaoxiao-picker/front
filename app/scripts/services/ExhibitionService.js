define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 获取组织风采总数
	exports.count = function(orgId, categoryId) {
		var data = categoryId != "ALL" ? {
			orgClassId: categoryId
		} : {};
		return globalResponseHandler({
			url: 'organization/' + orgId + '/exhibition/count',
			data: data
		}, {
			description: '获取组织风采总数'
		});
	};

	// 获取组织风采列表
	exports.getList = function(orgId, categoryId, skip, limit) {
		var data = {
			skip: skip,
			limit: limit
		};
		if (categoryId != "ALL") {
			data.orgClassId = categoryId;
		}
		return globalResponseHandler({
			url: 'organization/' + orgId + '/exhibition/list',
			data: data
		}, {
			description: '获取组织风采列表'
		});
	};

	// 获取组织风采详情
	exports.get = function(orgId, orgExhibitionId) {
		return globalResponseHandler({
			url: 'organization/' + orgId + '/exhibition/' + orgExhibitionId + '/get'
		}, {
			description: '获取组织风采详情'
		});
	};

	exports.school = {
		count: function(city) {
			return globalResponseHandler({
				url: 'exhibition/count',
				data: {
					city: city
				}
			}, {
				description: '获取学校风采总数'
			});
		},
		getList: function(city, skip, limit) {
			return globalResponseHandler({
				url: 'exhibition/list',
				data: {
					city: city,
					skip: skip,
					limit: limit
				}
			}, {
				description: '获取学校风采列表'
			});
		},
		get: function(exhibitionId) {
			return globalResponseHandler({
				url: 'exhibition/' + exhibitionId + '/get'
			}, {
				description: '获取学校风采详情'
			});
		},
		wechat: {
			count: function(exhibitionId) {
				return globalResponseHandler({
					url: 'exhibition/school/' + exhibitionId + '/qr-code/count'
				}, {
					description: '获取公众号二维码总数'
				});
			},
			getList: function(exhibitionId, skip, limit) {
				return globalResponseHandler({
					url: 'exhibition/school/' + exhibitionId + '/qr-code/list',
					data: {
						skip: skip,
						limit: limit
					}
				}, {
					description: '获取公众号二维码列表'
				});
			}
		}
	};

});