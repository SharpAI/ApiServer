window.openVideoInBrowser = function(video_src){
  cordova.ThemeableBrowser.open(video_src, '_blank', {  
        statusbar: {  
            color: '#00000000'  
        },  
        toolbar: {  
            height: 44,  
            color: '#f0f0f0ff'  
        },  
        title: {  
            color: '#ff000000',  
            showPageTitle: true,   
        },  
        backButton: {  
            image: 'back',  
            imagePressed: 'back_pressed',  
            align: 'left',  
            event: 'backPressed'  
        },  
        forwardButton: {  
            image: 'forward',  
            imagePressed: 'forward_pressed',  
            align: 'left',  
            event: 'forwardPressed'  
        },  
        closeButton: {  
            image: 'close',  
            imagePressed: 'close_pressed',  
            align: 'left',  
            event: 'closePressed'  
        },  
        backButtonCanClose: true  
    }).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {  
        console.error(e.message);  
    }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {  
        console.log(e.message);  
    });  
}