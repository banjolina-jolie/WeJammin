var streaming;
var recording;
var playing;
var blobbarooni;
var trackNums = [];

var upload = function(blob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);
  xhr.onload = function(){
    if(xhr.status === 200){
      try {
        var response = JSON.parse(xhr.responseText);
      }
      catch(err) { console.error('Shit, invalid JSON!'); }

      callback(response);
    }
  };
  xhr.setRequestHeader("Content-type", "audio/wav");
  xhr.send(blob);
};

// var redirect = function(){
//   var newxhr = new XMLHttpRequest();
//   newxhr.open('GET', '/', true);
//   newxhr.send();
// };

var removeTrack = function(id){
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', '/delete/'+id, true);
  xhr.send();
};


var findLowNum = function(){
  if(!trackNums.length){
    trackNums.push(0);
    return 0;
  }
  trackNums.sort();
  for(var i = 0; i < trackNums.length; i++){
    if(trackNums[i+1] != i+1){
      trackNums.splice(i+1, 0, i+1);
      return i+1;
    }
  }
};

var createAudioElement = function() {
  recorder.exportWAV(function(blob) {
    blobbarooni = blob;
    url = URL.createObjectURL(blob);

    upload(blob, function(response) {

      var n = findLowNum();
      var $li = $('<li></li>');
      var $sn = $('<span>'+response.name+'</span>')
      var $inpt = $('<input class="songName"type="text"><br>')
      var $au = $('<audio src='+url+' controls></audio>');
      var $bu = $('<button class="removal">X</button>');
      var $cx = $('<input type="checkbox" checked="true">');
      var chillen = new Date();
      $bu.attr("id", "removal");
      var hf = document.createElement('a');

      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      hf.href = url;
      $li.append($sn);
      $li.append($inpt);
      $li.append($cx);
      $li.append($au);
      $li.append($bu);
      $("#recordingslist").append($li);

      $('.removal').on('click', function(e) {
        removeTrack(e.currentTarget.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML);
        e.currentTarget.parentElement.remove();
      });
    });
  });
};

var checkedBoxes = document.getElementsByTagName("input");
var audios = document.getElementsByTagName("audio");

var playThemAll = function(audioList) {
  if(!audios.length) return;
  audioList[0].currentTime = 0;
  audioList[0].play();
  for(var i = 1; i < audioList.length; i++) {
    audioList[i].currentTime = 0.07;
    audioList[i].play();
  }
};

var pauseThemAll = function(audioList) {
  for(var i = 0; i < audioList.length; i++) {
    audioList[i].pause();
  }
};

$('document').ready(function() {

  $('button#record').hide();

  $('button#record').on('click', function() {
    if(recording){
      recorder.stop();
      createAudioElement();
      recorder.clear();
      $('#status').html("");
      recording = false;
    } else {
      recorder.record();
      $('#status').html("recording...");
      recording = true;
    }
  });

  $('button#playAll').on('click', function() {
    if(playing){
      pauseThemAll(audios);
      playing = false;
    } else {
      playThemAll(audios);
      playing = true;
    }
  });

  $('button#playAndRecord').on('click', function() {
    $('button#record').trigger('click');
    $('button#playAll').trigger('click');
  });

  $('button#stream').on('click', function() {
    if(streaming){
      $(this).html("start stream");
      $('.streamingStatus').removeClass("happening");
      $('.streamingStatus').addClass("notHappening");
      window.localstream.stop();
      window.input.disconnect();
      streaming = false;
    } else {
      init();
      streaming = true;
    }
  });

  $('.removal').on('click', function(e) {
        removeTrack(e.currentTarget.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML);
        e.currentTarget.parentElement.remove();
      });
});
