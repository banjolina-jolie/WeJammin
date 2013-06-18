var fs = require('fs');
var pg = require('pg');
var stream;
var name;

exports.index = function(req, res){

  fs.readdir('./data', function(err, tracks) {
    if (err) {
      // You should write an error here
      // Could happen if data dir doesn't exist
      res.render('index', { title: 'SHIT BROKE! ', tracks: [] });
    }
    else {
      res.render('index', { title: 'WeJammin', tracks: tracks});
    }
  });
};

var getFilename = function(callback) {
  // Asynchronously get a list of all files
  fs.readdir('./data', function(err, tracks) {
    if (err) {
      // Pass the error to the callback
      callback(err, null);
    }
    else {
      // Loop through file names until you find a free one
      var n = 1;
      while (tracks.indexOf('track_'+n) !== -1) {
        n++;
      }
      var filename = 'track_'+n;

      // Call callback with the found name
      callback(null, filename)
    }
  });
};

var doUpload = function(err, filename, req, res) {
  if (err) {
    // console error shit
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
};

exports.postHandler = function(req, res){
  getFilename(function(err, tracks) {
    doUpload(err, tracks, req, res);
  });
};

exports.delete = function(req, res){
  fs.unlink('./data/'+req.params.id, function(err, success){
    if(err) console.error(err);
    console.log("file deleted");
  });
};