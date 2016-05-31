define(function(require, exports, module) {
	module.exports = function() {
		var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");
		// document.write(unescape("%3Cspan id='cnzz_stat_icon_1254929763'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D1254929763' type='text/javascript'%3E%3C/script%3E"));
		$("#statistics").html(unescape("%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D1254929763' type='text/javascript'%3E%3C/script%3E"));
	}
});