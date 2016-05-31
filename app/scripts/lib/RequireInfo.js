define(function(require, exports, module) {
	// 所需信息
	function makeRequiredInfos(texts, dates, choices, images) {
		var infos = [];
		for (var i = 0; i < texts.length; i++) {
			var text = texts[i];
			infos.push(ElseInfo(text.id, text.title, text.type, text.required, text.rank));
		};

		for (var i = 0; i < dates.length; i++) {
			var date = dates[i];
			infos.push(ElseInfo(date.id, date.title, "DATE", date.required, date.rank));
		};

		for (var i = 0; i < choices.length; i++) {
			var choice = choices[i];
			var type = choice.type == "SINGLETON" ? "RADIO" : "CHECKBOX";
			infos.push(ElseInfo(choice.id, choice.title, type, choice.required, choice.rank, choice.options));
		};

		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			infos.push(ElseInfo(image.id, image.title, "IMAGE", image.required, image.rank, image.options));
		};

		// 将信息按 rank 排序
		return infos.sort(function(info1, info2) {
			return info1.rank - info2.rank;
		});

		function ElseInfo(id, title, type, required, rank, options) {
			var baseNames = {
				name: "姓名(Name)",
				phoneNumber: "手机号(Mobile)",
				gender: "性别",
				school: "学校",
				studentId: "学号",
				grade: "入学时间"
			};
			return {
				id: id,
				title: title,
				name: baseNames[title] || title,
				type: type,
				required: required,
				rank: rank,
				options: options
			};
		};
	};

	// 处理结果
	function makeResult(texts, dates, images, choices, options) {
		var infos = [];
		for (var i = 0; i < texts.length; i++) {
			var value = texts[i].value;
			var text = texts[i].text;
			if (text.title == "gender") {
				// value = ["保密", "男", "女"][value];
				infos.push(ElseInfo(text.id, text.title, "TEXT", value, text.required, text.rank));
			} else if (text.title == "grade") {
				infos.push(ElseInfo(text.id, text.title, "DATE", value, text.required, text.rank));
			} else {
				infos.push(ElseInfo(text.id, text.title, text.textType, value, text.required, text.rank));
			}
		};

		for (var i = 0; i < dates.length; i++) {
			var value = dates[i].value;
			var date = dates[i].date;
			infos.push(ElseInfo(date.id, date.title, "DATE", value, date.required, date.rank));
		};

		for (var i = 0; i < choices.length; i++) {
			var choice = choices[i];
			var type = choice.choiceType == "SINGLETON" ? "RADIO" : "CHECKBOX";
			infos.push(ElseInfo(choice.id, choice.title, type, "", choice.required, choice.rank, makeOptions(choice.options, options)));
		};

		for (var i = 0; i < images.length; i++) {
			var value = images[i].value;
			var image = images[i].image;
			infos.push(ElseInfo(image.id, image.title, "IMAGE", value, image.required, image.rank));
		};

		// 将信息按 rank 排序
		return infos.sort(function(info1, info2) {
			return info1.rank - info2.rank;
		});

		function makeOptions(options, results) {
			var outputs = [];
			for (var i = 0; i < options.length; i++) {
				outputs.push({
					id: options[i].id,
					name: options[i].name,
					selected: results.indexOf(options[i].id) != -1
				});
			};
			return outputs;
		};

		function ElseInfo(id, title, type, value, required, rank, options) {
			var baseNames = {
				name: "姓名(Name)",
				phoneNumber: "手机号(Mobile)",
				gender: "性别",
				school: "学校",
				studentId: "学号",
				grade: "入学时间"
			};
			return {
				id: id,
				title: title,
				name: baseNames[title] || title,
				value: value,
				type: type,
				required: required,
				rank: rank,
				options: options
			};
		};
	};

	exports.makeRequiredInfos = makeRequiredInfos;

	// 结果组装
	exports.makeResult = makeResult;

	exports.fieldsToData = function(fields) {
		var data = {
			userTexts: [],
			userDates: [],
			userOptions: [],
			userImages: []
		};
		$(fields).each(function(idx, field) {
			if (field.type == "TEXT" || field.type == "TEXTAREA") {
				if (field.value) {
					data.userTexts.push({
						id: field.id,
						value: field.value
					});
				}
			} else if (field.type == "DATE") {
				if (field.value) {
					data.userDates.push({
						id: field.id,
						value: new Date(field.value).getTime()
					});
				}
			} else if (field.type == "RADIO" || field.type == "CHECKBOX") {
				data.userOptions = data.userOptions.concat(getCheckedOptions(field.options));
			} else if (field.type == "IMAGE") {
				if (field.values && field.values.length > 0) {
					data.userImages.push({
						id: field.id,
						value: field.values.join(',')
					});
				}
			}
		});
		data.userTexts = data.userTexts;
		data.userDates = data.userDates;
		data.userOptions = data.userOptions;
		data.userImages = data.userImages;
		console.log(data)
		return JSON.stringify(data);


		function getCheckedOptions(options) {
			var result = [];
			$(options).each(function(idx, option) {

				option.selected && (result.push({
					id: option.id
				}));
			});
			return result;
		}
	};


	exports.validateFields = function(fields) {
		var messages = [];
		$(fields).each(function(idx, field) {
			if (field.type == "TEXT" || field.type == "TEXTAREA") {
				if (field.required && !field.value) {
					messages.push(field.name + "不能为空！");
				}
			} else if (field.type == "DATE") {
				if (field.required && !field.value) {
					messages.push(field.name + "不能为空！");
				}
			} else if (field.type == "RADIO" || field.type == "CHECKBOX") {
				if (field.required && field.options.arrayWidthObjAttr("selected", true).length == 0) {
					messages.push("请选择" + field.name);
				}
			} else if (field.type == "IMAGE") {
				if (field.required && (!field.values || field.values.length == 0)) {
					messages.push(field.name + "不能为空！");
				}
			}
		});
		return messages;
	};


	exports.makeRegisterResults = function(register, results) {
		var registerResults = [];

		$.each(register.texts, function(idx, text) {
			var result = results.userTexts.objOfAttr("textId", text.id) || {};
			text.value = result.value;
			registerResults.push(text);
		});

		$.each(register.dates, function(idx, date) {
			var result = results.userDates.objOfAttr("dateId", date.id) || {};
			date.value = result.value;
			date.type = "DATE";
			registerResults.push(date);
		});

		$.each(register.images, function(idx, image) {
			var result = results.userImages.objOfAttr("imageId", image.id) || {};
			image.values = result.value.split(",");
			image.type = "IMAGE";
			registerResults.push(image);
		});

		var optionIds = []; // 已选中选项
		$.each(results.userOptions, function(idx, option) {
			optionIds.push(option.optionId);
		});
		$.each(register.choices, function(idx, choice) {
			$.each(choice.options, function(idx, option) {
				option.selected = optionIds.indexOf(option.id) > -1;
			});
			registerResults.push(choice);
		});

		return registerResults.sort(function(info1, info2) {
			return info1.rank - info2.rank;
		});
	}
});