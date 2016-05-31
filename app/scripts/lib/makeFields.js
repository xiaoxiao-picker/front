define(function(require, exports, module) {
	require("plugins/datepicker/common.css");
	require("plugins/datepicker/iscroll");
	require("plugins/datepicker/date");

	var PKForm = require("lib.form");
	var template = require("template");
	var Helper = require("helper");

	module.exports = function(fields, namespace) {
		var $html = $(template("app/templates/public/require/fields", {
			fields: fields
		}));

		$html.on("click." + namespace, ".content", function() {
			var $form = $(this).parents(".form-group");
			var fieldId = $form.attr("data-field-id");
			var field = fields.objOfAttr("id", fieldId);
			if (field.type == "TEXT" || field.type == "TEXTAREA") {
				PKForm.TextBox({
					title: field.name,
					value: field.value || "",
					placeholder: field.name,
					type: field.type,
					success: function() {
						var modal = this;
						var value = modal.value;
						field.value = value;
						modal.destroy();
						$form.find(".content")[value ? "addClass" : "removeClass"]("active");
						if (modal.options.type == "TEXT") {
							$form.find(".context").html(value);
						} else {
							var html = "";
							var texts = value.split('\n');
							$(texts).each(function(idx, text) {
								html += "<p>" + text + "</p>"
							});
							$form.find(".context").html(html);
						}
					}
				});
			} else if (field.type == "RADIO" || field.type == "CHECKBOX") {
				PKForm.ChoiceBox({
					title: field.name,
					type: field.type,
					options: field.options,
					success: function(values, btn) {
						var modal = this;
						var html = "";
						$(field.options).each(function(idx, option) {
							if (values.indexOf(option.id) > -1) {
								option.selected = true;
								html += "<p>" + option.name + "</p>"
							} else {
								option.selected = false;
							}
						});
						$form.find(".content")[values.length ? "addClass" : "removeClass"]("active");
						$form.find(".context").html(html);
					}
				});
			}
		});

		$html.filter(".DATE").find(".content").each(function(idx, item) {
			var fieldId = $(item).parents(".form-group").attr("data-field-id");
			var field = fields.objOfAttr("id", fieldId);
			$(item).date({}, function(date) {
				if (!date) return;
				field.value = new Date(date).getTime();
				$(item).addClass("active").find(".context").html(date);
			});
		});

		// 删除上传的图片
		$html.on("click." + namespace, "[removeImage]", function() {
			var fieldId = $(this).parents(".form-group").attr("data-field-id");
			var field = fields.objOfAttr("id", fieldId);
			var $image = $(this).parents(".image");
			var image = $image.attr("data-value");
			field.values.remove(image);
			$image.slideUp(200, function() {
				$image.remove();
			});

			var $imageAdd = $image.nextAll(".image-add");
			if (field.options && (field.options.limit && field.values.length < field.options.limit)) {
				$imageAdd.removeClass('hide');
			};
		});

		$html.on("change." + namespace, "[type='file']", function() {
			var fieldId = $(this).parents(".form-group").attr("data-field-id");
			var field = fields.objOfAttr("id", fieldId);
			var $input = $(this);
			var file = $input.get(0).files[0];
			require.async("lib.imageUploader", function(imageUploader) {
				imageUploader(file, {
					beforeUpload: function() {
						$input.parents(".image-add").addClass("loading");
					},
					success: function(imageUrl) {
						var $imageAdd = $input.parents(".image-add").addClass("loading");
						field.values.push(imageUrl);
						$imageAdd.before('<div class="image" data-value="' + imageUrl + '"><button class="btn btn-close btn-danger" removeImage><span class="iconfont icon-close"></span></button><img src="' + imageUrl + '@100w_100h_1e_1c" /></div>');
						$imageAdd.removeClass("loading");
						if (field.options && (field.options.limit && field.values.length >= field.options.limit)) {
							$imageAdd.addClass('hide');
						};
					},
					error: function(message) {
						Helper.alert(message);
					},
					always: function() {
						$input.parents(".image-add").removeClass("loading");
					}
				});
				$input.val("");
			});
		});


		return $html;
	}
});