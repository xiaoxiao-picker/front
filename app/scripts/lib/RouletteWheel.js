/**
 *  抽奖大转盘
 */
define(function(require, exports, module) {
    var template = require("template");
    var Helper = require('helper');
    require('plugins/jquery.rotate.min.js');
    require('plugins/jquery.easing.min.js');

    var StartTimeout;
    var EveryArc, StartTime;
    var CurrentIndex, CurrentAngle;

    var Wheel = function(canvas, awards, options) {
        var wheel = this;
        this.canvas = canvas;
        this.awards = awards;
        this.options = $.extend({
            startAngle: -Math.PI / 2, //起始角度
            minTime: 2000, //最小旋转时间
            velocity: 360 * 2, //速度               
            unitTime: 1000, //单位时间
            start: function() {},
            stop: function() {}
        }, options);

        EveryArc = Math.PI * 2 / awards.length;
        CurrentAngle = 0;
        CurrentIndex = 0;

        this.render();
        getCurrentIndex();
    };

    Wheel.prototype.render = function() {
        var options = this.options;
        var awards = this.awards;
        var canvas = this.canvas;

        // 移动端canvas显示分辨率放大一倍
        canvas.width = ($('body').width() * 0.78 - 12) * 2;
        canvas.height = canvas.width;

        if (canvas.getContext) {
            var outsideRadius = canvas.width / 2;
            var textRadius = canvas.width * 3 / 5;
            var insideRadius = outsideRadius / 3;

            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.strokeStyle = "#eece5b";
            context.lineWidth = 2;
            context.font = 'bold 26px sans-serif';

            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;
            for (var i = 0; i < awards.length; i++) {
                var award = awards[i];
                var angle = options.startAngle + i * EveryArc;
                context.fillStyle = '#ffeeb0';
                context.beginPath();
                context.arc(centerX, centerY, outsideRadius, angle, angle + EveryArc, false);
                context.arc(centerX, centerY, insideRadius, angle + EveryArc, angle, true);
                context.closePath();
                context.stroke();
                context.fill();

                var text = award['name'];
                context.save();
                context.fillStyle = "#fa425a";
                context.translate(centerX + Math.cos(angle + EveryArc / 2) * textRadius * 2 / 3, outsideRadius + Math.sin(angle + EveryArc / 2) * textRadius * 2 / 3);
                context.rotate(angle + EveryArc / 2 + Math.PI / 2);
                context.fillText(text, -context.measureText(text).width / 2, 10);
                context.restore();

                var iconUrl = award['iconUrl'];
                if (iconUrl) {
                    preImage(iconUrl, i, function(index) {
                        var angle = options.startAngle + index * EveryArc;
                        context.save();
                        context.translate(centerX + Math.cos(angle + EveryArc / 2) * textRadius * 2 / 3, outsideRadius + Math.sin(angle + EveryArc / 2) * textRadius * 2 / 3);
                        context.rotate(angle + EveryArc / 2 + Math.PI / 2);
                        context.drawImage(this, -insideRadius / 3, 35, insideRadius * 2 / 3, insideRadius * 2 / 3);
                        context.restore();
                    });
                };
            }

            $('#BtnLottery').css({
                width: insideRadius,
                height: insideRadius
            });
        }
    };

    Wheel.prototype.startRotate = function() {
        var wheel = this;
        var options = wheel.options;
        var canvas = wheel.canvas;

        StartTime = new Date().getTime();

        function start() {
            $(canvas).rotate({
                angle: CurrentAngle,
                duration: options.unitTime,
                animateTo: CurrentAngle + options.velocity,
                easing: function(x, t, b, c, d) {
                    return c * (t / d) + b;
                }
            });
            CurrentAngle += options.velocity;
            StartTimeout = setTimeout(start, options.unitTime);
        };
        start();

        options.start && $.isFunction(options.start) && options.start.call(wheel);
    };

    Wheel.prototype.willStopRotate = function(awardIndex) {
        var wheel = this;
        var options = wheel.options;
        var canvas = wheel.canvas;

        // 减速
        var time = new Date().getTime() - StartTime;
        if (time < options.minTime) {
            setTimeout(stop, options.minTime - time);
        } else {
            setTimeout(stop);
        }

        function stop() {
            clearTimeout(StartTimeout);
            getCurrentIndex();

            var totalAngle = 0;
            var everyAngle = EveryArc * 180 / Math.PI;
            totalAngle = (360 - (awardIndex - CurrentIndex) * everyAngle) + 360;
            totalAngle -= everyAngle / 2;

            $(canvas).rotate({
                angle: CurrentAngle,
                duration: 2000,
                animateTo: CurrentAngle + totalAngle,
                easing: $.easing.easeOutSine
            });
            setTimeout(function() {
                wheel.didStopRotate();
            }, 2000);
        }
    };

    Wheel.prototype.didStopRotate = function() {
        var wheel = this;
        var options = wheel.options;

        clearTimeout(StartTimeout);
        getCurrentIndex();

        options.stop && $.isFunction(options.stop) && options.stop.call(wheel);
    };

    Wheel.prototype.reset = function() {
        var wheel = this;
        var options = wheel.options;
        var canvas = wheel.canvas;

        clearTimeout(StartTimeout);
        $(canvas).rotate({
            angle: CurrentAngle,
            duration: 1,
            animateTo: 0
        });
        getCurrentIndex();
        options.stop && $.isFunction(options.stop) && options.stop.call(wheel);
    };

    function getCurrentIndex() {
        var everyAngle = EveryArc * 180 / Math.PI;
        CurrentIndex = Math.floor((360 - CurrentAngle % 360) / everyAngle);
    };

    function preImage(url, index, callback) {
        var img = new Image();
        img.src = url;

        if (img.complete) {
            callback.call(img, index);
            return;
        }

        img.onload = function() {
            callback.call(img, index);
        };
    }

    module.exports = Wheel;
});
