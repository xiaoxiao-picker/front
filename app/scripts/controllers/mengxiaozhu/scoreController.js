define(function(require, exports, module) {
    var baseController = require('baseController');
    var bC = new baseController();
    var Helper = require('helper');
    var orgId;
    var Controller = function() {
    };
    bC.extend(Controller);
    Controller.prototype.init = function() {
        var organization = Application.organization.info;
        orgId = organization.id;
        Helper.jump('#organization/' + orgId + '/mengxiaozhu/mxzmain');
    }
    module.exports = Controller;

});
