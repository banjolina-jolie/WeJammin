var fs = require('fs');
var qs = require('querystring');
var knox = require('knox');
var mongoose = require('mongoose');

var MONGOHQ_URI = 'mongodb://Dylan:wejamm1n@dharma.mongohq.com:10001/wejammin';

mongoose.connect(MONGOHQ_URI);

var trackSchema = new mongoose.Schema({
  name: "string"
});

var Track = mongoose.model('Track', trackSchema);

var client = knox.createClient({
    key: 'AKIAIHIZFDI47ANJJYGQ'
  , secret: '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'
  , bucket: 'wejammin'
});

exports.index = function(req, res){

  fs.readdir('./data', function(err, tracks) {
    if (err) {
      res.render('index', { title: 'SHIT BROKE! ', tracks: [] });
    }
    else {
      res.render('index', { title: 'WeJammin', tracks: tracks});
    }
  });
};

var getFilename = function(callback) {
  fs.readdir('./data', function(err, tracks) {
    if (err) {
      callback(err, null);
    } else {
      var n = 1;
      while (tracks.indexOf('track_'+n) !== -1) {
        n++;
      }
      var filename = 'track_'+n;
      callback(null, filename);
    }
  });
};

var doUpload = function(err, filename, req, res) {
  if (err) {
    res.json({
      name: null,
      message: 'Shit broke!'
    });
    return false;
  }

  var stream = fs.createWriteStream('data/'+filename);

  req.on('data', function(data) {
    stream.write(data);
  });

  req.on('end', function () {
    res.json({
      name: filename
    });
  });

  var newTrack = new Track({
    name: filename
  });

  newTrack.save(function(err, success){
    if(err) console.error(err);
    console.log(success);
  });

  Track.find(function(err, tracks){
    if(err) console.error(err);
    console.log(tracks);
  });

  Track.find({ name: /^track/ }, function(err, tracks){
    console.log("tracks: ", tracks);
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
  fs.rename('./data/'+oldName, './data/'+newName, function(err, success){
    if(err) console.error(err);
  });
};

exports.delete = function(req, res){
  fs.unlink('./data/'+req.params.id, function(err, success){
    if(err) console.error(err);
    console.log("file deleted");
  });

  client.del('/data/'+ req.params.id).on('response', function(resp){
    console.log(resp.statusCode);
    console.log(resp.headers);
  }).end();

  Track.findOneAndRemove({ name: req.params.id }, function(err, success){
    if(err) console.error(err);
    console.log("track deleted: ", success);
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
    req.end(buf);
  });
};
