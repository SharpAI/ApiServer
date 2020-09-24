# 数据结构
1. 存储上传的图片信息
```javascript
DVA_QueueLists = {
  imgUrl:'',

  userId: '',
  userName: '',
  userIcon: '',

  createdAt: new Date(),

  status: '', // pendding, progress,failed, done,
  // 查询结果
  resultCounts: 0,
  videoCounts: 0,
  results: [{
    video_id: '',
    video_name: '',
    video_url:'',
    video_poster:'',
    video_info: {},
    images:[{
      url: '',
      time: '',
      frame:''
    }]
  }]
}
```


2. 存储用户绑定的设备列表

```javascript
DVA_Devices = {
  userId:'',
  userName: '',
  userIcon: '',
  domain: 'local.',
  type: '_http._tcp.',
  name: 'Becvert\'s iPad',
  port: 80,
  hostname: 'ipad-of-becvert.local',
  ipv4Addresses: [ '192.168.1.125' ], 
  ipv6Addresses: [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
  txtRecord: {
    foo: 'bar'
  }
}
```

3. 存储等待导入的 web 视频
```javascript
DVA_WaitImportVideo = {
  _id: '',
  userId: '',
  url: '',
  type: '',
  createdAt: new Date()
}
```

4. 存储 DVA 设备上的视频列表
```javascript
DVA_Videos = {
  device_mac: '',
  uuid: '', // 对应设备唯一识别码

  videoId: '',
  name: '',
  poster: '', // 视频封面
  width: 800,
  height: 480, 
  framesCount: 100
}

```