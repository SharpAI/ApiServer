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

    $.fn.getStyleProp = function(){
        function isCropped(styleStr) {
            if ((styleStr == null) || (styleStr == '')) {
                return '';
            }
            var hasTop = 0, hasLeft = 0;
            var styleAttrs = styleStr.split(';');
            for (i = 0, len = styleAttrs.length; i < len; i++) {
                var item = styleAttrs[i];
                var styleValue = item.split(':');
                if (styleValue[0].trim() === 'top') {
                    if (styleValue[1].indexOf('%') >= 0) {
                        hasTop = 1;
                    }
                } else if (styleValue[0].trim() === 'left') {
                    if (styleValue[1].indexOf('%') >= 0) {
                        hasLeft = 1;
                    }
                }
            }
            if (hasTop && hasLeft)
                return true;
            else
                return false;
        }

        var container = this;
        var padding = 0,
            fw = container.width() - padding*2,
            fh = container.height() - padding*2,
            imgs = container.find('img');
            if (!imgs)
                return '';
        var img = $(imgs[0]);
            if (!img)
                return '';
        //console.log("FrankAA: width="+img.css('width')+", height="+img.css('height')+", top="+img.css('top')+", left="+img.css('left'));
        //console.log("FrankAA: img attr style = "+img.attr('style'));
        var w1 = parseFloat(img.css('width').replace('px',''))*100/fw + '%',
            h1 = parseFloat(img.css('height').replace('px',''))*100/fh + '%',
            l1 = parseFloat(img.css('left').replace('px',''))*100/fw + '%',
            t1 = parseFloat(img.css('top').replace('px',''))*100/fh + '%',
            style = "height:" + h1 + ';width:' + w1 + ';top:' + t1 + ';left:' + l1 + ';';

        if (isCropped(img.attr('style'))) {
            return img.attr('style');
        } else {
            return undefined;
        }
    },

    $.fn.actImageResize = function(e, ui, $widget) {
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
            //return ;
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
    },

    $.fn.actImageFitCover = function(styleAttrName) { //No style2, should be compatiable with the older version
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

        var container = this;
        var scale = 1;
        var imgs = container.find('img'),w=0, h=0,i=0, fw=0, fh=0, par,tar;
        var attrs={width:'auto',height:'auto', left:0,top:0};

        if (imgs.length>0) {
            var padding = 6;
            var img = $(imgs[0]);
            var styleStr=img.attr(styleAttrName);
            fw = container.width() - padding*2;
            fh = container.height() - padding*2;
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

            //var cssStyleStr=img.attr('style');
            var crop_width = getPorp(styleStr, "width");
            var crop_height = getPorp(styleStr, "height");
            var crop_left = getPorp(styleStr, "left");
            var crop_top = getPorp(styleStr, "top");

            var num_height = parseFloat(crop_height);
            var num_width = parseFloat(crop_width);
            var num_left = parseFloat(crop_left);
            var num_top = parseFloat(crop_top);

            /*if (container.isSupportObjectFit()) {
                if (tar >= par) {
                    scale = img.width()/fw;
                } else {
                    scale = img.height()/fh;
                }
                return scale;
            }*/

            if (h > 0 && w > 0) {
                if ((crop_top != '') && (crop_left != '')) {
                    var sar = num_width*fw/(num_height*fh);
                    //if (sar >= par) {
                    var oldtar = num_height*par/num_width;
                    if (tar >= oldtar) {
                        var width = num_width;
                        var height = width*tar/par;
                        var left = num_left;
                        var top = num_top*height/num_height;
                        var ratio = Math.abs(num_height * par / num_width);

                        top = top+100*(1-tar/ratio)/2;
                        top = top>0?0:top;

                        attrs.width = width+'%';
                        attrs.height = height+'%';
                        attrs.left = left+'%';
                        //attrs.top = top+'%';
                        //attrs.top = top-Math.abs((fh-fw/ratio)/2) + '%';
                        attrs.top = top+'%';
                        console.log("###1 width:"+width+" height:"+height+ " left:"+left +" top:"+attrs.top);
                    } else {
                        /*
                        var height = num_height;
                        var width = height*par/tar;
                        var left = num_left*width/num_width;
                        var top = num_top;
                        var ratio = Math.abs(width/num_width);

                        attrs.width = width+'%';
                        attrs.height = height+'%';
                        attrs.top = top+'%';
                        //attrs.left = left+'%';
                        attrs.left = left-(100*(ratio-1)/2) + '%';
                        console.log("###2 width:"+width+" height:"+height+ " left:"+attrs.left +" top:"+top);
                        */
                        var height = num_height;
                        var width = height*par/tar;
                        var left = num_left*width/num_width;
                        var top = num_top;
                        var ratio = Math.abs(num_height * par / num_width);

                        left = left+100*(1-ratio/tar)/2;
                        attrs.width = width+'%';
                        attrs.height = height+'%';
                        attrs.top = top+'%';
                        attrs.left = left+'%';
                        console.log("###2 width:"+width+" height:"+height+ " left:"+attrs.left +" top:"+top);
                        /*if (tar > par) {
                            var width = num_width;
                            var height = width*tar/par;
                            var left = num_left;
                            var top = num_top*height/num_height;
                            var ratio = Math.abs(num_height * par / num_width);

                            top = top+100*(1-tar/ratio)/2;
                            top = top>0?0:top;

                            attrs.width = width+'%';
                            attrs.height = height+'%';
                            attrs.left = left+'%';
                            //attrs.top = top+'%';
                            //attrs.top = top-Math.abs((fh-fw/ratio)/2) + '%';
                            attrs.top = top + '%';

                            console.log("###2-1 width:"+width+" height:"+height+ " left:"+left +" top:"+attrs.top);
                        } else {//Pull height larger and larger
                            var height = num_width;
                            var width = height*par/tar;
                            var left = num_left*width/num_width;
                            var top = num_top*height/num_height;
                            var ratio = Math.abs(num_height * par / num_width);

                            //attrs.top = top-Math.abs((fh-fw/par)/2) + 'px';
                            top = top+100*(1-tar/par)/2
                            left = left+100*(1-par/tar)/2;
                            top = top>0?0:top;
                            left = left>0?0:left;
                            //attrs.left = left-Math.abs((fw-fh*par)/2) + 'px';

                            attrs.width = width+'%';
                            attrs.height = height+'%';
                            attrs.top = top+'%';
                            attrs.left = left+'%';
                            console.log("###2-2 width:"+width+" height:"+height+ " left:"+attrs.left +" top:"+top);
                        }*/
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
                //img.css(attrs);

                var objectFitSupported = false;
                var check = document.createElement('div');
                objectFitSupported = !!(0 + check.style['object-fit']);
                if (!objectFitSupported) {
                    img.css(attrs);
                }

                if (tar >= par) {
                    scale = parseFloat(attrs.width)/100;
                } else {
                    scale = parseFloat(attrs.height)/100;
                }
            }
        }
        return scale;
    }
	
})(jQuery);