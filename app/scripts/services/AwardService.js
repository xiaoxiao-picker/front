define(function(require, exports, module) {
	var globalResponseHandler = require('ajaxhandler');
	//award：name、imgUrl、description
	//award_result: awardId、userId	

	//add event award POST Method
	// exports.addEventAward = function(eventId) {
	// 	return globalResponseHandler({
	// 		url: 'event/' + eventId + '/award/add',
	// 		type: 'post'
	// 	});
	// };

	// update event award POST Method
	// exports.updateEventAward = function(eventId, awardId) {
	// 	return globalResponseHandler({
	// 		url: 'event/' + eventId + '/award/' + awardId + '/update',
	// 		type: 'post',
	// 		data: data
	// 	});
	// };

	//get evnets all award  GET Method
	// exports.getEventAllAward = function(eventId) {
	// 	return globalResponseHandler({
	// 		url: 'event/' + eventId + '/award/list'
	// 	});
	// };


	//get the award evnet   GET Method
	// exports.getEventAllAward = function(eventId, awardId) {
	// 	return globalResponseHandler({
	// 		url: 'event/' + eventId + '/award/' + awardId + '/list'
	// 	});
	// };

	//remove event Award By Id
	// exports.removeAwardById = function(eventId, awardId) {
	// 	return globalResponseHandler({
	// 		url: 'event/' + eventId + '/award/' + awardId + '/delete',
	// 		type: 'post'
	// 	});
	// };



	/**
	 * get all event Award by userid GET Method
	 * options:
	 * 	skip  		require
	 * 	limit  		require
	 * 	fromType	['event','org']
	 * 	fromId		['eventId','orgId']
	 */
	exports.getUserAwards = function(userId, skip, limit, options) {
		options.skip = skip;
		options.limit = limit;
		return globalResponseHandler({
			url: 'user/' + userId + '/award/list',
			data: options
		});

	};

	//get user award information  GET  Method
	exports.getAwardOfUser = function(userId, awardId, type, session) {
		return globalResponseHandler({
			url: 'user/' + userId + '/award/' + awardId + '/get',
			data: {
				session: session,
				type: type
			}
		});

	};

});