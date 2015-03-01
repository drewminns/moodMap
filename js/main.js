var picApp = {};

picApp.locals = {
	canvas   : document.getElementById('canvas'),
	context  : canvas.getContext('2d'),
	video 	 : document.getElementById('video'),
	videoObj : { "video" : true },
	ffpkey  : '14c4a74157f02f6421c02ce63b7e09ed',
	ffpscrt : 'JHy_J7A-liJmBitvTEKq4Z6zlcXbsUs3',
	errBack  : function(err) {
		console.log("Video Capture Error: ", error.code);
	}
}

picApp.canvas = function() {
	if (navigator.getUserMedia) {
		navigator.getUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = stream;
			picApp.locals.video.play();
		}, picApp.locals.errBack);
	} else if (navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = window.URL.createObjectURL(stream);
			picApp.locals.video.play();
			picApp.stream = stream;
		}, picApp.locals.errBack);
	}
}

picApp.pic = function() {
	$('#snap').on('click', function() {
		picApp.locals.context.drawImage(video, 0, 0, 320, 240);
		picApp.locals.video.pause();
		picApp.stream.stop();
		picApp.locals.vibePhoto = picApp.convert(picApp.locals.canvas);
		$('.picSection').addClass('hide');
		$('.preview').html(picApp.locals.vibePhoto).addClass('show');
		picApp.upload();
	});
}

picApp.convert = function(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/jpeg");
	return image;
}

picApp.upload = function() {
	var $img = $('img');
	var token = '10d27ca9d306973';
	localStorage.doUpload = true;
	localStorage.imageBase64 = $img.attr('src').replace(/.*,/, '');
	$.ajax({
	  url: 'https://api.imgur.com/3/image',
	  method: 'POST',
	  headers: {
	    Authorization: 'Client-ID ' + token,
	    Accept: 'application/json'
	  },
	  data: {
	    image: localStorage.imageBase64,
	    type: 'base64'
	  },
	  success: function(result) {
	    var id = result.data.id;
	    var link = 'http://i.imgur.com/' + id + '.png';
	    picApp.getEmotions(link);
	  }
	});
}

picApp.getEmotions = function(image) {
	$.ajax({
		url: 'https://apius.faceplusplus.com/v2/detection/detect',
    type: 'GET',
    data: {
      url : image,
      api_key : picApp.locals.ffpkey,
      api_secret : picApp.locals.ffpscrt
    },
    success: function(data) {
    	picApp.sortData(data.face[0]);
    }
	});
}

picApp.sortData = function(info) {
	console.log(info);
	$('<p class="gender"></p>').text(info.attribute.gender.value).appendTo('.preview');
}

picApp.init = function() {
	picApp.canvas();
	picApp.pic();
}

$(function() {
		picApp.init();
});