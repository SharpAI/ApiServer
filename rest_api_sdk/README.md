
## This doc includes all APIs on sharpAI app server
## http://workaicdn.tiegushi.com/ is our app server addr
## Run js script according to following params

## Install package

npm install


### Get a person's name by faceID

```node get_name_by_faceid.js```

query params

- group_id #id for your group
- face_id  #id for the face

return
```
err: null
res: {"result":"success","name":"leon"}
body: {"result":"success","name":"leon"}
```



### Upload Face image

```node workai_faces.js```

post
```
{
  "id":"28D6R16C1200588515222765925380176",#face id
  "uuid":"28D6R16C12005885",#device id
  "group_id": "a4fbc3b9cb484bba568047a6",#group id
  "img_url": "http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f",#url of face image
  "position": null,#device position
  "type": "face",#img type
  "current_ts": 1522276593387.0,#current time
  "accuracy": false,#accuracy of this face
  "fuzziness": 443,#fuzziness for image
  "sqlid": 0,#id on local db
  "style": "front",#face style(front face:'front',left side:'left_side',right side:'right_side')
  "img_ts": "1522276708297.0",#shooting time
  "p_ids": "28D6R16C1200588515222767051010314"#img id for the same person at the same time 
}
```

return
```
err: null
res: { result: 'ok' }
body: { result: 'ok' }
```

### Get device info

```node list_device.js```

请求参数
- uuid #device id

return
```
err: null
res: Device[28DDU17602003551] in Devices deleted 
[object Object]
body: Device[28DDU17602003551] in Devices deleted 
[object Object]
```

### Delete device

```node clean_device.js```

query param
- uuid #device id

return after success
```
err: null
res: Device[2fcccc9f] in Devices deleted 
Device[2fcccc9f] in Meteor.users deleted 

body: Device[2fcccc9f] in Devices deleted 
Device[2fcccc9f] in Meteor.users deleted 
```

return if there's no device
```
err: null
res: nothing to delete
body: nothing to delete
```

### Upload stranger info

```node workai_unknown.js```

query parmas
```
person_id:'',#person id, label it to particular id if not null
persons:[{
  'id':'28D6R16C1200588515222765925380176',#img id
  'uuid':'28D6R16C12005885',#device id
  'group_id': 'a4fbc3b9cb484bba568047a6',#group id
  'img_url': 'http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f',#img url
  'position': null,#img position
  'type': 'face',#img type
  'current_ts': 1522276593387.0,#current time
  'accuracy': false,#accuracy for this face
  'fuzziness': 443,#fuzziness
  'sqlid': 0,#id on local db
  'style': 'front',#face style
  'img_ts': '1522276708297.0',#shooting time
  'p_ids': '28D6R16C1200588515222767051010314'#img id for other faces at the same time 
}]
```

return
```
err: null
res: { result: 'ok' }
body: { result: 'ok' }
```

### FaceRecognition info

```node workai.js```

query params
```
'id':'7YRBBDB72200271715027668215821893',#face id
'uuid':'28DDU17602003551',device id
'img_url': 'http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f',#img url
'type': 'face',#img type
'tid': '',#img id
'sqlid': 0,#id on local db
'current_ts': 1522276593387.0,#current time
'accuracy': '0.9',#accuracy of the face
'fuzziness': 100,#fuzziness of this img
'style': 'front',#face style
'img_ts': '1506588441021.0',#shooting time
'current_ts':'1506588441021',#当前时间
'p_ids': ''#img id for other faces at the same time 
```

return
```
err: null
res: { result: 'ok' }
body: { result: 'ok' }
```


