'use strict';
//https://github.com/zzhakupov/url-shortener/blob/master/server.js
var port = process.env.PORT || 3000;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var express = require('express');
var app = express();
var path = require('path');
require('dotenv').config();
var mongoURL = process.env.MONGO_URI; //env not included for obvious reasons :D

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

app.get('/new/:url(*)/',  function(req, res){
  
  MongoClient.connect(mongoURL, function(err, db){
  if (err) { 
    console.log('cannot connect to mongodb' + err)
  } else {
    console.log('Connection established to', mongoURL);
    var collection = db.collection('url-collection');
    var Access = function(db, callback){
    if (regex.test(req.params.url)) {
      collection.count().then(function(number){
      var newElement = {
        original_url: req.params.url,
        short_url: "https://scarce-missile.glitch.me" + (number + 1)
        }
      collection.insert([newElement]);
        res.json({
          original_url: req.params.url,
          short_url: "https://scarce-missile.glitch.me/" + (number + 1)
        });
      })
    } else {
    res.json({
    'error': 'This is not a valid URL'
    })
    }
    }
    Access(db, function(){
      db.close();
    });
  }
  })
})

app.get('/:shortid', function(req, res) {
  MongoClient.connect(mongoURL, function(err, db){
  if (err){
  console.log('Unable to connect to mongoDB server ' + err);
  } else {
    var collection = db.collection('url-collection');
    var query = function(db, callback){
    collection.findOne({
      "short_url": "https://scarce-missile.glitch.me" + req.params.shortid
    }, {
      original_url: 1,
      _id: 0
    }, function(err, answer){
      if (answer === null){
      res.json({'error': "We could not find this URL"})
      } else {
        if (answer.original_url.split('')[0] == 'w') {
          res.redirect(301, 'http://' + answer.original_url)
        } else {
        res.redirect(301, answer.original_url)
        }
      }
    } 
    )// end find one
    }// end query
    query(db, function(){
      db.close()
    });
  }
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});