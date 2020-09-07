//var http = require('http');
//var apn = Npm.require('apn');
//var url = require('url');
 
// var myPhone = "d2d8d2a652148a5cea89d827d23eee0d34447722a2e7defe72fe19d733697fb0";
// var myiPad = "51798aaef34f439bbb57d6e668c5c5a780049dae840a0a3626453cd4922bc7ac";

// var myDevice = new apn.Device(myPhone);

// var note = new apn.Notification();
// note.badge = 1;
// note.sound = "notification-beep.wav";
// note.alert = { "body" : "Your turn!", "action-loc-key" : "Play" , "launch-image" : "mysplash.png"};
// note.payload = {'messageFrom': 'Holly'};

// note.device = myDevice;

// var callback = function(errorNum, notification){
//     console.log('Error is: %s', errorNum);
//     console.log("Note " + notification);
// }
// var options = {
//     gateway: 'gateway.sandbox.push.apple.com', // this URL is different for Apple's Production Servers and changes when you go to production
//     errorCallback: callback,
//     cert: 'PushNotificationSampleCert.pem',                 
//     key:  'PushNotificationSampleKey.pem',                 
//     passphrase: 'myPassword',                 
//     port: 2195,                       
//     enhanced: true,                   
//     cacheLength: 100                  
// }
// var apnsConnection = new apn.Connection(options);
// apnsConnection.sendNotification(note);