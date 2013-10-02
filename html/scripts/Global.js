define([],function() {
	var Global = {
		setSize : function(width, height){
			if(width === undefined) width = window.innerWidth;
			if(height === undefined) height = window.innerHeight;
			//Global.width = $(document).width();
			//Global.height = $(document).height();
			Global.width = width;
			Global.height = height;
			Global.widthHalf = Global.width * .5;
			Global.heightHalf = Global.height * .5;
			Global.aspectRatio = Global.width / Global.height;
		},
		now : 0
	}
	return Global;
});
