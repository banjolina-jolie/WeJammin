var fs = require('fs');
var qs = require('querystring');
var knox = require('knox');
var mongoose = require('mongoose');

var MONGOHQ_URI = process.env.MONGO_URI;

mongoose.connect(MONGOHQ_URI);

var trackSchema = new mongoose.Schema({
  name: "string"
});

var Track = mongoose.model('Track', trackSchema);

var client = knox.createClient({
    key: process.env.S3_KEY
  , secret: process.env.S3_SECRET
  , bucket: process.env.S3_BUCKET
});


var getFilename = function(callback) {

  var newTrack = new Track({
    name: "[click to rename]"
  });

  callback(null, newTrack);
};


var doUpload = function(err, filename, req, res) {
  if (err) {
    res.json({
      name: null,
      message: 'Shit broke!'
    });
    return false;
  }

  var stream = fs.createWriteStream('data/'+filename._id);

  req.on('data', function(data) {
    stream.write(data);
  });

  req.on('end', function () {
    res.json({
      name: filename.name,
      id: filename._id
    });
  });

  filename.save(function(err, success){
    if(err) console.error(err);
    console.log(success);
  });

};


exports.index = function(req, res){
  Track.find(function(err, tracks){
    if(err) {
      res.render('index', { title: 'Error Loading Page', tracks: [] });
    } else {
      res.render('index', { title: 'WeJammin', tracks: tracks});
    }
  });
};


exports.postHandler = function(req, res){
  getFilename(function(err, tracks) {
    doUpload(err, tracks, req, res);
  });
};


exports.rename = function(req, res){
  var oldName = qs.parse(req._parsedUrl.query).trackName;
  var newName = qs.parse(req._parsedUrl.query).newName;

  Track.findOneAndUpdate({name: oldName}, {name: newName}, function(err, success) {
    if(err) console.error(err);
    console.log(success);
  });
};


exports.delete = function(req, res){
  Track.findOneAndRemove({ name: req.params.id }, function(err, success){
    if(err) console.error(err);
    console.log(success);
    var trackID = success._id;
    client.del('/data/'+ trackID).on('response', function(resp){
      console.log(resp.statusCode);
      console.log(resp.headers);
    }).end();
  });
};


exports.knoxTest = function(requezt){
  var oldName = qs.parse(requezt._parsedUrl.query).trackName;
  fs.readFile('./data/' + oldName, function(err, buf){
    var req = client.put('/data/' + oldName, {
        'x-amz-acl': 'public-read'
      , 'Content-Length': buf.length
      , 'Content-Type': 'text/plain'
    });
    req.on('response', function(res){
      if (200 == res.statusCode) {
        console.log('saved to %s', req.url);
      }
    });
    req.end(buf, function(err, success){
      if(err) console.error(err);
      fs.unlink('./data/' + oldName, function(err){
        if(err) console.error(err);
      });
    });
  });
};
