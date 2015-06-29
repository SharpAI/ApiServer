
get_image_size_from_URI = function(imageURI,callback) {
	// This function is called once an imageURI is rerturned from PhoneGap's camera or gallery function
	window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
		fileEntry.file(function(fileObject){
			// Create a reader to read the file
			var reader = new FileReader();

			// Create a function to process the file once it's read
			reader.onloadend = function(evt) {
				//console.log('Create an image element that we will load the data into ');
				var image = new Image();
				image.onerror = function(){
					image = null;
					if (callback){
						callback(0,0)
					}
				};
				image.onload = function(evt) {
					// The image has been loaded and the data is ready
					var image_width = this.width;
					var image_height = this.height;
					console.log("IMAGE HEIGHT: " + image_height + " IMAGE WIDTH: " + image_width);
					// We don't need the image element anymore. Get rid of it.
					image = null;
					if (callback){
						callback(image_width,image_height)
					}
				};
				// Load the read data into the image source. It's base64 data
				image.src = evt.target.result
			};
			reader.onabort = function(){
				console.log("reader.onabort");
				if(callback){
					callback(0,0)
				}
			};
			reader.onerror = function(){
				console.log("reader.onerror");
				if(callback){
					callback(0,0)
				}
			};
			// Read from disk the data as base64
			reader.readAsDataURL(fileObject)
		}, function(){
			console.log("There was an error reading or processing this file.");
			if(callback){
				callback(0,0)
			}
		})
	})
};
