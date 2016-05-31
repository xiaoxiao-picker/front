define(function (require, exports, module) {
    require('styles/mengxiaozhu.css');
    var baseController = require('baseController');
    var bC = new baseController();
    var template = require('template');
    var Helper = require('helper');
    var mxzService = require("MengxiaozhuService");
    var orgId;
    var mxzInfo;
    var Controller = function () {
        var _controller = this;

        _controller.namespace = "mengxiaozhu.mxzmain";
        _controller.actions = {



        }
    }
    bC.extend(Controller);
    Controller.prototype.init = function (callback) {
        this.recordURL();
        this.callback = callback;
        mxzInfo = {};
        $("#header").html("");
        $("#content").html("");


        this.render();


    }

    Controller.prototype.render = function () {
        var controller = this;
        Helper.setTitle("成绩&课表查询");
        var organization = Application.organization.info;
        var organizationId = organization.id;
        var userId = Application.user.id;
        var schoolName = "schoolName";

        mxzService.getMxzInfo(organizationId, userId, schoolName).done(function (data) {
            mxzInfo = data.result;
            var html = template("app/templates/mengxiaozhu/mxzmain", {
                orgId: orgId,
                mxzInfo: mxzInfo.muni
                //mxzInfo: window.encodeURIComponent(mxzInfo.muni)
            });
            $("#header").html("");
            $("#content").html(html);
        }).fail(function (err) {
            Helper.errorAlert(err);
        }).always(function() {
            Helper.execute(controller.callback);
        });;
    }
    module.exports = Controller;

});
