#WeJammin
========

http://wejammin.herokuapp.com

This app allows users record audio using a built-in microphone.  The first track acts as the mother track for all other
tracks to be "jammed on".  So lay down a rhythm... then record a couple leads!  Or record a beatbox then rap over it!

The tracks are persistent as long as someone doesn't click the [x] button.  Stay tuned for authenticated user profiles
and separate rooms to jam in! Oh ya and it only works with Chrome at the moment...

This app uses:

 - Matt Diamond's RecorderJS plugin https://github.com/mattdiamond/Recorderjs
 - Express.js
 - Amazon S3 to store wav files
 - MongoDB to store meta-data about tracks
 
Feel free to message me with any questions or comments!
