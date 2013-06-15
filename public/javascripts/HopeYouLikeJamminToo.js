var streaming;
var recording;
var playing;

var upload = function(blob) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);
  xhr.onload = function (e) {
      var result = e.target.result;
      console.log(result);
  };
  xhr.setRequestHeader("Content-type", "audio/wav");
  xhr.send(blob);
};

var createAudioElement = function() {
  recorder.exportWAV(function(blob) {
    url = URL.createObjectURL(blob);
    var $li = $('<li></li>');
    var $au = $('<audio src='+url+' controls></audio>');
    var $bu = $('<button class="removal">X</button>');
    var $cx = $('<input type="checkbox" checked="true">');
    var chillen = new Date();
    $bu.attr("id", "removal");
    var hf = document.createElement('a');

    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    hf.href = url;
    $li.append($cx);
    $li.append($au);
    $li.append($bu);
    $("#recordingslist").append($li);

    $('.removal').on('click', function(e) {
      e.currentTarget.parentElement.remove();
    });

  });
};

var checkedBoxes = document.getElementsByTagName("input");
var audios = document.getElementsByTagName("audio");

var playThemAll = function(audioList) {
  for(var i = 0; i < audioList.length; i++) {
    if(audioList[i].checked) {
      if(i > 0){
        audioList[i].nextSibling.currentTime = 0.07;
      } else {
        audioList[i].nextSibling.currentTime = 0;
      }
      audioList[i].nextSibling.play();
    }
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
      playThemAll(checkedBoxes);
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
});
