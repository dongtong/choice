;(function($, document, window, undefined){
	var settings = {
		question: "你最喜欢什么编程语言?",
		url: "", //用于提交的地址
		buttonText: "提交",
		choices: ["JavaScript", "Ruby", "Python", "C"],
		containerClass: "chooser",
		formClass: "chooser-form",
		btnClass: "chooser-btn",
		onCreated: function(){},
		ajaxOptions: {
			type: "POST",
			url: "",
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		},
		errorMessage: "Oops, error happened, please contact manager or try it later again",
		errorClass: "chooser-error-message"
	};

	function Choose(element, options){
		var widget = this;
		widget.config = $.extend(true, {}, settings, options);//定义属性config,存储配置参数, true代表deep clone, 这里能clone到ajaxOptions
		widget.element = element;//定义属性element,存储jQuery对象
		widget.element.bind('submit', function(e){
			e.preventDefault();//阻止浏览器的默认行为
			//widget.element.trigger("chooser.beforeRequest")
			var dataObj = {
					data: JSON.stringify({chosen: widget.element.find(":checked").val()})
				}

			var ajaxSettings = $.extend({}, widget.config.ajaxOptions, dataObj);
			//JSON.stringify仅在现代浏览器中支持，比如老一些的IE浏览器就不支持，但是可以使用json2这个库来实现
			$.ajax(ajaxSettings).done(function(data){//请求成功后调用的回调函数
				console.log(data)
			}).fail(function(data){//请求失败后调用的回调函数
				//trigger返回的是jQuery对象，而triggerHandler返回的是函数返回的对象
				var funcReturnVal = widget.element.triggerHandler("chooser.onError", data);
				if (funcReturnVal === false){//这里通过返回false让开发者更好地控制plugin的行为
					widget.element.find('form').replaceWith($("<p/>", {
						text: widget.config.errorMessage,
						"class": widget.config.errorClass
					}));
				}
				
			})
		});

		//当用户选择一个选项时，将会触发change事件
		widget.element.one("change", function(){
			widget.element.find("button").removeProp("disabled")
		});

		//自定义事件处理
		$.each(widget.config, function(key, val){//遍历配置参数
			if($.isFunction(val)){
				widget.element.on("chooser." + key, function(e, params){
					return val(e, widget.element, params);//这里其实调用的是自定义事件处理函数
				})
			}
		});
		this.init();//初始化plugin
	}	

	Choose.prototype.init = function(){
		var config = this.config,
			selectedObj = this.element.addClass(this.config.containerClass);

		$("<h2>", {
			text: config.question
		}).appendTo(selectedObj); //添加问题描述

		var form = $('<form />').addClass(config.formClass).appendTo(selectedObj);//问题放在一个form中提交
		var choices = config.choices;
		var choice_len = choices.length;
		while(choice_len--){
			$("<input />", {
				type: 'radio',
				name: 'choices',
				id: choices[choice_len],
				value: choices[choice_len]
			}).appendTo(form);

			$("<label />", {
				text: choices[choice_len],
				"for": choices[choice_len]
			}).appendTo(form);
		}

		$("<button />", {
			text: config.buttonText,
			"class": config.btnClass,
			disabled: "disabled"
		}).appendTo(form);
		//传入当前容器的jQuery对象
		//this.config.onCreated(this.element);
		this.element.trigger("chooser.onCreated");
	}

	$.fn.choose = function(options){
		new Choose(this.first(), options);
		return this.first();
	};
}(jQuery, document, window));