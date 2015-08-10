var picApp = {};

picApp.locals = {
	canvas   : document.getElementById('canvas'),
	context  : canvas.getContext('2d'),
	video 	 : document.getElementById('video'),
	videoObj : { "video" : true },
	token : '10d27ca9d306973',
	ffpkey  : '14c4a74157f02f6421c02ce63b7e09ed',
	ffpscrt : 'JHy_J7A-liJmBitvTEKq4Z6zlcXbsUs3',
	imgurImg : '',
	errBack  : function(err) {
		console.log("Video Capture Error: ", error.code);
	}
};

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
	} else if (navigator.mozGetUserMedia) {
		navigator.mozGetUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = window.URL.createObjectURL(stream);
			picApp.locals.video.play();
			picApp.stream = stream;
		}, picApp.locals.errBack);
	}
};

picApp.pic = function() {
	$('#snap').on('click', function() {
		picApp.locals.context.drawImage(video, 0, 0, 640, 480);
		picApp.locals.video.pause();
		picApp.stream.stop();
		picApp.locals.vibePhoto = picApp.convert(picApp.locals.canvas);
		$('.picSection').fadeOut().addClass('hide');
		$('.preview').fadeIn().addClass('show');
		$('.resultImg').html(picApp.locals.vibePhoto);
		picApp.upload();
	});
};

picApp.convert = function(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/jpeg");
	return image;
};

picApp.upload = function() {
	var $img = $('img');
	localStorage.doUpload = true;
	localStorage.imageBase64 = $img.attr('src').replace(/.*,/, '');
	$.ajax({
	  url: 'https://api.imgur.com/3/image',
	  method: 'POST',
	  headers: {
	    Authorization: 'Client-ID ' + picApp.locals.token,
	    Accept: 'application/json'
	  },
	  data: {
	    image: localStorage.imageBase64,
	    type: 'base64'
	  },
	  success: function(result) {

	  	picApp.deleteLink = result.data.deletehash;
	    var id = result.data.id;
	    var link = 'http://i.imgur.com/' + id + '.jpg';
	    picApp.locals.imgurImg = result.data.id;
	    picApp.getEmotions(link);
	  }
	});
};

picApp.deletePic = function(info) {
	$.ajax({
		url: 'https://api.imgur.com/3/image/' + info,
		method: 'DELETE',
		dataType: 'json',
		headers: {
		  Authorization: 'Client-ID ' + picApp.locals.token,
		  Accept: 'application/json'
		},
		success: function(rez) {
			// console.log(rez);
		}
	});
};

picApp.getEmotions = function(image) {
	var api = new FacePP('0ef14fa726ce34d820c5a44e57fef470',
	                     '4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD',
	                     { apiURL: 'http://apicn.faceplusplus.com/v2' });
	api.request('detection/detect', {
	  url: image
	}, function(err, result) {
	  if (err) {
	    $('#response').text('Load failed.');
	    return;
	  }
	  console.log(result);
  	picApp.sortData(result.face[0]);
  	picApp.deletePic(picApp.deleteLink);
	});
	// $.ajax({
	// 	url: 'https://apius.faceplusplus.com/v2/detection/detect',
 //    type: 'GET',
 //    data: {
 //      url : image,
 //      api_key : picApp.locals.ffpkey,
 //      api_secret : picApp.locals.ffpscrt
 //    },
 //    success: function(data) {
 //    	console.log(data);
 //    	picApp.sortData(data.face[0]);
 //    	picApp.deletePic(picApp.deleteLink);
 //    }
	// });
};

picApp.sortData = function(info) {
	$('.load').fadeOut().addClass('hide');
	var $height = info.position.height;
	var $width = info.position.width;
	var $centerX = info.position.center.x - ($width / 2);
	var $centerY = info.position.center.y - ($height - 2);
	var locationCSS = {
		width: $width + '%',
		height: $height + '%',
		top: $centerY + '%',
		left: $centerX + '%'
	}
	$('.result').removeClass('hide').css(locationCSS);

	var sentence = '<p>You\'re a ' + info.attribute.age.value + ' year old ' + info.attribute.race.value + ' ' + info.attribute.gender.value + '</p>';
	$('.resultCopy').removeClass('hide').html(sentence);
};

picApp.init = function() {
	picApp.canvas();
	picApp.pic();
	console.log('I love you. Find more stuff at drewminns.com');
};

$(function() {
		picApp.init();
});