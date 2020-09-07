
# App Server API


## Content

- [Register](#Register)
- [Login](#Login)
- [Exit](#Exit)
- [Person](#person)
  - [Query persons](#QueryPersons)
  - [Get person](#GetPerson)
  - [Rename person](#RenamePerson)
  - [Delete person](#DeletePerson)
  - [Delete Label of person pic](#Delete_Labelled_Person_Pic)
- [Device](#Device)
  - [Query Device](#Query_Device)
  - [Delete Device](#Delete_Device)
- [Group](#group)
  - [Query Group](#Query_Group)
  - [Create Group](#Create_Group)
  - [Rename Group](#Rename_Group)
  - [Delete Group](#Delete_Group)
  - [Get Group Members Info](#Get_Group_Members_Info)
  - [Add User](#Add_User)
  - [Add Device](#Add_Device)
  - [Label](#Label)
  - [Batch Label](#Batch_Label)
  - [Label Unknown](#Label_Unknown)
- [AI Messages](#ai-message)
  - [Query Messages](#Query_Messages)

---------
### Register
```
POST /api/v1/sign-up
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  username       |  string   | yes       | username             |
|  email       |  string   | yes       | Email address       |
|  password    |  string   | yes       | passowrd length > 6         |

```
curl -X POST -H "Content-type: application/json" http://server_address/api/v1/sign-up -d '{"username": "test11", "email": "xxxx@xxx.xx", "password": "xxxxxx"}'
```
Example respones:

```
{
  "success": true
}
```


### Login

1. Login with username/password then get token
2. Use token with API
3. When finish API calls, use [Quit](#Quit) to delete authToken for security. No expire setup for authToken.


```
POST /api/v1/login
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  username       |  string   | yes       | username             |
|  password    |  string   | yes       | password          |

```
curl -X POST http://server_address/api/v1/login/ -d "username=test&password=password"
```
Example respones:

```
{
  "status": "success", // Login success
  "data":{
    "authToken": "qpmW0Vx4RFudmSqjGz0Idqj169pcHNqthQW--3LMtLi",
    "userId": "rzMssYa8LAN7iuMe"
  }
}
```
### Exit
Use Exit to delete authToken on server side. If need authToken again, please call [Login](#Login)。

```
POST /api/v1/logout
```
```
// X-Auth-Token & X-User-Id  gets from login api
curl -X POST -H "X-Auth-Token: qpmW0Vx4RFudmSqjGz0Idqj169pcHNqthQW--3LMtLi" -H "X-User-Id: rzMssYa8LAN7iuMe" http://server_address/api/v1/logout
```
Example respones:

```
{
  "status": "success",  // logout success
  "data": {
    "message": "You've been logged out!"
  }
}
```


### Person
### QueryPersons
```
GET /api/v1/persons
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupId    |  string   | yes    | Group ID            |
|  name    |  string   | yes       | person name            |
|  faceId    |  string   | no       | face id            |

```
curl -X GET http://server_address/api/v1/persons?groupId=xxxxx&name=xxx
```
Example respones:
```
[
  {
    "_id": "02db41813a9513816357444b",
    "group_id": "xxx", // Group id
    "faceId": "xxxxxxxxxx", // Face id
    "url": "http://workaiossqn.tiegushi.com/8a89f902-32d8-11e8-8756-a4caa09c959f", // face image url
    "name": "APITEST1",  // Labelled person name
    "label_times": 2, // Labelled times
    "createAt": "2019-03-20T08:33:07.899Z",  // Create duration
    "updateAt": "2019-03-20T08:33:11.835Z"  // Update duration
  }
]
```

### GetPerson
```
GET api/v1/persons/:id
```
```
curl -X GET http://server_address/api/v1/persons/4d18827a8e888af5e2631821
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

### RenamePerson
```
// Need authToken
PATCH /api/v1/persons/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes       | Label a new person  |

```
curl -X PATCH -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json"  http://server_address/api/v1/persons/xxxx -d '{"name":"test2"}'
```
Example respones:
```
{
  "success": true
}
```

### DeletePerson
```
// Need Token
DELETE /api/v1/persons/:id
```

```
curl -X DELETE -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/persons/xxxx
```
Example respones:
```
{
  "success": true
}
```

### Delete_Labelled_Person_Pic
```
// Need Token
PUT /api/v1/persons/:personId/faces/deletion
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  faces    |  Array(object)   | yes       | person picture to be deleted  { faces: [ {id: faceId, url: faceUrl}, ...] }  |

```
create data.json file
{
  "faces": [
    {
      "id":     "28D6R16C12005885",   // faceId
      "url":    "http://workaiossqn.tiegushi.co/d25a07c-32d9-11e8-8756-a4caa09c959f", // pic_1

    },
    {
      "id":       "28D6R16C12005885",
      "url":    "http://workaiossqn.tiegushi.co/d25a07c-32d9-11e8-8756-a4caa09c959f", // pic_2
    },
    ......
  ]
}

curl -X PUT "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/persons/xxxxxx/faces/deletion
```
Example respones:
```
{
  "success": true
}
```
### Device
### QueryDevice
```
GET /api/v1/devices
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupId    |  string   | yes    | Group ID            |

```
curl -X GET http://server_address/api/v1/devices?groupId=xxxxx
```
Example respones:
```
[
  {
    "uuid": "xxxx", // device uuid
    "name": "xxxx", // device display name
    "in_out": "inout", // the type of device (in/out/inout)
    "groupId": "xxxxxxx", // group id
    "createAt": "2019-02-22T03:23:35.904Z",  // create duration
    "camera_run": false, // camera online status
    "islatest": false, // if up to date
    "online": true  // online status of device
  }
]
```

### Delete_Device
```
// Need token
DELETE /api/v1/devices/:uuid
```

```
curl -X DELETE  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/devices/xxxx
```
Example respones:
```
{
  "success": true  // success
}
```
### Group
### Query_Group
```
GET /api/v1/groups
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  groupName    |  string   | yes    | group name            |
|  creator    |  string   | yes    | creator of group     |


```
curl -X GET http://server_address/api/v1/groups?groupName=xxxxx&creator=xxxx
```
Example respones:
```
{
  "_id": "xxxxxxxxxx",
  "name": groupName, // group name
  "icon": "",  
  "describe": "",
  "create_time": "2019-03-20T06:04:16.569Z",  // create duration
  "template": {},
  "offsetTimeZone": 8,
  "last_text": "",
  "last_time": "2019-03-20T06:04:16.569Z",
  "barcode": "http://server_address/xxxxx",  // group QR code
  "creator": {
    "id": "xxxxxxxx", // creator id
    "name": creator  // name of creator
  }
}
```

### Create_Group
```
// need authToken
POST /api/v1/groups
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | group name            |

```
curl -X POST -H "X-Auth-Token: GMh-1Dtg3909k5IOxJozqhjFQQPDkQ1FtKOtJ2stbq6" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups -d "name=xxx"
```
Example respones:
```
{
  "groupId": "8b129fc47a3fa97cbd6f7837"   // group id
}
```

### Rename_Group
```
// need token
PATCH /api/v1/groups/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | group name          |
```

curl -X PATCH  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/8b129fc47a3fa97cbd6f7837 -d '{"name":"test2"}'
```

Example respones:
```
{
  "success": true
}
```

### Delete_Group
```
// Need authToken
DELETE /api/v1/groups/:id
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | group name         |
```

curl -X DELETE  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/8b129fc47a3fa97cbd6f7837
```

Example respones:
```
{
  "success": true
}
```

### Get_Group_Members_Info
```
GET /api/v1/groups/:groupId/person
```
```
curl -X GET  http://server_address/api/v1/groups/9933aa9c429695857e9d52dd/person
```

Example respones:
```
[
  {
    "_id": "71f3fd7f055e5aa01bc29fcd",
    "group_id": "9933aa9c429695857e9d52dd", // group id
    "faceId": "12967", // face id
    "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04",// face image url
    "name": "A", // labelled person name
    "faces": [
      {
        "id": "12967", // face image id
        "url": "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04" // face image url
      }
    ]
  },
  ...
]
```

### Add_User
```
// Need authToken
POST /api/v1/groups/:groupId/users
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  userId    |  string   | yes    | userId          |
```
curl -X POST  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/8b129fc47a3fa97cbd6f7837/users -d "userId=ejxqmx3PDK8yo88F"
```

Example respones:
```
{
  "success": true
}
```

### Add_Device
```
// Need authToken
POST /api/v1/groups/:groupId/devices
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  uuid    |  string   | yes    | device uuid          |
|  deviceName    |  string   | yes    | device display name          |
|  type    |  string   | yes    | device type ("in" or "out" or "inout" )    |

```
curl -X POST -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/8b129fc47a3fa97cbd6f7837/devices -d '{"uuid": "123456", "deviceName": "test", "type": "in"}'
```
Example respones:
```
{
  "success": true
}
```

### Label
```
//需要鉴权
POST /api/v1/groups/:groupId/faces
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  uuid       |  string   | yes       | device id             |
|  imgUrl    |  string   | yes       | image url(112*112)           |
|  name    |  string   | yes       | labelled name of person ( at least one with faceId)           |
|  faceId    |  string   | yes       | labelled to faceId  (at leaset one with name)           |
|  type       | string    | yes       | type of image face/human_shape    |
|  position   |  null     | no       | position of device     |
|  current_ts |  integer    | no       | current time ms   |
|  accuracy   |  boolean  | no       | picture accuracy            |
|  fuzziness  | integer   | no       | picture fuzziness       |
|  sqlid      |  integer  | no       | local sql id            |
|  style      | string    | no       | face labelling type( front, left_side, right_side) default：front           |
|  img_ts     | integer   | no       | duration of image created            |
|  tid      | string    | no       | id of sequence picture      |
|  p_ids      | string    | no       | id of person detected at the same time             |
```
create data.json file
{
  "uuid":       "28D6R16C12005885",
  "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f",
  “name”:       "TESTNAME",
  "faceId":     "xxxx", //use name or faceId for labelling
  "type":       "face",
  "current_ts": 1522276593387.0,
  "accuracy":   1,
  "fuzziness":  443,
  "sqlid":      0,
  "style":      "front",
  "img_ts":     "1522276708297.0"
}

curl -X POST "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/xxxxxx/faces
```
Example respones:
```
{
  "success": true
}
```
### Batch_Label
```
//Need authToken
POST /api/v1/groups/:groupId/faces/batch
```
```
create data.json file
{
  "create": [
    {
      "uuid":       "28D6R16C12005885",
      "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c959f", // picture 1
      “name”:       "TESTNAME1",  // labelled name of picture 1 
      ... // same as Label API
    },
    {
      "uuid":       "28D6R16C12005885",
      "imgUrl":    "http://workaiossqn.tiegushi.co  d25a07c-32d9-11e8-8756-a4caa09c9591", // picture 2
      “name”:       "TESTNAME2", // labelled name of picture 2 
      ...
    }
    ...
  ]
}

curl -X POST "@data.json"  -H "X-Auth-Token: P-ybnuSg6pHZJt_kx_nUdy5kEQYww2h3rursj13LkxX" -H "X-User-Id: YxbWum7KPTds8Lmi5" -H "Content-type: application/json" http://server_address/api/v1/groups/xxxxxx/faces/batch
```
Example respones:
```
{
  "success": true
}
```
### Label_Unknown
Label unknown person detected
```
POST groups/:groupId/strangers/:strangerId/label
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  name    |  string   | yes    | name to be labelled            |

```
curl -X POST -H "Content-type: application/json" http://server_address/api/v1/groups/xxxxx/strangers/xxxxx/label  -d '{"name": "test"}'
```

Example respones:
```
{
  "success": true
}
```

### Ai Message
### Query_Messages
```
GET /api/v1/ai-messages
```
| Attribute  | Type | Required | Description |
|:------------|:------|:----------|:-------------|
|  personId    |  string   | yes    | personID            |
|  isRead    |  Boolean   | no       | if read, default: false  (true or false）            |

```
curl -X GET http://server_address/api/v1/ai-messages?personId=xxxxx
```
Example respones:
```
[
  {
    "_id": "tSMCXWE5vEEAnAuns",
    "msg": "Let's hold a meeting at 10:00am",
    "personId": "99ab5706859a9cce7070db9e",
    "groupId": "a5119193a661db15fc425f6c",
    "isRead": false,
    "createdAt": "2019-05-06T10:32:05.506Z"
  }
]
```

