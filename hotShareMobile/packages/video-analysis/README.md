# 数据结构
1. 存储上传的图片信息
```javascript
VideoQueueLists = {
  images: [{
    url: '',
    id: ''
  }],

  user_id: '',
  user_name: '',
  user_icon: '',

  createdAt: new Date(),

  status: '', // pendding, progress, done,
  // 查询结果
  results: {
    video-id: {
      video_id: '',
      video_name: '',
      video_info: {},
      images:[{
        url: '',
        time: '',
        frame:''
      }]
    }
  }
}

```