define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');

	// 墙信息
	exports.get = function(wallId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/get"
		});
	};

	// 获取用户所发送的消息列表
	exports.getUserMessages = function(wallId, userId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/user/text/list",
			userId: userId
		});
	};

	// 添加上墙消息
	exports.addMessage = function(wallId, text) {
 		return globalResponseHandler({
			url: "wall/" + wallId + "/text/add",
			type: "post",
			data: {
				text: text
			}
		});
	};

	// 获取要上墙的消息
	exports.getMessages = function(wallId, skip, limit) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/message/board/iniList",
			data: {
				skip: skip,
				limit: limit
			}
		});
	};

	exports.getNewerMessages = function(wallId, limit, lastId) {
		return globalResponseHandler({
			url: "wall/" + wallId + "/message/board/list",
			data: {
				limit: limit,
				maxId: lastId
			}
		});
	};

	// 获取回复上墙用户列表
	exports.getRepliedUsers=function(wallId,limit){
		return globalResponseHandler({
			url:'wall/'+wallId+'/lottery/user/initiate/list',
			data:{
				howmany:limit
			}
		});
	};

	// 生成获奖名单
	// quantity：本次获奖人数
	exports.makeLottery=function(wallId,quantity){
		return globalResponseHandler({
			url:'wall/'+wallId+'/lottery/draw',
			data:{
				luckyGuy:quantity
			}
		});
	};

	exports.getMessageForShow=function(wallId,skip,limit){
		return globalResponseHandler({
			url:'wall/'+wallId+'/text/list',
			data:{
				skip:skip,
				limit:limit
			}
		});

	};
	exports.getMessageForInitShow=function(wallId,skip,limit){
		return globalResponseHandler({
			url:'wall/'+wallId+'/text/list/initial',
			data:{
				skip:skip,
				limit:limit
			}
		});

	};
});