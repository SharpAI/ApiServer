# WorkAi Api
---------

### 获取用户名
```
GET /restapi/get_name_by_faceid
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
| group_id |  string | yes  | 组id |
| face_id  |  string | yes | 识别id |
```
curl -X GET http://workaicdn.tiegushi.com/restapi/get_name_by_faceid?group_id=a5119193a661db15fc425f6c&face_id=15341507191730000
```
Example respones:
```
{
  "result": "success",
  "name": "lena"
}
```

### 获取人脸头像数据
```
POST /restapi/workai/faces_json
```
| Attribute   | Type      | Required  | Description |
|-------------|-----------|---------- |-------------|
|  id         |  string   | yes       | 识别id            |
|  uuid       |  string   | yes       | 设备id             |
|  group_id   | string    | yes       | 组id           |
|  img_url    |  string   | yes       | 人脸url            |
|  position   |  null     | yes       | 设备位置            |
|  type       | string    | yes       | 图片类型            |
|  current_ts |  integer    | yes       | 当前时间    |
|  accuracy   |  boolean  | yes       | 图片精准度            |
|  fuzziness  | integer   | yes       | 图片模糊度            |
|  sqlid      |  integer  | yes       | 本地数据库id            |
|  style      | string    | yes       | 人脸类型(前脸 front, 左脸 left_side, 右脸right_side)            |
|  img_ts     | integer   | yes       | 图片拍摄时间            |
|  p_ids      | string    | yes       | 同时拍摄的同一人图片id            |


```
创建data.json文件
{
    "id":"28D6R16C1200588515222765925380176",
    "uuid":"28D6R16C12005885",
    "group_id": "a4fbc3b9cb484bba568047a6",
    "img_url": "http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f",
    "position": null,
    "type": "face",
    "current_ts": 1522276593387.0,
    "accuracy": false,
    "fuzziness": 443,
    "sqlid": 0,
    "style": "front",
    "img_ts": "1522276708297.0",
    "p_ids": "28D6R16C1200588515222767051010314"
  }


curl -X POST "@data.json" http://workaicdn.tiegushi.com/restapi/workai/faces_json
```
Example respones:
```
{
  "result": "ok"
}
```

### 获取设备信息
```
GET /restapi/list_device
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
|  uuid      |string |  yes    | 设备ID  |

```
curl -X GET http://workaicdn.tiegushi.com/restapi/list_device?uuid=28DDU17602003551
```
Example respones:
```
// 这个返回是什么意思？
Device[28DDU17602003551] in Devices deleted
[object Object][object Object]%
```

### 删除设备信息
```
GET restapi/clean_device 
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
|  uuid      |string |  yes    | 设备ID  |

```
curl -X GET http://workaicdn.tiegushi.com/restapi/clean_device?uuid=28DDU17602003551
```
Example respones:
```
// 返回值需要确认
```

### 标记陌生人信息
```
POST 
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
| person_id  | string  |  yes | 人员id, 当人员ID不为空时，将图片标记为指定ID  |
| token  | string  | yes | yes  |
| persons  | [object]  | yes  |   |

```
创建data.json文件
{
  "person_id": "",
  "token": "f623fb2eb072cdd9c2f7ff2ee2961af2c89c1869",
  "persons": [{
    "id": "28D6R16C1200588515222765925380176",
    "uuid": "28D6R16C12005885",
    "group_id": "a4fbc3b9cb484bba568047a6",
    "person_name": "new_person",
    "img_url": "http://workaiossqn.tiegushi.com1d25a07c-32d9-11e8-8756-a4caa09c959f",
    "position": null,
    "type": "face",
    "current_ts": 1522276593387.0,
    "accuracy": false,
    "fuzziness": 443,
    "sqlid": 0,
    "style": "front",
    "img_ts": "1522276708297.0",
    "p_ids": "28D6R16C1200588515222767051010314"
  }]
}

curl -X POST -H "Content-Type:application/json" -d "@data.json" http://workaicdn.tiegushi.com/restapi/workai_unknown_label
```
Example respones:
```
{
  "result": "ok"
}
```

### workAI识别信息
```
POST /restapi/workai
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
|  id         |  string   | yes       | 识别id            |
|  uuid       |  string   | yes       | 设备id             |
|  img_url    |  string   | yes       | 人脸url            |
|  position   |  null     | yes       | 设备位置            |
|  type       | string    | yes       | 图片类型            |
|  tid        | string    | yes       |             |
|  accuracy   |  boolean  | yes       | 图片精准度            |
|  sqlid      |  integer  | yes       | 本地数据库id            |
|  current_ts |  integer    | yes       | 当前时间    |
|  fuzziness  | integer   | yes       | 图片模糊度            |
|  style      | string    | yes       | 人脸类型(前脸 front, 左脸 left_side, 右脸right_side)            |
|  img_ts     | integer   | yes       | 图片拍摄时间            |
|  p_ids      | string    | yes       | 同时拍摄的同一人图片id            |

```
创建data.json文件
{
  "id": "7YRBBDB72200271715027668215821893",
  "uuid": "28DDU17602003551",
  "img_url": "http://workaiossqn.tiegushi.com/1d25a07c-32d9-11e8-8756-a4caa09c959f",
  "type": "face",
  "tid": "",
  "sqlid": 0,
  "current_ts": 1522276593387.0,
  "accuracy": "0.9",
  "fuzziness": 100,
  "style": "front",
  "img_ts": "1506588441021.0",
  "current_ts": "1506588441021",
  "p_ids": ""
}

curl -X POST -H "Content-Type:application/json" -d "@data.json" http://workaicdn.tiegushi.com/restapi/workai
```
Example respones:
```
{
  "result": "ok"
}
```

### TODO:
----
### 查询Face ID
```
GET 
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
|   |   |   |   |

```
curl
```
Example respones:
```

```

### 创建Face ID
```
GET 
```
| Attribute  | Type | Required | Description |
|------------|------|----------|-------------|
|   |   |   |   |

```
curl
```
Example respones:
```

```