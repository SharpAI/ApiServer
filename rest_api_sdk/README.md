
# Install package

npm install


## 调试获取用户名API

node get_name_by_faceid.js

请求参数
group_id 组id
face_id 人脸识别id

返回
err: null
res: {"result":"success","name":"leon"}
body: {"result":"success","name":"leon"}


## 调试人脸头像数据API

node workai_faces.js

post参数
{
  "id":"28D6R16C1200588515222765925380176",#识别id
  "uuid":"28D6R16C12005885",#设备id
  "group_id": "a4fbc3b9cb484bba568047a6",#组id
  "img_url": "http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f",#人脸url
  "position": null,#设备位置
  "type": "face",#图片类型
  "current_ts": 1522276593387.0,#当前时间
  "accuracy": false,#图片精准度
  "fuzziness": 443,#图片模糊度
  "sqlid": 0,#本地数据库id
  "style": "front",#人脸类型(前脸 front,左脸 left_side,右脸right_side)
  "img_ts": "1522276708297.0",#图片拍摄时间
  "p_ids": "28D6R16C1200588515222767051010314"#同时拍摄的同一人图片id
}

返回
err: null
res: { result: 'ok' }
body: { result: 'ok' }



## 获取设备信息API

node list_device.js

请求参数
uuid 设备id

返回
err: null
res: Device[28DDU17602003551] in Devices deleted 
[object Object]
body: Device[28DDU17602003551] in Devices deleted 
[object Object]


## 删除设备API

node clean_device.js

请求参数
uuid 设备id

删除成功返回
err: null
res: Device[2fcccc9f] in Devices deleted 
Device[2fcccc9f] in Meteor.users deleted 

body: Device[2fcccc9f] in Devices deleted 
Device[2fcccc9f] in Meteor.users deleted 

无设备返回
err: null
res: nothing to delete
body: nothing to delete


## 陌生人信息API

node workai_unknown.js

请求参数
person_id:'',#人员id,当人员id不为空时,将图片标记给指定id
persons:[{
  'id':'28D6R16C1200588515222765925380176',#识别图片id
  'uuid':'28D6R16C12005885',#设备id
  'group_id': 'a4fbc3b9cb484bba568047a6',#组id
  'img_url': 'http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f',#图片url
  'position': null,#图片位置
  'type': 'face',#图片类型
  'current_ts': 1522276593387.0,#当前时间
  'accuracy': false,#准确度
  'fuzziness': 443,#模糊度
  'sqlid': 0,#本地数据库id
  'style': 'front',#人脸类型
  'img_ts': '1522276708297.0',#识别时间
  'p_ids': '28D6R16C1200588515222767051010314'#同一时间拍摄的多张图片id
}]

返回
err: null
res: { result: 'ok' }
body: { result: 'ok' }


## workAI识别信息API

node workai.js

请求参数
'id':'7YRBBDB72200271715027668215821893',#人脸识别id
'uuid':'28DDU17602003551',设备id
'img_url': 'http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f',#图片url
'type': 'face',#图片类型
'tid': '',#连续图片id
'sqlid': 0,#本地数据库id
'current_ts': 1522276593387.0,#当前时间
'accuracy': '0.9',#准确度
'fuzziness': 100,#模糊度
'style': 'front',#人脸类型
'img_ts': '1506588441021.0',#识别时间
'current_ts':'1506588441021',#当前时间
'p_ids': ''#同一时间拍摄的多张图片

返回
err: null
res: { result: 'ok' }
body: { result: 'ok' }



