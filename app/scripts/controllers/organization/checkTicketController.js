define(function(require, exports, module) {
    require("styles/organization.css");

    var baseController = require('baseController');
    var bC = new baseController();
    var template = require('template');
    var Helper = require('helper');
    var OrganizationService = require("OrganizationService");

    var orgId;

    var ticketSourceId, ticketUserId, ticketCaptcha;

    var Controller = function() {
        var _controller = this;
        _controller.namespace = "organization.ticket.check";
        _controller.actions = {
            goBack: (function() {
                return window.wx ? function() {
                    window.wx.closeWindow();
                } : null;
            })(),
            scanQRCode: function() {
                window.wx && window.wx.scanQRCode({
                    needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    success: function(res) {
                        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    }
                });
            },
            scanQRCodeByToken: function() {
                var ticketToken = $('input[name=verificationToken]').val();
                Helper.userConfig.set('ticketToken', ticketToken);

                window.wx && window.wx.scanQRCode({
                    needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    success: function(res) {
                        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    }
                });
            }
        };
    };

    bC.extend(Controller);
    /**
     * 初始化参数，渲染模板
     */
    Controller.prototype.init = function(callback) {
        this.recordURL();

        orgId = Application.organization.id;
        this.backURL = '#organization/' + orgId + '/index';

        ticketSourceId = Helper.param.hash("sid");
        ticketCaptcha = Helper.param.search("captcha");

        if (!ticketSourceId || !ticketCaptcha) {
            Application.whoAmI("无效的电子票！");
            Helper.execute(callback);
            return;
        }

        render(callback);
    };

    /**
     * 模板渲染函数
     */
    function render(callback) {
        Helper.setTitle("电子票-检票");
        $("#header").html(template("app/templates/public/header", {
            title: '检票',
            user: Application.user.info
        }));
        var scanQRCodeApi = window.wx && window.wx.scanQRCode; //&& window.wxApiResult && window.wxApiResult.scanQRCode;

        Application.user.getRank().done(function() {
            renderResult();
        }).fail(function(error) {
            Helper.alert(error);
        });

        function renderResult() {
            var rank = Application.user.rank[orgId];

            if (rank > 0) {
                var getToken = OrganizationService.ticket.getToken(ticketSourceId);
                var getResult = OrganizationService.ticket.check(ticketSourceId, ticketCaptcha);

                $.when(getToken, getResult).done(function(data1, data2) {
                    var ticketToken = data1.result;
                    var result = data2.result;
                    $("#content").html(template("app/templates/organization/checkticket", {
                        result: result ? true : false,
                        message: result ? "检票成功！" : "检票失败！",
                        scanQRCodeApi: scanQRCodeApi,
                        token: ticketToken
                    }));
                }).fail(function(error) {
                    $("#content").html(template("app/templates/organization/checkticket", {
                        result: false,
                        message: error,
                        scanQRCodeApi: scanQRCodeApi
                    }));
                }).always(function() {
                    Helper.execute(callback);
                });
            } else {
                var ticketToken = Helper.userConfig.get('ticketToken');

                if (!ticketToken) {
                    $("#content").html(template("app/templates/organization/tickettoken", {
                        scanQRCodeApi: scanQRCodeApi
                    }));
                    Helper.execute(callback);
                    return;
                };

                OrganizationService.ticket.check(ticketSourceId, ticketCaptcha, ticketToken).done(function(data) {
                    var result = data.result;
                    $("#content").html(template("app/templates/organization/checkticket", {
                        result: result ? true : false,
                        message: result ? "检票成功！" : "检票失败！",
                        scanQRCodeApi: scanQRCodeApi
                    }));
                }).fail(function(error) {
                    if (error == '检票验证码错误') {
                    	Helper.errorToast(error);
                        $("#content").html(template("app/templates/organization/tickettoken", {
                            scanQRCodeApi: scanQRCodeApi
                        }));
                    } else {
                        $("#content").html(template("app/templates/organization/checkticket", {
                            result: false,
                            message: error,
                            scanQRCodeApi: scanQRCodeApi
                        }));
                    }

                }).always(function() {
                    Helper.execute(callback);
                });
            }
        }
    };


    module.exports = Controller;
});
