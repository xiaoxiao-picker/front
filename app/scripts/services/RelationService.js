define(function(require, exports, module) {
    var globalResponseHandler = require('ajaxhandler');

    exports.getList = function(sourceType, sourceId, targetType) {
        return globalResponseHandler({
            url: sourceType + '/' + sourceId + '/relation/' + targetType + '/list'
        }, {
            description: '获取绑定对象的内容'
        });
    };

});
