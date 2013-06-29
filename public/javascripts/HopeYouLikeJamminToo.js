var streaming;
var recording;
var playing;
var trackNums = [];


var upload = function(trackname, blob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload?trackName='+trackname, true);
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


var removeTrack = function(id){
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', '/delete/'+id, true);
  xhr.send();
};


var renameIt = function(trackName, newName){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/rename?trackName=' + trackName + '&newName=' + newName, true);
  xhr.send();
};

var uploadToAWS = function(trackName) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/knoxLoad?trackName=' + trackName, true);
  xhr.send();
};


var createAudioElement = function() {
  recorder.exportWAV(function(blob) {
    url = URL.createObjectURL(blob);


      var $li = $('<li></li>');
      var $sn = $('<span class="trackName">[click to rename]</span><br>').on('click', function(e) {
        var oldName = this.innerHTML;
        var newName = prompt("What's your track's name?");
        if(newName){
          $(this).html(newName);
          renameIt(oldName, newName);
        }
      });
      var $au = $('<audio src='+url+' controls></audio>');
      var $bu = $('<button class="removal">X</button>').on('click', function(e) {
        removeTrack(e.currentTarget.previousSibling.previousSibling.previousSibling.innerHTML);
        e.currentTarget.parentElement.remove();
      });
      var $sv = $('<button class="save">save</button>').on('click', function(e){
        var trackName = e.currentTarget.previousSibling.previousSibling.innerHTML;
        upload(trackName, blob, function(response) {
          uploadToAWS(response.id);
          $sv.hide();
        });
      });
      var hf = document.createElement('a');
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      hf.href = url;
      $li.append($sn);
      $li.append($sv);
      $li.append($au);
      $li.append($bu);
      $("#recordingslist").append($li);
      $('#status').html('');
  });
};


var audios = document.getElementsByTagName("audio");


var playThemAll = function(audioList) {
  if(!audios.length) return;
  audioList[0].currentTime = 0;
  audioList[0].play();
  for(var i = 1; i < audioList.length; i++) {
    audioList[i].currentTime = 0.09;
    audioList[i].play();
  }
};


var pauseThemAll = function(audioList) {
  for(var i = 0; i < audioList.length; i++) {
    audioList[i].pause();
  }
};

var timer = function(){
  var sec = 0;
  var min = 0;
  var $timer = $('#timer');
  setInterval(function(){
    sec++;
    if (sec === 60) {
      sec = 0;
      min++;
    }
    if (sec < 10){
      $timer.html(min + ":0" + sec);
    } else {
      $timer.html(min + ":" + sec);
    }
  }, 1000);
};

$('document').ready(function() {

  $('button#record').hide();

  $('button#record').on('click', function() {
    if(recording){
      recorder.stop();
      createAudioElement();
      recorder.clear();
      $('#status').html("loading track...");
      recording = false;
    } else {
      recorder.record();
      $('#status').html("recording... <span id='timer'>0:00</span>");
      timer();
      recording = true;
    }
  });


  $('img#playAll').on('click', function() {
    if(playing){
      pauseThemAll(audios);
      playing = false;
    } else {
      playThemAll(audios);
      playing = true;
    }
  });


  $('img#playAndRecord').on('click', function() {
    $('button#record').trigger('click');
    $('img#playAll').trigger('click');
  });


  $('span.streaming').on('click', function() {
    if(streaming){
      $(this).html("stream");
      window.localstream.stop();
      window.input.disconnect();
      streaming = false;
    } else {
      init();
      streaming = true;
    }
  });


  $('.removal').on('click', function(e) {
    removeTrack(e.currentTarget.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML);
    e.currentTarget.parentElement.remove();
  });


  $('.trackName').on('click', function(e) {
    var oldName = e.currentTarget.innerHTML;
    var newName = prompt("What's your track's name?");
    if(newName){
      renameIt(oldName, newName);
      $(this).html(newName);
    }
  });

  $('#help').on('click', function(){
    alert('- Start stream before recording and stop stream before you remove headphones. \n \n- After recording a track (ex. 3 minutes long), it can take a minute for the audio element to render on the screen. \n \n - Clicking the speaker icon on each audio element will mute that track. \n \n - Press the green button to play all tracks at once.');
  });
});
