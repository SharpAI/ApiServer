# App Server API
---------

### Auth login

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
  "status": "success",
  "data":{
    "authToken": "qpmW0Vx4RFudmSqjGz0Idqj169pcHNqthQW--3LMtLi",
    "userId": "rzMssYa8LAN7iuMe"
  }
}
```
### Auth logout

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
  "status": "success",
  "data": {
    "message": "You've been logged out!"
  }
}
```


### 单张标注
```
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
  // "faceId":     "xxxx", 使用name或者faceId标注
  "type":       "face",
  "current_ts": 1522276593387.0,
  "accuracy":   1,
  "fuzziness":  443,
  "sqlid":      0,
  "style":      "front",
  "img_ts":     "1522276708297.0"
}

curl -X POST "@data.json" http://testworkai.tiegushi.com/api/v1/groups/xxxxxx/faces
```
Example respones:
```
{
  "success": true
}
```
### 多张批量标注
```
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

curl -X POST "@data.json" http://testworkai.tiegushi.com/api/v1/groups/xxxxxx/faces/batch
```
Example respones:
```
{
  "success": true
}
```

### 查询person
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
    "group_id": "xxx",
    "faceId": "xxxxxxxxxx",
    "url": "http://workaiossqn.tiegushi.com/8a89f902-32d8-11e8-8756-a4caa09c959f",
    "name": "APITEST1",
    "label_times": 2,
    "createAt": "2019-03-20T08:33:07.899Z",
    "updateAt": "2019-03-20T08:33:11.835Z"
  }
]
```

### person重命名
```
POST /api/v1/persons/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes       | 新标注人名  |

```
curl -X POST  http://testworkai.tiegushi.com/api/v1//persons/xxxx -d '{"name":"test2"}'
```
Example respones:
```
{
  "success": true
}
```

### 删除person
```
DELETE /api/v1/persons/:id
```

```
curl -X DELETE http://testworkai.tiegushi.com/api/v1/persons/xxxx
```
Example respones:
```
{
  "success": true
}
```

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
    "uuid": "xxxx",
    "name": "xxxx",
    "in_out": "inout",
    "groupId": "xxxxxxx",
    "createAt": "2019-02-22T03:23:35.904Z",
    "camera_run": false,
    "islatest": false,
    "online": true
  }
]
```

### 删除设备
```
DELETE /api/v1/devices/:uuid
```

```
curl -X DELETE http://testworkai.tiegushi.com/api/v1/devices/xxxx
```
Example respones:
```
{
  "success": true
}
```

### 查询组信息
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
  "name": groupName,
  "icon": "",
  "describe": "",
  "create_time": "2019-03-20T06:04:16.569Z",
  "template": {},
  "offsetTimeZone": 8,
  "last_text": "",
  "last_time": "2019-03-20T06:04:16.569Z",
  "barcode": "http://testworkai.tiegushi.com/xxxxx",
  "creator": {
    "id": "xxxxxxxx",
    "name": creator
  }
}
```

### 创建组(需要鉴权)
```
POST /api/groups
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | 组名            |

```
// X-Auth-Token 和 X-User-Id 可通过/api/login 获取鉴权信息
curl -X POST -H "X-Auth-Token: GMh-1Dtg3909k5IOxJozqhjFQQPDkQ1FtKOtJ2stbq6" -H "X-User-Id: YxbWum7KPTds8Lmi5" http://testworkai.tiegushi.com/api/v1/groups -d "name=test groupName"
```
Example respones:
```
{
  "groupId": "8b129fc47a3fa97cbd6f7837"
}
```

### 加入组
```
POST /api/groups/:groupId/users
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  userId    |  string   | yes    | userId          |
```
curl -X POST  http://testworkai.tiegushi.com/api/v1/groups/8b129fc47a3fa97cbd6f7837/users -d "userId=ejxqmx3PDK8yo88F"
```

Example respones:
```
{
  "success": true
}
```

### 显示组内被标注的成员信息
```
GET /api/groups/:groupId/person
```
```
curl -X GET  http://testworkai.tiegushi.com/api/v1/groups/9933aa9c429695857e9d52dd/person 
```

Example respones:
```
[
  {
    "_id": "71f3fd7f055e5aa01bc29fcd",
    "group_id": "9933aa9c429695857e9d52dd",
    "faceId": "12967",
    "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04",
    "name": "A",
    "faces": [
      {
        "id": "12967",
        "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04"
      }
    ]
  },
  ...
]
```

### 添加盒子(需鉴权)
```
POST /groups/:groupId/devices
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




