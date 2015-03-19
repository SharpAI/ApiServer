/* imageFitCover v0.2 | Author: Neil Gardner, 2014 | License: GPL/MIT */
(function($) {

	$.fn.imageFitCover = function(delay){
		
		var container = this, imgs, numContainers=0, objectFitSupported=false, resized = false, addRelative = false;
		
		var setNaturalSize = function(img) {
			// Use width and height attributes if available, these should match desired aspect ratio
			if (!img.attr('width') && !img.attr('height')) {
				var image = new Image(),attrs={};
				image.src = img.attr("src");
				$(image).on('load',function(){
					var im = $(this)[0];
					if (im.naturalWidth) {
						attrs = {width:im.naturalWidth,height:im.naturalHeight};
					} else {
						// Old IE < 9
						attrs = {width:im.width,height:im.height};
					}
					img.attr(attrs);
				});
			}
		}
		
		var setNaturalSizes = function(imgs) {
			if (imgs.length>0) {
				for (var i=0;i<numContainers;i++) {
					setNaturalSize($(imgs[i]));
				}
			}
		}
		
		var resizeImg = function(index) {
			if (imgs.length > index) {
				var img = imgs.eq(index),w=0, h=0,i=0, fw=0, fh=0,attrs={width:'auto',height:'auto', left:0,top:0}, par,tar;
				fw = container.eq(index).width();
				fh = container.eq(index).height();
				tar = fw / fh;
				h = img.attr('height') -0;
				w = img.attr('width') -0;
				if (h > 0 && w > 0) {
					par = w / h;
					if (tar > par) {
						attrs.width = '100%';
						attrs.top = 0-Math.abs((fh-(fw/par))/2) + 'px';
					} else {
						attrs.height = '100%';
						attrs.left = 0-Math.abs((fw-(fh*par))/2) + 'px';
					}
					if (addRelative) {
						attrs.position = 'relative';
					}
					img.css(attrs);
					if (i==0 && !resized) {
						container.addClass('image-fit-cover');
						resized = true;
					}
				}
			}
		}
		
		var resetSize = function(){
			if (imgs.length>0) {
				for (var i=0;i<numContainers;i++) {
					resizeImg(i);
				}
			}
		}
		
		var init = function() {
			numContainers = container.length;
			if (numContainers>0) {
				imgs = container.find('img');
				if (imgs.length>0) {
					// Check support for object-fit property
					var b = $('body');
					if (b.hasClass('object-fit-checked') == false) {
						var check = document.createElement('div');
						objectFitSupported = !!(0 + check.style['object-fit']);
						b.addClass('object-fit-checked');
					} else {
						objectFitSupported = b.hasClass('object-fit-supported');
					}
					if (!objectFitSupported) {
						if (!delay) {
							delay = 10;
						}
						// images must have a non-static position
						if ( imgs.eq(0).css('position')  == 'static') {
							addRelative = true;
						}
						setNaturalSizes(imgs);
						setTimeout(resetSize,delay);
						$(window).on('resize', resetSize);
					} else {
						b.addClass('object-fit-supported');
					}
				}
			}
		}
		init();
		return this;
	}
	
})(jQuery);