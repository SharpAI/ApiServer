# App Server API


## 目录

- [注册账号](#注册账号)
- [登陆](#登陆)
- [退出](#退出)
- [Person](#person)
  - [查询persons](#查询persons)
  - [获取person](#获取person)
  - [重命名person](#重命名person)
  - [删除person](#删除person)
  - [删除被标注person的照片](#删除被标注人的照片)
- [设备](#设备)
  - [查询设备](#查询设备)
  - [删除设备](#删除设备)
- [Group](#group)
  - [查询组](#查询组)
  - [创建组](#创建组)
  - [重命名组](#重命名组)
  - [删除组](#删除组)
  - [组的成员信息](#组的成员信息)
  - [组加人](#组加人)
  - [组加设备](#组加设备)
  - [单张标注](#单张标注)
  - [批量标注](#批量标注)
- [AI Messages](#ai-message)
  - [查询Messages](#查询messages)

---------
### 注册账号
```
POST /api/v1/sign-up
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  username       |  string   | yes       | 用户名             |
|  email       |  string   | yes       | 用户名             |
|  password    |  string   | yes       | 密码 len > 6         |

```
curl -X POST -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/sign-up -d '{"username": "test11", "email": "xxxx@xxx.xx", "password": "xxxxxx"}'
```
Example respones:

```
{
  "success": true
}
```


### 登陆

登陆后返回authToken和userId,供需要鉴权才能访问的api使用，authToken没有过期时间，可一直使用。如需销毁authToken,请调用[退出](#退出)API。

```
POST /api/v1/login
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  username       |  string   | yes       | 用户名             |
|  password    |  string   | yes       | 密码          |

```
curl -X POST http://testworkai.tiegushi.com/api/v1/login/ -d "username=test&password=password"
```
Example respones:

```
{
  "status": "success", // 登录成功
  "data":{
    "authToken": "qpmW0Vx4RFudmSqjGz0Idqj169pcHNqthQW--3LMtLi",
    "userId": "rzMssYa8LAN7iuMe"
  }
}
```
### 退出
退出将销毁authToken，如需要authToken可重新[登陆](#登陆)。

```
POST /api/v1/logout
```
```
// X-Auth-Token & X-User-Id 可从login api 获取
curl -X POST -H "X-Auth-Token: qpmW0Vx4RFudmSqjGz0Idqj169pcHNqthQW--3LMtLi" -H "X-User-Id: rzMssYa8LAN7iuMe" http://testworkai.tiegushi.com/api/v1/logout
```
Example respones:

```
{
  "status": "success",  // 登出成功
  "data": {
    "message": "You've been logged out!"
  }
}
```


### Person
### 查询persons
```
GET /api/v1/persons
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupId    |  string   | yes    | 组ID            |
|  name    |  string   | yes       | 人名            |
|  faceId    |  string   | no       | face id            |

```
curl -X GET http://testworkai.tiegushi.com/api/v1/persons?groupId=xxxxx&name=xxx
```
Example respones:
```
[
  {
    "_id": "02db41813a9513816357444b", 
    "group_id": "xxx", // 组id
    "faceId": "xxxxxxxxxx", // 人脸id
    "url": "http://workaiossqn.tiegushi.com/8a89f902-32d8-11e8-8756-a4caa09c959f", // 人脸的url
    "name": "APITEST1",  // 标记的人名
    "label_times": 2, // 标记次数
    "createAt": "2019-03-20T08:33:07.899Z",  // 创建时间
    "updateAt": "2019-03-20T08:33:11.835Z"  // 更新时间
  }
]
```

### 获取person
```
GET api/v1/persons/:id
```
```
curl -X GET http://testworkai.tiegushi.com/api/v1/persons/4d18827a8e888af5e2631821
```
Example respones:
```
{
  "_id": "4d18827a8e888af5e2631821",
  "group_id": "816291518ef7a551be6c9223",
  "faceId": "de357f6497bce902e48ec9be",
  "url": "http://cdn.workaioss.tiegushi.com/3032dc7e-6b23-11e9-a278-78c2c0981ed1",
  "name": "眼镜1"
}
```

### 重命名person
```
// 需鉴权
PATCH /api/v1/persons/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes       | 新标注人名  |

```
curl -X PATCH -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json"  http://testworkai.tiegushi.com/api/v1/persons/xxxx -d '{"name":"test2"}'
```
Example respones:
```
{
  "success": true
}
```

### 删除person
```
// 需鉴权
DELETE /api/v1/persons/:id
```

```
curl -X DELETE -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/persons/xxxx
```
Example respones:
```
{
  "success": true
}
```

### 删除被标注人的照片
```
// 需鉴权
PUT /api/v1/persons/:personId/faces/deletion
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  faces    |  Array(object)   | yes       | 要删除照片对象  { faces: [ {id: faceId, url: faceUrl}, ...] }  |

```
创建data.json文件
{
  "faces": [
    {
      "id":     "28D6R16C12005885",   // faceId
      "url":    "http://workaiossqn.tiegushi.co/d25a07c-32d9-11e8-8756-a4caa09c959f", // 图片1
 
    },
    {
      "id":       "28D6R16C12005885",
      "url":    "http://workaiossqn.tiegushi.co/d25a07c-32d9-11e8-8756-a4caa09c959f", // 图片1
    },
    ......
  ]
}

curl -X PUT "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/persons/xxxxxx/faces/deletion
```
Example respones:
```
{
  "success": true
}
```
### 设备
### 查询设备
```
GET /api/v1/devices
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupId    |  string   | yes    | 组ID            |

```
curl -X GET http://testworkai.tiegushi.com/api/v1/devices?groupId=xxxxx
```
Example respones:
```
[
  {
    "uuid": "xxxx", // 设备id
    "name": "xxxx", // 设备名称
    "in_out": "inout", // 设备进出类型
    "groupId": "xxxxxxx", // 组id
    "createAt": "2019-02-22T03:23:35.904Z",  // 创建时间
    "camera_run": false, // 摄像头在线状态
    "islatest": false, // 是否升级
    "online": true  // 设备在线状态
  }
]
```

### 删除设备
```
// 需鉴权
DELETE /api/v1/devices/:uuid
```

```
curl -X DELETE  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/devices/xxxx
```
Example respones:
```
{
  "success": true  // 设备成功删除
}
```
### Group
### 查询组
```
GET /api/v1/groups
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupName    |  string   | yes    | 组名            |
|  creator    |  string   | yes    | 创建者            |


```
curl -X GET http://testworkai.tiegushi.com/api/v1/groups?groupName=xxxxx&creator=xxxx
```
Example respones:
```
{
  "_id": "xxxxxxxxxx",
  "name": groupName, // 组名
  "icon": "",  
  "describe": "",
  "create_time": "2019-03-20T06:04:16.569Z",  // 创建时间
  "template": {},
  "offsetTimeZone": 8,
  "last_text": "",
  "last_time": "2019-03-20T06:04:16.569Z",
  "barcode": "http://testworkai.tiegushi.com/xxxxx",  // 组二维码
  "creator": {
    "id": "xxxxxxxx", // 创建者id
    "name": creator  // 创建者名字
  }
}
```

### 创建组
```
// 需鉴权
POST /api/v1/groups
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | 组名            |

```
// X-Auth-Token 和 X-User-Id 可通过/api/login 获取鉴权信息
curl -X POST -H "X-Auth-Token: GMh-1Dtg3909k5IOxJozqhjFQQPDkQ1FtKOtJ2stbq6" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups -d "name=xxx"
```
Example respones:
```
{
  "groupId": "8b129fc47a3fa97cbd6f7837"   // 组id
}
```

### 重命名组
```
// 需鉴权
PATCH /api/v1/groups/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | 组新名称          |
```
// X-Auth-Token 和 X-User-Id 可通过/api/login 获取鉴权信息

curl -X PATCH  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/8b129fc47a3fa97cbd6f7837 -d '{"name":"test2"}'
```

Example respones:
```
{
  "success": true
}
```

### 删除组
```
// 需鉴权
DELETE /api/v1/groups/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | 组新名称          |
```
// X-Auth-Token 和 X-User-Id 可通过/api/login 获取鉴权信息

curl -X DELETE  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/8b129fc47a3fa97cbd6f7837
```

Example respones:
```
{
  "success": true
}
```

### 组的成员信息
```
GET /api/v1/groups/:groupId/person
```
```
curl -X GET  http://testworkai.tiegushi.com/api/v1/groups/9933aa9c429695857e9d52dd/person 
```

Example respones:
```
[
  {
    "_id": "71f3fd7f055e5aa01bc29fcd",
    "group_id": "9933aa9c429695857e9d52dd", // 组id
    "faceId": "12967", // 人脸id
    "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04",// 人脸图片url
    "name": "A", // 被标记的人名
    "faces": [
      {
        "id": "12967", // 人脸图片id
        "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04" // 人脸图片url
      }
    ]
  },
  ...
]
```

### 组加人
```
// 需鉴权
POST /api/v1/groups/:groupId/users
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  userId    |  string   | yes    | userId          |
```
curl -X POST  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/8b129fc47a3fa97cbd6f7837/users -d "userId=ejxqmx3PDK8yo88F"
```

Example respones:
```
{
  "success": true
}
```

### 组加设备
```
// 需鉴权
POST /api/v1/groups/:groupId/devices
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  uuid    |  string   | yes    | 盒子uuid          |
|  deviceName    |  string   | yes    | 盒子名称          |
|  type    |  string   | yes    | 盒子type ("in" or "out")    |

```
// X-Auth-Token 和 X-User-Id 可通过/api/login 获取鉴权信息
curl -X POST -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/8b129fc47a3fa97cbd6f7837/devices -d '{"uuid": "123456", "deviceName": "test", "type": "in"}'
```
Example respones:
```
{
  "success": true 
}
```

### 单张标注
```
//需要鉴权
POST /api/v1/groups/:groupId/faces
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  uuid       |  string   | yes       | 设备id             |
|  imgUrl    |  string   | yes       | 人脸图片url(112*112)           |
|  name    |  string   | yes       | 标注人名 (和faceId 至少存在一个)           |
|  faceId    |  string   | yes       | 标注faceId  (和name 至少存在一个)           |
|  type       | string    | yes       | 图片类型 face/human_shape    |
|  position   |  null     | no       | 设备位置            |
|  current_ts |  integer    | no       | 当前时间 毫秒   |
|  accuracy   |  boolean  | no       | 图片精准度            |
|  fuzziness  | integer   | no       | 图片模糊度            |
|  sqlid      |  integer  | no       | 本地数据库id            |
|  style      | string    | no       | 人脸类型(前脸 front, 左脸 left_side, 右脸right_side) 默认：front           |
|  img_ts     | integer   | no       | 图片拍摄时间            |
|  tid      | string    | no       | 连续图片ID            |
|  p_ids      | string    | no       | 同时拍摄的同一人图片id            |
```
创建data.json文件
{
  "uuid":       "28D6R16C12005885",
  "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f",
  “name”:       "TESTNAME",
  "faceId":     "xxxx", //使用name或者faceId标注
  "type":       "face",
  "current_ts": 1522276593387.0,
  "accuracy":   1,
  "fuzziness":  443,
  "sqlid":      0,
  "style":      "front",
  "img_ts":     "1522276708297.0"
}

curl -X POST "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/xxxxxx/faces
```
Example respones:
```
{
  "success": true
}
```
### 批量标注
```
//需要鉴权
POST /api/v1/groups/:groupId/faces/batch
```
```
创建data.json文件
{
  "create": [
    {
      "uuid":       "28D6R16C12005885",
      "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f", // 图片1
      “name”:       "TESTNAME1",  // 图片1要标注的名字
      ... // 其他参数和单张标注格式相同
    },
    {
      "uuid":       "28D6R16C12005885",
      "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c9591", // 图片2
      “name”:       "TESTNAME2", // 图片2要标注的名字
      ...
    }
    ...
  ] 
}

curl -X POST "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://testworkai.tiegushi.com/api/v1/groups/xxxxxx/faces/batch
```
Example respones:
```
{
  "success": true
}
```
### Ai Message
### 查询Messages
```
GET /api/v1/ai-messages
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  personId    |  string   | yes    | personID            |
|  isRead    |  Boolean   | no       | 是否已读default: false  (true or false）            |

```
curl -X GET http://testworkai.tiegushi.com/api/v1/ai-messages?personId=xxxxx
```
Example respones:
```
[
  {
    "_id": "tSMCXWE5vEEAnAuns",
    "msg": "10点开会",
    "personId": "99ab5706859a9cce7070db9e",
    "groupId": "a5119193a661db15fc425f6c",
    "isRead": false,
    "createdAt": "2019-05-06T10:32:05.506Z"
  }
]
```




