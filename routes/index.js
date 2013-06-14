var fs = require('fs');

exports.index = function(req, res){
  fs.readFile("./data/songs.txt", 'utf8', function(err, data){
    var tracks = data.split('\n');

    var readStream = fs.createReadStream("./data/myfile.wav");

    // readStream.on('open', function(){
    //   var thing = readStream.pipe(res);
    // });

    readStream.on('data', function(data){
      // console.log("data event");
      // console.log(data);
    });


    res.render('index', { title: 'WeJammin', tracks: tracks});
  });

};

exports.postHandler = function(req, res){
  console.log('POST recieved!');
  var stream = fs.createWriteStream('data/myfile.wav');

  req.on('data', function(data) {
    console.log('Got POST data...');
    stream.write(data);
  });

  req.on('end', function () {
    console.log('POST complete!');
    res.end('We got the data!');
  });

};