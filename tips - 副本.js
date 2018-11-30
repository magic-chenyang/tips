;(function($,window,document,undefined) {
	var tipsData = '' ;
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};
	var Tips = function(ele,options)
	{
		this.element = ele ;
		this.defaults = {
			post: "bottomRight" , 		//位置 四个角  topLeft,topRight,bottomLeft,bottomRight
            gurl: "#" ,           		//跳转链接,非空是gword也不能为空
            gword: "",			   		//消息详情
            status: "" ,    		//状态，succeed,error,info,warm
            close: 0 ,             		//自动关闭时间，为0时不自动关闭，单位为秒
            anitime:"100" ,				//关闭动画时间
            cbtype:"",					//触发回调的方式，auto、click、all、空,空不调用
            cbfun:function(){}			//关闭后回调
		},
		this.options = $.extend({},this.defaults, options) ;
		this.handler = '' ;
	};
	Tips.prototype = {
		creat:function(){
			var self = this ;
			var idx = tipsData['tipsIndex'] ;
			var b  = '' , c = '' ;
			if('error' == self.options.status)  c = 'notice_error' ;
            else c = 'notice_warm' ;
            b += '<div id="tipsBox_'+ idx +'" class="bottom-message-notice '+ c +'" style="height:'+ self.options.height +'px;width:'+self.options.width+'px;"><span class="mes_prompt_close btn" id="tipsClose_'+ idx +'">x</span>' ; 
            b += '<div  class="mess-notice-con">' ;
            //无链接
        	b += '<p>'+ self.options.gword +'</p>' ;

            $(self.element).append(b) ;
            tipsData["tipsContent"].push(b) ;
            var color = document.getElementById("tipsBox_'+ idx +'");

            $(document).on("click","#tipsClose_"+idx,function(){
            	self.hideOut('click',idx) ;
        	}) ;
        	
        	// 如果当前显示出来的  大于 最大可显示的数了就不再继续显示
        	if(tipsData["tipsCurNum"] < tipsData["tipsMaxNum"])
        	{	
        		self.showOut(idx) ; 
        	}
        	tipsData['tipsIndex']++ ;

        	//添加删除全部
        	var del = '<div class="mess_close_btn" id="mess_close_btn">关闭所有 '+ idx +'</div>';
        	if($("#mess_close_btn").length==0)
        		$(self.element).append(del);
		},
		formatAll:function(ind){
			var self = this ;
			for(var i = ind+1;i<tipsData['tipsIndex'];i++)
			{
				var tp = $("#tipsBox_" + i) ;	
				
				if( tp.length == 1 && tipsData["tipsCurNum"] < tipsData["tipsMaxNum"])
				{	
					//首次展示
					if(!tp.attr("pos")){
						self.showOut(i) ;				
					}
					// 下移
					else{
						self.moveDown(i) ;
					}
				}
				else if(tipsData["tipsCurNum"] == tipsData["tipsMaxNum"])
				{
					return ;
				}
			}
		},
		showOut:function(ind){
			var self = this ;
			self.handler = $("#tipsBox_" + ind) ;
			self.options.close > 0 ? self.autoClose(ind) : '' ;	
			var curH = 0 ;
			self.handler.attr("pos",tipsData["tipsCurNum"]) ;
			curH = self.options.height*tipsData["tipsCurNum"] + 5 ;
			// curH = 10*tipsData["tipsCurNum"] + 5 ;
			self.handler.animate({"bottom":curH},self.options.anitime).animate({"opacity":"1"}) ;
			console.log(tipsData["tipsCurNum"])
			tipsData["tipsCurNum"]++ ;

			if(tipsData["tipsCurNum"]>1){	
        		$("#mess_close_btn").animate({opacity:0}).animate({bottom:self.options.height*tipsData["tipsCurNum"] + 5}).animate({opacity:1});
        		$("#mess_close_btn").on('click',function(){
        			self.delAll();
        		})
        	}
		},
		moveDown:function(ind){
			var self = this ;
			self.handler = $("#tipsBox_" + ind) ;
			var curp = self.handler.attr("pos") ;
			var next = curp - 1 ;
			curH = self.options.height*next + 5
			// curH = 10*tipsData["tipsCurNum"] + 5 ;
			self.handler.attr("pos",next) ;
			self.handler.animate({"bottom":curH},self.options.anitime) ;
		},
		hideOut:function(firetype,ind){
			var self = this ;
			this.handler = $("#tipsBox_" + ind) ;
			var h = 0 - 10 - self.handler.height() ;
            //tips.fadeOut('500');
            self.handler.animate({"bottom":h},self.options.anitime);
            //t = self.options.anitime - 0 + 10 ;
            
            self.handler.remove();
            tipsData['tipsContent'].remove(ind);
            (tipsData['tipsCurNum']>0) ? tipsData['tipsCurNum']--: tipsData['tipsCurNum'] = 0;
            self.formatAll(ind);
    		
    		if(tipsData['tipsCurNum']>1)
    			$("#mess_close_btn").animate({bottom:self.options.height*tipsData["tipsCurNum"] + 5}).animate({opacity:1});
            else
				$("#mess_close_btn").animate({opacity:0})
			
            
            if(self.options.cbtype=='all')
            	// self.options.cbfun();
            	self.options.cbfun.call(null,ind)
            else if(firetype == self.options.cbtype)
            	self.options.cbfun.call(null,ind);
            // 删除当前的hidden域名
            $("#tipsHide_" + ind).remove();
            
		},
		delAll:function(){
			var self = this ;
			$("div[id^=tipsClose_").unbind('click') ;
			$("div[id^=tipsBox_]").remove();
			$("#mess_close_btn").remove();
			// 初始化
			tipsData["tipsIndex"] = 0 ;
			tipsData["tipsCurNum"] = 0 ;
			tipsData["tipsContent"] = [] ;
		},
		autoClose:function(ind){
			var self = this ;
			var time = 1000 * self.options.close ;
            window.setTimeout(function() {
                self.hideOut('auto',ind);
            }, time);
		}
	}
	$.fn.creatTips = function(options,obj) {
		var tips = new Tips(this,options);
		if(!obj) obj = new TipSet();
		if(tipsData == '') tipsData = obj.options ;		
		return tips.creat() ;
	}
})(jQuery,window,document)

var TipSet = function(){
	this.options = {
		"tipsIndex":0,
		"tipsTagid":"tipsBox_",
		"tipsMaxNum":3,
		"tipsCurNum":0,
		"tipsContent":new Array(),
		"tipsCls":""
	};
}
TipSet.prototype = {
	set:function(options){
		this.options = $.extend({},this.options, options) ;
	}
}