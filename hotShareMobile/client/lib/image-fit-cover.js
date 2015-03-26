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
	},

    $.fn.isSupportObjectFit = function(){
        var objectFitSupported = false;
        var check = document.createElement('div');
        objectFitSupported = !!(0 + check.style['object-fit']);
        return objectFitSupported;
    },

    $.fn.actImageFitCover = function(e, ui, $widget) {
        function getPorp(styleStr, propertyName) {
            if ((styleStr == null) || (styleStr == '')) {
                return '';
            }
            var styleAttrs = styleStr.split(';');
            for (i = 0, len = styleAttrs.length; i < len; i++) {
                var item = styleAttrs[i];
                var styleValue = item.split(':');
                if (styleValue[0].trim() === propertyName) {
                    //if (styleValue[1].indexOf('%') >= 0) {
                        return styleValue[1].trim();
                    //}
                }
            }
            return '';
        }

        if ($widget.isSupportObjectFit()) {
            return ;
        }

        var imgs = $widget.find('img'),w=0, h=0,i=0, fw=0, fh=0, par,tar;
        var attrs={width:'auto',height:'auto', left:0,top:0};

        if (imgs.length>0) {
            var padding = 0;
            var img = $(imgs[0]);
            var styleStr=img.attr('style');
            fw = $widget.width() - padding*2;
            fh = $widget.height() - padding*2;
            tar = fw / fh;
            if (img[0].naturalWidth) {
                w = img[0].naturalWidth;
                h = img[0].naturalHeight;
            } else {
                // Old IE < 9
                w = img[0].width;
                h = img[0].height;
            }
            par = w / h;

            var styleStr=img.attr('cropStyle');
            var crop_width = getPorp(styleStr, "width");
            var crop_height = getPorp(styleStr, "height");
            var crop_left = getPorp(styleStr, "left");
            var crop_top = getPorp(styleStr, "top");
            var holder_width = getPorp(styleStr, "h_width");
            var holder_height = getPorp(styleStr, "h_height");

            var rel_height = crop_height.replace('px','');
            var num_height = parseFloat(rel_height);

            var rel_width = crop_width.replace('px','');
            var num_width = parseFloat(rel_width);

            var rel_left = crop_left.replace('px','');
            var num_left = parseFloat(rel_left);

            var rel_top = crop_top.replace('px','');
            var num_top = parseFloat(rel_top);


            var rel_h_height = holder_height.replace('px','');
            var num_h_height = parseFloat(rel_h_height);

            var rel_h_width = holder_width.replace('px','');
            var num_h_width = parseFloat(rel_h_width);

            var w1 = fw/num_h_width;
            var h1 = fh/num_h_height;

            if (h > 0 && w > 0) {
                if ((crop_top != "") && (crop_left != "")) {
                    if (w1 >= h1) {
                        var width = fw /(num_h_width/num_width);
                        var height = width/par;
                        var left = num_left/num_width*width;
                        var top = num_top/num_height*height;

                        var ratio = Math.abs(num_h_width/num_h_height);

                        attrs.width = width+'px';
                        attrs.height = height+'px';
                        attrs.left = left+'px';

                        attrs.top = top-Math.abs((fh-fw/ratio)/2) + 'px';
                        console.log("fw:"+fw);
                        console.log("###1 width:"+width+" height:"+height+ " left:"+left +" top:"+attrs.top);

                        // window.style_width_changed = 1;
                    } else {
                        var height = fh /(num_h_height/num_height);
                        var width = height*par;
                        var left = num_left/num_width*width;
                        var top = num_top/num_height*height;

                        var ratio = Math.abs(num_h_width/num_h_height);
                        attrs.width = width+'px';
                        attrs.height = height+'px';

                        attrs.top = top+'px';

                        attrs.left = left-Math.abs((fw-fh*ratio)/2) + 'px';
                        console.log("###2 width:"+width+" height:"+height+ " left:"+attrs.left +" top:"+top);
                    }
                } else {
                    if (tar > par) {
                        attrs.width = '100%';
                        attrs.top = 0-Math.abs((fh-(fw/par))/2) + 'px';
                    } else {
                        attrs.height = '100%';
                        attrs.left = 0-Math.abs((fw-(fh*par))/2) + 'px';
                    }
                }
                var addRelative = false;
                if (addRelative) {
                    attrs.position = 'relative';
                }
                img.css(attrs);
            }
        }
    }
	
})(jQuery);