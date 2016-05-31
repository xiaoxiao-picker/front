define(function(require, exports, module) {

    var globalResponseHandler = require('ajaxhandler');
    exports.getMxzInfo = function(orgnizationId, userId, schoolName) {

        return globalResponseHandler({
            url: 'mxz/get',
            data: {
                organizationId: orgnizationId,
                userIdentify: userId,
                schoolName: schoolName
            }
        }, {
            description: '获取萌小助信息'
        });

    };

});
