var accessid= 'Vh0snNA4Orv3emBj';
var accesskey= 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz';
var host = 'http://data.tiegushi.com';

var g_dirname = ''
var g_object_name = ''
var g_object_name_type = ''
var now = timestamp = Date.parse(new Date()) / 1000; 

var policyText = {
    "expiration": "2020-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    "conditions": [
    ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
    ]
};

function check_object_radio() {
    g_object_name_type = 'random_name';
}

function get_dirname()
{
    g_dirname = '';
}

function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}

function calculate_object_name(filename)
{
    if (g_object_name_type == 'local_name')
    {
        g_object_name += "${filename}"
    }
    else if (g_object_name_type == 'random_name')
    {
        suffix = get_suffix(filename)
        g_object_name = g_dirname + random_string(10) + suffix
    }
    return ''
}

function get_uploaded_object_name(filename)
{
    if (g_object_name_type == 'local_name')
    {
        tmp_name = g_object_name
        tmp_name = tmp_name.replace("${filename}", filename);
        return tmp_name
    }
    else if(g_object_name_type == 'random_name')
    {
        return g_object_name
    }
}

function set_upload_param(up, filename, ret)
{
    var policyBase64 = Base64.encode(JSON.stringify(policyText))
    var message = policyBase64
    var bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, { asBytes: true }) ;
    var signature = Crypto.util.bytesToBase64(bytes);

    g_object_name = g_dirname;
    if (filename != '') {
        suffix = get_suffix(filename)
        calculate_object_name(filename)
    }
    new_multipart_params = {
        'key' : g_object_name,
        'policy': Base64.encode(JSON.stringify(policyText)),
        'OSSAccessKeyId': accessid, 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'signature': signature,
    };

    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });

    up.start();
}

SimpleChat.createPlupload = function(id){
  var uploader = new plupload.Uploader({
    runtimes : 'html5,flash,silverlight,html4',
    browse_button : id, 
      //multi_selection: false,
    container: document.getElementById('container'),
    flash_swf_url : '/packages/feiwu_simple-chat/client/lib/plupload-2.1.2/js/Moxie.swf',
    silverlight_xap_url : '/packages/feiwu_simple-chat/client/lib/plupload-2.1.2/js/Moxie.xap',
      url : 'http://oss.aliyuncs.com',
      resize: {
          width : 800, 
          height : 600, 
          quality : 80,
          // crop: true // crop to exact dimensions
      },
  //   file_data_name: 'file',
  //   filters: {
  //     mime_types: [
  //       {title : "Image files", extensions : "png,jpeg,jpg,gif"}
  //     ]
  //   },
    //auto_start: true,

    init: {
      PostInit: function() {
        // document.getElementById('ossfile').innerHTML = '';
        // document.getElementById('postfiles').onclick = function() {
        //       set_upload_param(uploader, '', false);
        //       return false;
        // };
      },

      FilesAdded: function(up, files) {
              window.___message.insert(files[0].id);
              set_upload_param(uploader, '', false);
        // plupload.each(files, function(file) {
        // 	document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
        // 	+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
        // 	+'</div>';
        // });
      },

      BeforeUpload: function(up, file) {
              check_object_radio();
              get_dirname();
              set_upload_param(up, file.name, true);
          },

      UploadProgress: function(up, file) {
        // var d = document.getElementById(file.id);
        // d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
        //       var prog = d.getElementsByTagName('div')[0];
        // var progBar = prog.getElementsByTagName('div')[0]
        // progBar.style.width= 2*file.percent+'px';
        // progBar.setAttribute('aria-valuenow', file.percent);
              console.log('uploading...');
      },

      FileUploaded: function(up, file, info) {
              if (info.status == 200)
              {
                  // document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'upload to oss success, object name:' + get_uploaded_object_name(file.name);
                  console.log('uploaded', get_uploaded_object_name(file.name));
                  window.___message.update(file.id, host + '/' + get_uploaded_object_name(file.name));
              }
              else
              {
                  // document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
                  console.log('uploaded', info.response);
                  window.___message.remove(file.id);
              } 
      },

      Error: function(up, err) {
        // document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
              console.log("\nError xml:" + err.response);
      }
    }
  });
  return uploader;
};

// uploader.init();
// console.log('upload.js loaded');