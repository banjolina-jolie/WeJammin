var fs = require('fs');
/*
 * GET users listing.
 */

exports.getHandler = function(req, res){
  fs.readFile("./data/myfile.wav", "utf8", function(error, data){
    console.log(data);
    res.send(data);
  });
};