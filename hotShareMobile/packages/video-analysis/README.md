# 数据结构
1. 存储上传的图片信息
```javascript
VideoQueueLists = {
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