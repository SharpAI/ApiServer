var CROP = (function () {

	return function () {

		// Code Dependant Variables
		this.eles = {
			ele: undefined,
			container: undefined,
			img: undefined,
			overlay: undefined,
			shadow: undefined,
			grid: undefined,
			preview: undefined,
            callback: undefined
		};

		this.img = undefined;
		this.imgInfo = {
			style: '',
			aw: 0,
			ah: 0,
			w: 0,
			h: 0,
			at: 0,
			al: 0,
			t: 0,
			l: 0,
			s: 1, // scale
			v: 1
		};

		this.init = function(ele) {

			$(ele.container)
				.attr({
					'data-imgcrop': '',
					'data-mask': ele.mask
				})
                //.append('<div class="cropMain"></div>');
                .append('<input type="range" style="display:none" value="1" min="'+ele.zoom.min+'" max="'+ele.zoom.max+'" step="'+ele.zoom.steps+'"><div class="cropMain"></div>');

			// set min zoom
			this.imgInfo.s = ele.zoom.min;
			if (ele.style) {
				this.imgInfo.v = ele.zoom.value;
			}
			if (ele.style) {
				this.imgInfo.style = ele.style;
			}
            if (ele.callback) {
                this.eles.callback = ele.callback;
            }


			/*
				Elements
			*/
			var umm = ele,
				shell = $(ele.container),
				zoom = shell.find('input'),
				cropMain = shell.find('.cropMain'),
				cropPreview = ele.preview,
				img,
				container,
				overlay,
                		shadow,
				grid,
				that = this;


			/*
				Container
			*/
			container = $('<div />')
				.attr({
				class: 'crop-container'
			})
				.css({
				width: ele.width + 'px',
				height: ele.height + 'px'
			});

			/*
				Image
			*/
			img = $('<img />')
					.attr('class', 'crop-img')
					.css({
						zIndex: 5999,
						top: 0,
						left: 0
					});




			/*
				Crop Overlay
			*/
			overlay = $('<div />')
				.attr({
				class: 'crop-overlay',
				draggable: "true"
			})
				.css({
				zIndex: 6000
			});

            /*
				Crop shadow
			*/
			shadow = $('<div />')
				.attr({
				class: 'crop-shadow'
			})
				.css({
                top:0,
                left:0
			});

			grid = '<div class="imgMask"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

			// Add Elements
			container.append(overlay);
			container.append(img);
			container.append(shadow);
			container.append(grid);
			cropMain.append(container);

			this.eles.ele = cropMain;
			this.eles.container = container;
			this.eles.img = img;
			this.eles.overlay = overlay;
			this.eles.shadow = shadow;
			this.eles.grid = grid;
			this.eles.preview = cropPreview;

			// load image
			this.loadImg(ele.image);
			if (this.imgInfo.style != '') {
				zoom.val(this.imgInfo.v);
				rangeColor(zoom);
			}


			/*
				Bind Events
			*/
			container.resize(function () {
				that.imgSize();
			});


			/*
				Overlay Movement
			*/
			overlay.bind(((document.ontouchstart !== null) ? 'mousedown' : 'touchstart'), function (e) {
                if (e.originalEvent.touches.length >= 2) {
                    //console.log("multiple touchs, mousedown, "+e.originalEvent.changedTouches.length);
                    return;
                }

				// apply grab cursor
				$('body').addClass('grabcursor');

				var o = $(this),
					mousedown = {
						x: (e.originalEvent.touches[0].pageX),
						y: (e.originalEvent.touches[0].pageY)
					},
					elepos = {
						x: o.parent().offset().left,
						y: o.parent().offset().top
					};

				e.preventDefault();


				$(document).bind(((document.ontouchmove !== null) ? 'mousemove' : 'touchmove'), function (e) {

                    if (e.originalEvent.touches.length >= 2) {
                        //console.log("multiple touchs, touchmove, "+e.originalEvent.changedTouches.length);
                        return;
                    }
					var mousepos = {
						x: (e.originalEvent.changedTouches[0].pageX || mousedown.x),
						y: (e.originalEvent.changedTouches[0].pageY || mousedown.y)
					};


					if (mousedown.y !== mousepos.y) {

						if (parseInt(o.css('top')) === 0) o.css({
							top: that.eles.ele.offset().top,
							left: that.eles.ele.offset().left
						});

						// Move Image
						that.imgMove({
							t: parseInt(o.css('top')) - (elepos.y - (mousedown.y - mousepos.y)),
							l: parseInt(o.css('left')) - (elepos.x - (mousedown.x - mousepos.x))
						});

						// Reposition Overlay
						o.css({
							left: elepos.x - (mousedown.x - mousepos.x),
							top: elepos.y - (mousedown.y - mousepos.y)
						});

					}

				});

				$(document).bind(((document.ontouchend !== null) ? 'mouseup' : 'touchend'), function (e) {
                    if (e.originalEvent.touches.length >= 2) {
                        //console.log("multiple touchs, touchmove, "+e.originalEvent.changedTouches.length);
                        return;
                    }
					// remove grab cursor
					$('body').removeClass('grabcursor');

					$(document).unbind(((document.ontouchmove !== null) ? 'mousemove' : 'touchmove'));
					overlay.css({
						top: 0,
						left: 0
					});
				});

				return false;
			});


			//  config slide
			// --------------------------------------------------------------------------

			$('input[type=range]').on("input change", function () {

				that.slider(zoom.val());

				rangeColor(zoom);

			});

			that.zoom = function(num) {

				if(num === 'min' || num === 'max')
					var num = parseInt(zoom.attr(num));

				that.slider(num);
				zoom.val(num);
				rangeColor(zoom);

			};


			// zoom slider progress color
			function rangeColor(self) {

				var val = self.val(),
					min = self.attr('min'),
					max = self.attr('max'),
					pos = Math.round(((val - min) / (max - min)) * 100),
					style = "display:none; background: linear-gradient(to right, #fbc93d " + pos + "%, #eee " + (pos + 0.1) + "%);";

				// apply background color to range progress
				self.attr('style', style);

			}

		};

		this.loadImg = function (url) {
			var that = this;

			this.eles.img.removeAttr('style').attr('src', url)
				.load(function () {
				that.imgSize();
                if (that.eles.callback) {
                    that.eles.callback();
                }
			});
		};

		this.imgSize = function () {
			var img = this.eles.img,
				imgSize = {
					w: img.css('width', '').width(),
					h: img.css('height', '').height()
				},
				c = this.eles.container;

			var holderRatio = {
				wh: this.eles.container.width() / this.eles.container.height(),
				hw: this.eles.container.height() / this.eles.container.width()
			};

			this.imgInfo.aw = imgSize.w;
			this.imgInfo.ah = imgSize.h;

			if (imgSize.w * holderRatio.hw < imgSize.h * holderRatio.wh) {

				this.imgInfo.w = c.width();
				this.imgInfo.h = this.imgInfo.w * (imgSize.h / imgSize.w);
				this.imgInfo.al = 0;

			} else {

				this.imgInfo.h = c.height();
				this.imgInfo.w = this.imgInfo.h * (imgSize.w / imgSize.h);
				this.imgInfo.at = 0;
			}

			if (this.imgInfo.style != '') {
                var getPorp = function(styleStr, propertyName) {
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
                var styleArray = this.imgInfo.style.split(';');
                var topValue = parseFloat(getPorp(this.imgInfo.style, 'top'));
                var leftValue = parseFloat(getPorp(this.imgInfo.style, 'left'));
                this.imgInfo.t = -c.height() * topValue / 100;
                this.imgInfo.l = -c.width() * leftValue / 100;
                this.imgInfo.s = this.imgInfo.v;
				this.slider(this.imgInfo.v);
				//img.attr('style', this.imgInfo.style);
			} else {
                this.imgResize();
            }

		};


		this.imgResize = function (scale) {

			var img = this.eles.img,
				imgInfo = this.imgInfo,
				oldScale = imgInfo.s;

			imgInfo.s = scale || imgInfo.s;

			img.css({
				width: imgInfo.w * imgInfo.s,
				height: imgInfo.h * imgInfo.s
			});

			// Move Image Based on Size Changes
			this.imgMove({
				t: -((imgInfo.h * oldScale) - (imgInfo.h * imgInfo.s)) / 2,
				l: -((imgInfo.w * oldScale) - (imgInfo.w * imgInfo.s)) / 2
			});
		};

		this.imgMove = function (move) {

			var img = this.eles.img,
				imgInfo = this.imgInfo,
				c = this.eles.container;

			imgInfo.t += move.t;
			imgInfo.l += move.l;

			var t = imgInfo.at - imgInfo.t,
				l = imgInfo.al - imgInfo.l;


			if (t >= 0) t = imgInfo.t = 0;

			else if (t < -((imgInfo.h * imgInfo.s) - c.height())) {
				t = -((imgInfo.h * imgInfo.s) - c.height());
				imgInfo.t = ((imgInfo.at === 0) ? (imgInfo.h * imgInfo.s) - c.height() : (imgInfo.h * imgInfo.s) - c.height());
			}

			if (l >= 0) l = imgInfo.l = 0;

			else if (l < -((imgInfo.w * imgInfo.s) - c.width())) {
				l = -((imgInfo.w * imgInfo.s) - c.width());
				imgInfo.l = ((imgInfo.al === 0) ? (imgInfo.w * imgInfo.s) - c.width() : (imgInfo.w * imgInfo.s) - c.width());
			}

			// Set Position
			img.css({
				top: t,
				left: l
			});


			if(this.eles.preview)
				this.preview(this.eles.preview.width, this.eles.preview.height, this.eles.preview.container);

		};



		/*
			Slider
		*/
		this.slider = function (slideval) {

			this.imgResize(slideval);

		};




		//  return cropped data: coordinates & base64 string
		// --------------------------------------------------------------------------

		this.data = function(width, height, filetype) {

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			var original = new Image();
				original.src = img.attr('src');

			// draw image to canvas
			var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				w = Math.round((c.width() - (0 * 2)) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				h = Math.round((c.height() - (0 * 2)) * (imgInfo.ah / (imgInfo.h * imgInfo.s))),
				x = Math.round(-(parseInt(img.css('left')) - 0) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				y = Math.round(-(parseInt(img.css('top')) - 0) * (imgInfo.ah / (imgInfo.h * imgInfo.s)));

			canvas.getContext('2d').drawImage(original, x, y, w, h, 0, 0, width, height);

			data = {
				width: width,
				height: height,
				image: canvas.toDataURL("image/"+filetype),
				filetype: filetype
			};

			return data;
		};





		//  show preview
		// --------------------------------------------------------------------------

		this.preview = function(width, height, target) {

			// if #preview element doesn't exist, create
			if(!$(target + ' img').length)
				$(target).append('<img>');

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			var original = new Image();
				original.src = img.attr('src');

			// draw image to canvas
			var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				w = Math.round((c.width() - (0 * 2)) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				h = Math.round((c.height() - (0 * 2)) * (imgInfo.ah / (imgInfo.h * imgInfo.s))),
				x = Math.round(-(parseInt(img.css('left')) - 0) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				y = Math.round(-(parseInt(img.css('top')) - 0) * (imgInfo.ah / (imgInfo.h * imgInfo.s)));

			canvas.getContext('2d').drawImage(original, x, y, w, h, 0, 0, width, height);

			$(target + ' img')
				.attr('src', canvas.toDataURL());


		};



		//  flip image
		// --------------------------------------------------------------------------

		this.flip = function() {

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			// get current width & height
			var original = new Image();
				original.src = img.attr('src');
				height = original.naturalHeight;
				width = original.naturalWidth;

			canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			canvas.getContext('2d').translate(width, 0);
			canvas.getContext('2d').scale(-1, 1);
			canvas.getContext('2d').drawImage(original, 0, 0);
			canvas.getContext('2d').translate(width, 0);
			canvas.getContext('2d').scale(-1, 1);

			c.find('.crop-img')
				.removeAttr('style')
				.attr('src', canvas.toDataURL());

		};




		//  rotate 90 degrees
		// --------------------------------------------------------------------------

		this.rotate = function() {

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			// get current width & height
			var original = new Image();
				original.src = img.attr('src');
				height = original.naturalHeight;
				width = original.naturalWidth;

			canvas = document.createElement('canvas');
			canvas.width = height;
			canvas.height = width;

			canvas.getContext('2d').translate(canvas.width / 2, canvas.height / 2);
			canvas.getContext('2d').rotate(Math.PI / 2);
			canvas.getContext('2d').drawImage(original, -width / 2, -height / 2);
			canvas.getContext('2d').rotate(-Math.PI / 2);
			canvas.getContext('2d').translate(-canvas.width / 2, -canvas.height / 2);

			c.find('.crop-img')
				.removeAttr('style')
				.attr('src', canvas.toDataURL());

		};



		//  download image
		// --------------------------------------------------------------------------

		this.download = function(width, height, filename, filetype, link) {

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			var original = new Image();
				original.src = img.attr('src');

			// draw image to canvas
			var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				w = Math.round((c.width() - (0 * 2)) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				h = Math.round((c.height() - (0 * 2)) * (imgInfo.ah / (imgInfo.h * imgInfo.s))),
				x = Math.round(-(parseInt(img.css('left')) - 0) * (imgInfo.aw / (imgInfo.w * imgInfo.s))),
				y = Math.round(-(parseInt(img.css('top')) - 0) * (imgInfo.ah / (imgInfo.h * imgInfo.s)));

			canvas.getContext('2d').drawImage(original, x, y, w, h, 0, 0, width, height);

			$('#' + link)
				.attr('href', canvas.toDataURL("image/"+filetype))
				.attr('download', filename + '.' + filetype);

		};



		//  import new image
		// --------------------------------------------------------------------------

		this.import = function() {

			$('body').append('<input type="file" id="importIMG" style="display:none">');
			$('#importIMG').click();

			var self = this,
				imgInfo = self.imgInfo,
				c = self.eles.container,
				img = self.eles.img;

			oFReader = new FileReader(), rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;


			$('#importIMG').change(function() {

				if(document.getElementById("importIMG").files.length === 0) return;
				var oFile = document.getElementById("importIMG").files[0];
				if(!rFilter.test(oFile.type)) return;
				oFReader.readAsDataURL(oFile);

				$('#importIMG').remove();

			});

			oFReader.onload = function (oFREvent) {

				c.find('.crop-img')
					.removeAttr('style')
					.attr('src', oFREvent.target.result);

			};

		};

	};

}());
