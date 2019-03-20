# WorkAi Api
---------

### 单张标注
```
POST /api/v1/groups/:groupId/faces
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  uuid       |  string   | yes       | 设备id             |
|  img_url    |  string   | yes       | 人脸url            |
|  name    |  string   | yes       | 标注人名            |
|  position   |  null     | no       | 设备位置            |
|  type       | string    | no       | 图片类型 默认：face           |
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
  "img_url":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f",
  “name”:       "TESTNAME",
  "type":       "face",
  "current_ts": 1522276593387.0,
  "accuracy":   1,
  "fuzziness":  443,
  "sqlid":      0,
  "style":      "front",
  "img_ts":     "1522276708297.0"
}

curl -X POST "@data.json" http://workaicdn.tiegushi.com/api/v1/xxxxxx/faces
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
      "img_url":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f", // 图片1
      “name”:       "TESTNAME1",  // 图片1要标注的名字
      ... // 其他参数和单张标注格式相同
    },
    {
      "uuid":       "28D6R16C12005885",
      "img_url":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c9591", // 图片2
      “name”:       "TESTNAME2", // 图片2要标注的名字
      ...
    }
    ...
  ] 
}

curl -X POST "@data.json" http://workaicdn.tiegushi.com/api/v1/xxxxxx/faces/batch
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
curl -X GET http://workaicdn.tiegushi.com/api/v1/persons?groupId=xxxxx&name=xxx
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
curl -X POST  http://workaicdn.tiegushi.com/api/v1//persons/xxxx -d '{"name":"test2"}'
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
curl -X DELETE http://workaicdn.tiegushi.com/api/v1/persons/xxxx
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
curl -X GET http://workaicdn.tiegushi.com/api/v1/devices?groupId=xxxxx
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
DELETE /api/v1/devices/:id
```

```
curl -X DELETE http://workaicdn.tiegushi.com/api/v1/devices/xxxx
```
Example respones:
```
{
  "success": true
}
```



