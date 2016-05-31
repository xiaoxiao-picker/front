define(function(require, exports, module) {
    var globalResponseHandler = require('ajaxhandler');

    exports.get = function(lotteryId) {
        return globalResponseHandler({
            url: 'lottery/' + lotteryId + '/get'
        }, {
            description: '获取抽奖详情'
        });
    };

    exports.draw = function(lotteryId) {
        return globalResponseHandler({
            url: 'lottery/' + lotteryId + '/draw',
            type: 'post'
        }, {
            description: '抽奖'
        });
    };

    exports.award = {
        getList: function(lotteryId) {
            return globalResponseHandler({
                url: 'lottery/' + lotteryId + '/award'
            }, {
                description: '获取抽奖结果'
            });
        },
        get: function(lotteryId, awardId) {
            return globalResponseHandler({
                url: 'lottery/' + lotteryId + '/award/' + awardId + '/get'
            }, {
                description: '获取中奖结果详情'
            });
        },
        check: function(lotteryId, awardId) {
            return globalResponseHandler({
                url: 'lottery/' + lotteryId + '/award/' + awardId + '/check'
            }, {
                description: '检查是否为本人中奖奖品'
            });
        }
    };

    exports.getRegister = function(lotteryId) {
        return globalResponseHandler({
            url: 'lottery/' + lotteryId + '/register/get'
        }, {
            description: '获取中奖所需信息'
        });
    };

    exports.signup = function(lotteryId, signUpInfo) {
        return globalResponseHandler({
            url: 'lottery/' + lotteryId + '/register/sign-up',
            type: 'post',
            data: {
            	signUpInfo: signUpInfo
            }
        }, {
            description: '填写中奖所需信息'
        });
    };

    exports.getResult = function(lotteryId) {
        return globalResponseHandler({
            url: 'lottery/' + lotteryId + '/register/result'
        }, {
            description: '获取填写过的中奖所需信息'
        });
    };

});
