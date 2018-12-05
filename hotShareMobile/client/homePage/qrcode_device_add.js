window.QRCodeAddDevice = function() {
  cordova.plugins.barcodeScanner.scan(
    function(result) {
      /*
        Result: f681ffe35abf
        Format: QR_CODE
        Cancelled: 0
      */
      var checkDeviceQRCode = function(code){
        var regex = /^[a-z0-9]{12,64}$/;
        if(!regex.test(code)){
          return false;
        }
        return true;
      }
      if (!checkDeviceQRCode(result.text)) {
        PUB.toast('请扫描有效的脸脸盒二维码!');
        return;
      }
      console.log("We got a barcode\n" +
        "Result: " + result.text + "\n" +
        "Format: " + result.format + "\n" +
        "Cancelled: " + result.cancelled);
      var gotoPage = '/';
      //var  requiredStr = rest_api_url+'/simple-chat/to/group?id='
      if (result.text) {
        console.log('device barcode is '+result.text )

          var self = {
            "domain":"local.",
            "port":8000,
            "txtRecord":{
              "macAddress":result.text,
              "uuid":result.text
            },"ipv4Addresses":[""],
            "hostname":"deepeyeBox.local.",
            "ipv6Addresses":[],
            "type":"_DeepEye._tcp.",
            "name":"deepeyeBox",
            "uuid":result.text,
            "get_group_only": true,
            "isInDB":false
          }
          console.log("self = "+JSON.stringify(self));
          return window.SELECT_CREATE_GROUP.show(self, function(group_id, group_name) {
            //var msgBody = {_id: new Mongo.ObjectID()._str,group_id:group_id, uuid: result.text, type: 'text', text: 'groupchanged'};
            Meteor.call('join-group',result.text,group_id,result.text,"in",function(err,result){
              console.log('meteor call result:',result)
              PUB.toast('您的设备已经切换到：'+group_name)
              //sendMqttMessage('/msg/d/'+result.text, msgBody);
            });
            //$.post("http://workaihost.tiegushi.com/restapi/workai-join-group", {uuid: result.text, group_id: group_id, name: result.text, in_out: "in"}, function(data) {
            //  var msgBody = {_id: new Mongo.ObjectID()._str, uuid: result.text, type: 'text', text: 'groupchanged'};
            //  sendMqttMessage('/msg/d/'+result.text, msgBody);
            //});
            //toastr('已添加设备：'+result.text)
            window.SELECT_CREATE_GROUP.close()
            Router.go('/');

          });
      } else if (result.cancelled) {
        //Router.go(gotoPage);
        return;
      } else if (result.alumTapped) {
        //DecodeImageFromAlum();
        return;
      }
    },
    function(error) {
      alert("Scanning failed: " + error);
    }, {
      preferFrontCamera: false, // iOS and Android
      showFlipCameraButton: true, // iOS and Android
      showTorchButton: true, // iOS and Android
      torchOn: false, // Android, launch with the torch switched on (if available)
      prompt: "Place a barcode inside the scan area", // Android
      resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
      formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
      orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
      //disableAnimations: true, // iOS
      //disableSuccessBeep: false // iOS
    }
  );
}
