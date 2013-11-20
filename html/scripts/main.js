var url = require('url'),
http 		= require('http'),
director 	= require('director'),
screenfull 	= require('./vendor/screenfull'),
Global 		= require('./Global'),
QuadPaint   = require('./QuadPaint');

$('document').ready(function(){
    
	var quadPaint = new QuadPaint();
	
	var routes = {
		'/startup': {
			on: function(){

			}		
		},
		'/:painting': {
			on: function(section){
				Nav.fadeIn(section);				
			}
		}
	 };

	var router = new director.Router(routes);
});