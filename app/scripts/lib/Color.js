/**
 * 颜色处理对象
 */
define(function(require, exports, module) {

	function RGBA(rgba) {
		this.color = rgba;
	};
	RGBA.prototype.R = function() {
		var RegAlpha = new RegExp("rgba\\(([\\d]+)\\,[\\d]+\\,[\\d]+\\,[\\.\\d]+\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGBA.prototype.G = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,([\\d]+)\\,[\\d]+\\,[\\.\\d]+\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGBA.prototype.B = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,[\\d]+\\,([\\d]+)\\,[\\.\\d]+\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGBA.prototype.A = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,[\\d]+\\,[\\d]+\\,([\\.\\d]+)\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 1;
	};
	RGBA.prototype.O = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,[\\d]+\\,[\\d]+\\,([\\.\\d]+)\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1]) * 100) : 100;
	};
	RGBA.prototype.get = function() {
		return {
			R: this.R(),
			G: this.G(),
			B: this.B(),
			A: this.A(),
			O: this.O()
		};
	};
	exports.RGBA = function(rgba) {
		return new RGBA(rgba);
	};


	function RGB(rgb) {
		this.color = rgb;
	};
	RGB.prototype.R = function() {
		var RegAlpha = new RegExp("rgba\\(([\\d]+)\\,[\\d]+\\,[\\d]+\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGB.prototype.G = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,([\\d]+)\\,[\\d]+\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGB.prototype.B = function() {
		var RegAlpha = new RegExp("rgba\\([\\d]+\\,[\\d]+\\,([\\d]+)\\)");
		var result = this.color.match(RegAlpha);
		return result ? Math.round((+result[1])) : 0;
	};
	RGB.prototype.get = function() {
		return {
			R: this.R(),
			G: this.G(),
			B: this.B()
		};
	};
	exports.RGB = function(rgb) {
		return new RGB(rgb);
	};
});