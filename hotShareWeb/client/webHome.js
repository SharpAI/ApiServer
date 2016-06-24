var MqL = 1070;

$(document).keyup(function(event){
		if(event.which=='37' && $('.cd-main-content').hasClass('is-product-tour') ) {
			var activeSlide = $('.cd-active');
			if(activeSlide.is(':first-child')) {
				//in this case - switch from product tour div to product intro div
				showProductIntro();
			} else {
				updateSlider(activeSlide, 'prev'); 
			}
		} else if(event.which=='39' && $('.cd-main-content').hasClass('is-product-tour')) {
			var activeSlide = $('.cd-active');
			updateSlider(activeSlide, 'next');
		}
	});

	$(window).on('resize', function(){
		window.requestAnimationFrame(function(){
			if($(window).width() < MqL) {
				$('.cd-single-item').each(function(){
					$(this).find('img').css('opacity', 1).end().find('video').hide();
				});
			} else {
				$('.cd-single-item.cd-active').find('video').show();
				( $('.cd-main-content').hasClass('is-product-tour') ) ? $('header').addClass('slide-down') : $('header').removeClass('slide-down');
			}
		});
	});
	
	$(window).on('scroll', function(){
		window.requestAnimationFrame(function(){
			if($(window).width() < MqL && $(window).scrollTop() < $('#cd-product-tour').offset().top - 30 ) {
				$('header').removeClass('slide-down');
			} else if ($(window).width() < MqL && $(window).scrollTop() >= $('#cd-product-tour').offset().top - 30 ){
				$('header').addClass('slide-down');
			}
		});
	});

	function showProductIntro() {
		$('header').removeClass('slide-down');
		$('.cd-main-content').removeClass('is-product-tour');
		$('.cd-active').find('video').get(0).pause();
		$('.cd-single-item').find('video').each(function(){
			$(this).get(0).currentTime = 0;
		});
	}

  function updateSlider(active, direction) {
		var selected;
		if( direction == 'next' ) {
			selected = active.next();
			//on Firefox CSS transition/animation fails when parent element changes visibility attribute
			//so we have to change .cd-single-item childrens attributes after having changed its visibility value
	        setTimeout(function() {
	           	active.removeClass('cd-active').addClass('cd-hidden').next().removeClass('cd-move-right').addClass('cd-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
	           		active.addClass('cd-not-visible');
	           	});
	        }, 50);
		} else {
			selected = active.prev();
			//on Firefox CSS transition/animation fails when parent element changes visibility attribute
			//so we have to change .cd-single-item childrens attributes after having changed its visibility value
	        setTimeout(function() {
	           	active.removeClass('cd-active').addClass('cd-move-right').prev().addClass('cd-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
	           		active.addClass('cd-not-visible');
	           	});
	        }, 50);
		}
		//update visible slider
		selected.removeClass('cd-not-visible');
		//update slider navigation (in case we reached the last slider)
        updateSliderNav(selected);
        //load the video for the new slider
		uploadVideo(selected);

	}

  function updateSliderNav(selected) {
		( selected.is(':last-child') ) ? $('.cd-next').addClass('cd-inactive') : $('.cd-next').removeClass('cd-inactive') ;
		$('.cd-loader').stop().hide().css('width', 0);
	}

	function uploadVideo(selected) {
		selected.siblings('.cd-single-item').find('video').each(function(){
			//pause videos user is not watching
			$(this).get(0).pause();
		})
		if(selected.find('video').length > 0) {
			//video has been already loaded - play it
			selected.find('video').eq(0).show().get(0).play();
		} else {
			//load video - the name of the video is the data-video of the image
			var videoUrl = selected.find('.cd-image-container img').data('video'),
				video = $('<video loop><source src="'+videoUrl+'.mp4" type="video/mp4" /><source src="'+videoUrl+'.webm" type="video/webm" />Sorry, your browser does not support HTML5 video.</video>');
			video.appendTo(selected.find('.cd-image-wrapper')).hide();

			var loaded = 'false';
			//check if the canplaythrough event occurs - video is ready to be played
			selected.on('canplaythrough', 'video', function() {
				loaded = 'true';
			});

			//animate the loading bar
			$('.cd-loader').show().animate({width: '50%'}, 1500, function(){
				var timeout = setInterval(function(){
					if( loaded ){
						//this means the video is ready - complete .cd-loader and play the video
						$('.cd-loader').animate({width: '100%'}, 100, function(){
							$('.cd-loader').css('width', 0);
							selected.find('video').show().get(0).play();
							selected.find('img').css('opacity', 1);
							clearInterval(timeout);
						});
					} else {
						//video is not ready yet
						var windowWidth = $(window).width(),
							widthNew = $('.cd-loader').width() + 10;
						if(widthNew < windowWidth ) {
							$('.cd-loader').show().animate({width: widthNew+'px'}, 500);
						}
					}
				}, 500);
			});			
		}
	}

Template.webHome.events({
  	'click #tour': function(event){
		event.preventDefault();
		$('header').addClass('slide-down');
		if($(window).width() < MqL) {
			$('body,html').animate({'scrollTop': $('#cd-product-tour').offset().top - 30 }, 200); 
		} else {
			$('.cd-main-content').addClass('is-product-tour');
			uploadVideo(jQuery('.cd-active'));
		}
		// var elePtour	= document.getElementById("ptour");
		// var eleText		= '一个帖子，记录一个故事; 一个故事，述说一段旅程;一次分享，传播无数快乐. . .';
		// var setText		= "";
		// var count = 0;
		// elePtour.innerText	= "";
		// var eleShowText = window.setInterval(function(){
			
		// 	elePtour.innerText = eleText.slice(0,count);
		// 		count++;
		// }, 80);
	},

	//update the slider - desktop only
	'click .cd-prev': function(event){
		event.preventDefault();
		var activeSlide = $('.cd-active');
		if(activeSlide.is(':first-child')) {
			//in this case - switch from product tour div to product intro div
			showProductIntro();
		} else {
			updateSlider(activeSlide, 'prev'); 
		}
	},

	'click .cd-next': function(event){
		event.preventDefault();
		var activeSlide = $('.cd-active');
		updateSlider(activeSlide, 'next'); 
	},  
  
});


// $.BigVideo = function(options) {

// 	var defaults = {
// 		// If you want to use a single mp4 source, set this to true
// 		useFlashForFirefox:true,
// 		// If you are doing a playlist, the video won't play the first time
// 		// on a touchscreen unless the play event is attached to a user click
// 		forceAutoplay:false,
// 		controls:true
// 	};

// 	var BigVideo = this,
// 		player,
// 		vidEl = '#big-video-vid',
// 		wrap = $('<div id="big-video-wrap"></div>'),
// 		video = $(''),
// 		mediaAspect = 16/9,
// 		vidDur = 0,
// 		defaultVolume = 0.8,
// 		isInitialized = false,
// 		isSeeking = false,
// 		isPlaying = false,
// 		isQueued = false,
// 		isAmbient = false,
// 		doLoop = false,
// 		playlist = [],
// 		currMediaIndex,
// 		currMediaType;

// 	BigVideo.settings = $.extend({}, defaults, options);

// 	// If only using mp4s and browser is firefox, use flash fallback
// 	var ua = navigator.userAgent.toLowerCase();
// 	var isFirefox = ua.indexOf('firefox') != -1;
// 	if (BigVideo.settings.useFlashForFirefox && (isFirefox)) {
// 		VideoJS.options.techOrder = ['flash'];
// 	}


// 	function updateSize() {
// 		var windowW = $(window).width();
// 		var windowH = $(window).height();
// 		var windowAspect = windowW/windowH;
// 		if (windowAspect < mediaAspect) {
// 			// taller
// 			if (currMediaType === 'video') {
// 				player
// 					.width(windowH*mediaAspect)
// 					.height(windowH);
// 				$(vidEl)
// 					.css('top',0)
// 					.css('left',-(windowH*mediaAspect-windowW)/2);
// 				$(vidEl+'_html5_api').css('width',windowH*mediaAspect);
// 				$(vidEl+'_flash_api').css('width',windowH*mediaAspect);
// 			} else {
// 				// is image
// 				$('#big-video-image')
// 					.width(windowH*mediaAspect)
// 					.height(windowH)
// 					.css('top',0)
// 					.css('left',-(windowH*mediaAspect-windowW)/2);
// 			}
// 		} else {
// 			// wider
// 			if (currMediaType === 'video') {
// 				player
// 					.width(windowW)
// 					.height(windowW/mediaAspect);
// 				$(vidEl)
// 					.css('top',-(windowW/mediaAspect-windowH)/2)
// 					.css('left',0);
// 				$(vidEl+'_html5_api').css('width','100%');
// 				$(vidEl+'_flash_api').css('width','100%');
// 			} else {
// 				// is image
// 				$('#big-video-image')
// 					.width(windowW)
// 					.height(windowW/mediaAspect)
// 					.css('top',-(windowW/mediaAspect-windowH)/2)
// 					.css('left',0);
// 			}
// 		}
// 	}

// 	function initPlayControl() {
// 		// create video controller
// 		var markup = '<div id="big-video-control-container">';
// 		markup += '<div id="big-video-control">';
// 		markup += '<a href="#" id="big-video-control-play"></a>';
// 		markup += '<div id="big-video-control-middle">';
// 		markup += '<div id="big-video-control-bar">';
// 		markup += '<div id="big-video-control-bound-left"></div>';
// 		markup += '<div id="big-video-control-progress"></div>';
// 		markup += '<div id="big-video-control-track"></div>';
// 		markup += '<div id="big-video-control-bound-right"></div>';
// 		markup += '</div>';
// 		markup += '</div>';
// 		markup += '<div id="big-video-control-timer"></div>';
// 		markup += '</div>';
// 		markup += '</div>';
// 		$('body').append(markup);

// 		// hide until playVideo
// 		$('#big-video-control-container').css('display','none');

// 		// add events
// 		$('#big-video-control-track').slider({
// 			animate: true,
// 			step: 0.01,
// 			slide: function(e,ui) {
// 				isSeeking = true;
// 				$('#big-video-control-progress').css('width',(ui.value-0.16)+'%');
// 				player.currentTime((ui.value/100)*player.duration());
// 			},
// 			stop:function(e,ui) {
// 				isSeeking = false;
// 				player.currentTime((ui.value/100)*player.duration());
// 			}
// 		});
// 		$('#big-video-control-bar').click(function(e) {
// 			player.currentTime((e.offsetX/$(this).width())*player.duration());
// 		});
// 		$('#big-video-control-play').click(function(e) {
// 			e.preventDefault();
// 			playControl('toggle');
// 		});
// 		player.addEvent('timeupdate', function() {
// 			if (!isSeeking && (player.currentTime()/player.duration())) {
// 				var currTime = player.currentTime();
// 				var minutes = Math.floor(currTime/60);
// 				var seconds = Math.floor(currTime) - (60*minutes);
// 				if (seconds < 10) seconds='0'+seconds;
// 				var progress = player.currentTime()/player.duration()*100;
// 				$('#big-video-control-track').slider('value',progress);
// 				$('#big-video-control-progress').css('width',(progress-0.16)+'%');
// 				$('#big-video-control-timer').text(minutes+':'+seconds+'/'+vidDur);
// 			}
// 		});
// 	}

// 	function playControl(a) {
// 		var action = a || 'toggle';
// 		if (action === 'toggle') action = isPlaying ? 'pause' : 'play';
// 		if (action === 'pause') {
// 			player.pause();
// 			$('#big-video-control-play').css('background-position','-16px');
// 			isPlaying = false;

// 		} else if (action === 'play') {
// 			player.play();
// 			$('#big-video-control-play').css('background-position','0');
// 			isPlaying = true;
// 		}
// 	}

// 	function setUpAutoPlay() {
// 		player.play();
// 		$('body').off('click',setUpAutoPlay);
// 	}

// 	function nextMedia() {
// 		currMediaIndex++;
// 		if (currMediaIndex === playlist.length) currMediaIndex=0;
// 		playVideo(playlist[currMediaIndex]);
// 	}

// 	function playVideo(source) {
// 		// clear image
// 		$(vidEl).css('display','block');
// 		currMediaType = 'video';
// 		player.src(source);
// 		isPlaying = true;
// 		if (isAmbient) {
// 			$('#big-video-control-container').css('display','none');
// 			player.volume(0);
// 			doLoop = true;
// 		} else {
// 			$('#big-video-control-container').css('display','block');
// 			player.volume(defaultVolume);
// 			doLoop = false;
// 		}
// 	}

// 	function showPoster(source) {
// 		// remove old image
// 		$('#big-video-image').remove();

// 		// hide video
// 		player.pause();
// 		$(vidEl).css('display','none');
// 		$('#big-video-control-container').css('display','none');

// 		// show image
// 		currMediaType = 'image';
// 		var bgImage = $('<img id="big-video-image" src='+source+' />');
// 		wrap.append(bgImage);

// 		$('#big-video-image').imagesLoaded(function() {
// 			mediaAspect = $('#big-video-image').width() / $('#big-video-image').height();
// 			updateSize();
// 		});
// 	}

// 	BigVideo.init = function() {
// 		if (!isInitialized) {
// 			// create player
// 			$('body').prepend(wrap);
// 			var autoPlayString = BigVideo.settings.forceAutoplay ? 'autoplay' : '';
// 			player = $('<video id="'+vidEl.substr(1)+'" class="video-js vjs-default-skin" preload="auto" data-setup="{}" '+autoPlayString+' webkit-playsinline></video>');
// 			player.css('position','absolute');
// 			wrap.append(player);
// 			player = _V_(vidEl.substr(1), { 'controls': false, 'autoplay': true, 'preload': 'auto' });
			
// 			// add controls
// 			if (BigVideo.settings.controls) initPlayControl();
			
// 			// set initial state
// 			updateSize();
// 			isInitialized = true;
// 			isPlaying = false;

// 			if (BigVideo.settings.forceAutoplay) {
// 				$('body').on('click', setUpAutoPlay);
// 			}
			
// 			// set events
// 			$(window).resize(function() {
// 				updateSize();
// 			});

// 			player.addEvent('loadedmetadata', function(data) {
// 				if (document.getElementById('big-video-vid_flash_api')) {
// 					// use flash callback to get mediaAspect ratio
// 					mediaAspect = document.getElementById('big-video-vid_flash_api').vjs_getProperty('videoWidth')/document.getElementById('big-video-vid_flash_api').vjs_getProperty('videoHeight');
// 				} else {
// 					// use html5 player to get mediaAspect
// 					mediaAspect = $('#big-video-vid_html5_api').prop('videoWidth')/$('#big-video-vid_html5_api').prop('videoHeight');
// 				}
// 				updateSize();
// 				var dur = Math.round(player.duration());
// 				var durMinutes = Math.floor(dur/60);
// 				var durSeconds = dur - durMinutes*60;
// 				if (durSeconds < 10) durSeconds='0'+durSeconds;
// 				vidDur = durMinutes+':'+durSeconds;
// 			});
			
// 			player.addEvent('ended', function() {
// 				if (doLoop) {
// 					player.currentTime(0);
// 					player.play();
// 				}
// 				if (isQueued) {
// 					nextMedia();
// 				}
// 			});
// 		}
// 	};

// 	BigVideo.show = function(source,options) {
// 		isAmbient = (options !== undefined && options.ambient === true);
// 		if (typeof(source) === 'string') {
// 			var ext = source.substring(source.lastIndexOf('.')+1);
// 			if (ext === 'jpg' || ext === 'gif' || ext === 'png') {
// 				showPoster(source);
// 			} else {
// 				playVideo(source);
// 				isQueued = false;
// 				console.log(isQueued);
// 			}
// 		} else {
// 			playlist = source;
// 			currMediaIndex = 0;
// 			playVideo(playlist[currMediaIndex]);
// 			isQueued = true;
// 		}
// 	};

// 	// Expose Video.js player
// 	BigVideo.getPlayer = function() {
// 		return player;
// 	};
// };


// Template.webHome.rendered = function () {
//   //    $('.webHome').css('height', $(window).height());
//   //    $('.webFooter').css('left', $(window).width()*0.5-105);
//   $('.sendAlert').css('display', "none");
//   trackPage('http://www.tiegushi.com/');
//   /*
//   Meteor.subscribe("versions");
//   Meteor.subscribe("publicPosts","StynhCAjeAdBrZTff")
//   */
// };

// Template.webHome.helpers({
//   resetPassword: function () {
//     return Session.get('resetPassword');
//   },
//   /*,
//   versions: function(){
//       return Versions.findOne();
//   },
//   */
//   buildVersion: function () {
//     return version_of_build;
//   },
//   isShowBanner: function () {
//     return !(localStorage.getItem('travel-box--banner-show') === 'true');
//   }
//   /*
//   helpPost: function(){
//       return Posts.findOne({_id: 'StynhCAjeAdBrZTff'})
//   }
//   */
// });

//Meteor.startup(function() {
//    $(window).resize(function() {
//      $('.webHome').css('height', $(window).height());
//      $('.webFooter').css('left', $(window).width()*0.5-105);
//    });
//  });
