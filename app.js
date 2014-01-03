var mongo = require('mongodb');
var express = require('express');
var monk = require('monk');
var db =  monk('localhost:27017/test');
var app = new express();

app.use(express.static(__dirname + '/debug'));
app.use(express.bodyParser());
app.get('/',function(req,res){
	db.driver.admin.listDatabases(function(e,dbs){
		res.json(dbs);
	});
});
app.get('/list',function(req,res){
	db.driver.collectionNames(function(e,names){
		res.json(names);
	})
});
app.get('/load/:name',function(req,res){
	var collection = db.get(req.params.name);
	collection.find({},{},function(e,docs){
		res.json(docs);
	})
});
app.get('/load/:name/:id',function(req,res){
	var collection = db.get(req.params.name);
	collection.find({_id:req.params.id},{},function(e,docs){
		res.json(docs);
	})
});

app.post('/save/:name',function(req,res){
	console.log(req.body);
	var collection = db.get(req.params.name);
	collection.insert({
		buffers:req.body
	})
	res.json({status: 'OK'});
});

module.exports = app;