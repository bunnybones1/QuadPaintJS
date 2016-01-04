var mongo = require('mongodb');
var express = require('express');
var monk = require('monk');
var db =  monk('localhost:27017/test');
var app = new express();
var bodyParser = require('body-parser');

console.log("init app.js");
app.use(express.static(__dirname + '/debug'));

app.use(bodyParser.urlencoded({
	extended: false,
	parameterLimit: 10000,
	limit: 1024 * 1024 * 10
}));

app.use(bodyParser.json({
	extended: false,
	parameterLimit: 10000,
	limit: 1024 * 1024 * 10
}));
app.get('/',function(req,res){
	db.driver.admin.listDatabases(function(e,dbs){
		res.json(dbs);
	});
});
app.get('/list',function(req,res){
	db.driver.collectionNames(function(e,names){
		res.json(names);
	});
});
app.get('/load/:name',function(req,res){
	var collection = db.get(req.params.name);
	console.log('Someone requested painting:', req.params.name);
	collection.find({
		"buffers" : { "$exists" : true}
	},{
		"buffers": 0,
	},function(e,docs){
		if(e) throw e;
		docs.forEach(function(doc) {
			if(doc.buffers) {
				console.log('projection failed. Manually removing buffer from response.')
				delete doc.buffers;
			}
		});
		console.log('sending:', docs);
		res.json(docs);
	});
});
app.get('/load/:name/:id',function(req,res){
	var collection = db.get(req.params.name);
	collection.find({_id:req.params.id},{},function(e,docs){
		res.json(docs);
	});
});

app.post('/save/:name',function(req,res){
	// console.log(req.body);
	var collection = db.get(req.params.name);
	collection.insert({
		buffers:req.body
	});
	res.json({status: 'OK'});
});

module.exports = app;