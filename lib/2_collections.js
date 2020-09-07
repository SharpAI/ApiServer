// Mongo.setConnectionOptions({server: {reconnectTries:Infinity}});
Posts = new Meteor.Collection('posts');
RePosts = new Meteor.Collection('rePosts');
FollowPosts = new Meteor.Collection('followposts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection(null);
TempDrafts = new Meteor.Collection(null);
SavedDrafts = new Meteor.Collection('saveddrafts');
Follows = new Meteor.Collection('follows');
Follower = new Meteor.Collection('follower');
Topics = new Meteor.Collection('topics');
TopicPosts = new Meteor.Collection('topicposs');
Comment = new Meteor.Collection('comment');
Viewers = new Meteor.Collection('viewers');
RefComments = new Meteor.Collection("refcomments");
ReComment = new Meteor.Collection('recomment');
Reports = new Meteor.Collection('reports');
Meets = new Meteor.Collection('meets');
Versions = new Meteor.Collection('versions');
Moments = new Meteor.Collection('moments');
BlackList = new Meteor.Collection('blackList');
AssociatedUsers = new Meteor.Collection('associatedusers');
UserRelation = new Meteor.Collection('userrelation'); // 用户关系，为了不和以前的产生冲突，使用新表
PushMessages = new Meteor.Collection('pushmessages');
UserCheckoutEndLog = new Meteor.Collection('usercheckoutendlog');//用户下班的最后一条消息

Recommends = new Meteor.Collection('recommends');
Series = new Meteor.Collection('series');
SeriesFollow = new Meteor.Collection('seriesfollow');

LogonIPLogs = new Meteor.Collection('loginiplogs');

Configs = new Meteor.Collection('configs');

// 删除帖子
LockedUsers = new Meteor.Collection('lockedUsers');
BackUpPosts = new Meteor.Collection('backUpPosts');
reporterLogs = new Meteor.Collection('reporterLogs');

People = new Meteor.Collection('people');
PeopleHis = new Meteor.Collection('peopleHis');
Devices = new Meteor.Collection('devices');

Person = new Meteor.Collection('person');
PersonNames = new Meteor.Collection('personNames');
ClusterPerson = new Meteor.Collection('clusterPerson');
AiMessages = new Meteor.Collection('ai_messages');
/*Person = {
  id: <Integer>,
  uuid: <Integer>,
  faceId: <Integer>,
  url: <String>,
  name: <String>,
  faces: [{id: <Integer>, url: <String>}]
  deviceId: <String>,
  DeviceName: <String>,
  createAt: <Date>,
  updateAt: <Date>
}*/

// 记录所有人的活动信息
Activity = new Meteor.Collection('activity');

NLPTextClassName = new Meteor.Collection('nlpTextClassName');
/*
NLPTextClassName = {
  class_id: <Integer>,
  class_name: <String>,
  group_id:<Integer>,
  createAt: <Date>
}
 */

//来了吗用户和平板识别出的人的关系表
WorkAIUserRelations = new Meteor.Collection('workaiUserRelations');

/*
WorkAIUserRelations = {
 app_user_id:<Integer> //来了吗用户
 app_user_name:<String> //来了吗用户名
 ai_persons:[{id:}] //平板识别的人
 ai_in_time:<Date> //平板检测到这个人的进门时间
 ai_out_time:<Date> //平板检测到这个人的出门时间
 checkin_time:<Date> //app标记进门时间
 checkout_time:<Date> //app标记出门的时间
 in_uuid:<Integer>//进门UUID
 out_uuid:<Integer>//出门UUID
 group_id:<Integer>//组id
}
 */

// WorkStatus
WorkStatus = new Meteor.Collection('workStatus');
ClusterWorkStatus = new Meteor.Collection('clusterWorkStatus');
/*
{
    app_user_id:<Integer> //来了吗用户
    app_user_name:<String> //来了吗用户名
    group_id: <String>, // 组id
    date: <Integer>, // 20170810
    person_id: <String>, //
    person_name: <String>,
    status: <String>, // in || out
    in_status:<String>, // normal || warning || error || unknown
    out_status: <String>, // normal || warning || error || unknown
    whats_up: <String>
}
*/

DeviceTimeLine = new Meteor.Collection('device_timeline');
/*
{
  "hour":"",
  "uuid":"",
  "group_id":"",
  "perMin":{
    "01":[{
      "person_id":"",
      "person_name":"",// 允许为空
      "img_url":"",
      "app_user_id":"",// 关联过有，未关联没有
      "app_user_name":"",// 关联过有，未关联没有
      "sqlid": "sqlid",
      "style": "style",
      "ts":""
    }],
    "11":[{

    }]
  }
}
*/


LableDadaSet = new Meteor.Collection('label_dataset');
ClusterLableDadaSet = new Meteor.Collection('cluster_label_dataset');
/*
{
  "id":"",
  "name":"",
  "group_id":"",
  "url":'',
  "sqlId":"",
  "style": "left_side", 侧脸 || 正脸
  "createAt":'',
  "operator":[{
    user_name:操作的人的app名字
    user_id:app的userid，
    ts：操作时间
    action：具体的动作（标记，删除等）
    },
    ...
  ]
}
*/

Clustering = new Meteor.Collection('clustering');
/*
{
    group_id: 'xx',
    faceId: Id_xx,
    totalFaces: 1,
    url: 'http: //xx',
    rawfilepath: '/dataset/A/1.png',
    isOneSelf: true
}
*/


//不可用的邮箱账号
UnavailableEmails = new Meteor.Collection('unavailableEmails');
/*
{
  address:'xx',
  createAt:,
  reason:'xx',
}
 */
Strangers = new Meteor.Collection('strangers')

/*{
	"_id": "hnmnvA4pn4jdZXDSe",
	"imgs": [{
		"faceid": "15330142402500000",
		"url": "http://workaiossqn.tiegushi.com/fffc7fd4-9480-11e8-8abe-0242ac130006",
		"img_type": "face",
		"accuracy": 0,
		"fuzziness": 92.90688987914469,
		"sqlid": "0",
		"style": "front"
	}, {
		"faceid": "15330142402500000",
		"url": "http://workaiossqn.tiegushi.com/00744370-9481-11e8-8abe-0242ac130006",
		"img_type": "face",
		"accuracy": 0,
		"fuzziness": 212.15898400936524,
		"sqlid": "0",
		"style": "front"
	}],
	"img_gif": "http://cdn.workaioss.tiegushi.com/Lorex_1_1533014240250.gif",
	"group_id": "7e7013139ccafbbc369785d3",
	"camera_id": "Lorex_1",
	"uuid": "78c2c095d150",
	"trackerId": 1533014240250,
	"isStrange": true,
	"createTime": ISODate("2018-07-31T05:17:25.007Z"),
	"avatar": "http://workaiossqn.tiegushi.com/fffc7fd4-9480-11e8-8abe-0242ac130006"
}*/

  //   陌生人
NotificationFollowList = new Meteor.Collection('notification_follow_list');
/*
  _id : Meteor User ID
  followed_to_user_id : 1
  ...
*/
if (Meteor.isServer) {
  Meteor.methods({
      getStrangers: function(group_id){
          var stranges = Strangers.find({}).fetch()
          return stranges
      },
      removeStrangers: function(id) {
          Strangers.remove({_id: id})
      }
  })
}



Cameras = new Meteor.Collection('cameras');

Faces = new Meteor.Collection('faces');

ModelParam = new Meteor.Collection('modelParam');



if(Meteor.isServer){
  MsgAlertLimit = new Mongo.Collection("alertlimit_app_reco_msg")

  // only send recognition msg (for one person) once within 2mins.
  var expiresTime = 2*60
  MsgAlertLimit._ensureIndex({group_id: 1, uuid: 1, person_id: 1}, {expireAfterSeconds: expiresTime});
  MsgAlertLimit._ensureIndex({createdAt: 1}, {expireAfterSeconds: expiresTime});

  checkIfSendRecoMsg = function(groupd_id,uuid,person_id){
    if(MsgAlertLimit.findOne({group_id: groupd_id, uuid: uuid, person_id: person_id})){
      console.log(MsgAlertLimit.findOne({group_id: groupd_id, uuid: uuid, person_id:person_id}))
      return false;
    } else {
      MsgAlertLimit.insert({group_id: groupd_id, uuid: uuid, person_id:person_id, createdAt: new Date()})
      return true
    }
  }


  KnownUnknownAlertLimit = new Mongo.Collection("alertlimit_known_unknown");

  // 30分钟之内不要做重复的推送，什么是重复推送呢：
  // 1 相同的人，同一个组里
  // 2 陌生人，同一个组里
  // Don't allow TTL less than 30 minutes so we don't break synchronization
  var expiresAfterSeconds = 30*60;

  KnownUnknownAlertLimit._ensureIndex({group_id: 1, uuid: 1}, { expireAfterSeconds: expiresAfterSeconds });
  KnownUnknownAlertLimit._ensureIndex({createdAt: 1 }, { expireAfterSeconds: expiresAfterSeconds });

  checkIfSendKnownUnknownPushNotification = function(groupd_id,uuid){
    if(KnownUnknownAlertLimit.findOne({group_id: groupd_id, uuid: uuid})){
      console.log(KnownUnknownAlertLimit.findOne({group_id: groupd_id, uuid: uuid}))
      return false;
    } else {
      KnownUnknownAlertLimit.insert({group_id: groupd_id, uuid: uuid,createdAt: new Date()})
      return true
    }
  }

  Cameras.allow({
    insert: function(userId, doc){
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        return true;
    },
    remove: function(userId, doc){
        return true;
    }
  })

  Devices.allow({
      insert: function(userId, doc){
          return true;
      },
      update: function(userId,doc, fields, modifier) {
          //return userId == doc.userId;
          return true;
      },
      remove: function(userId, doc){
          return true;
      }
  });

  WorkAIUserRelations.allow({
    insert: function (userId, doc) {
        return userId == doc.app_user_id;
    },
    update: function(userId, doc, fields, modifier) {
      if(userId && modifier['$set'].hide_it !== undefined){
        return true;
      }
      if(userId && modifier['$set'].app_user_id == userId ) {
          return true;
      }
      return false;
    }
  });

  PeopleHis.allow({
    update: function (userId, doc, fields, modifier) {
      var user = Meteor.users.findOne({_id: userId})

      if(modifier['$set'].fix_name){
        PERSON.setName(doc.uuid, doc.id, doc.aliyun_url, modifier['$set'].fix_name);
        var people = People.find({id: doc.id, uuid: doc.uuid});
        if(people && people.name)
          People.update({name: people.name}, {$set: {name: modifier['$set'].fix_name, updateTime: new Date()}}, {multi: true});
        else
          People.update({id: doc.id, uuid: doc.uuid}, {$set: {name: modifier['$set'].fix_name, updateTime: new Date()}});
      }
      return true;
    }
  });

  Clustering.allow({
    update: function (userId, doc, fields, modifier) {
      var user = Meteor.users.findOne({_id: userId})
      if(user && user.profile && user.profile.userType && user.profile.userType == 'admin'){
          return true;
      }
      return false;
    }
  });
  NotificationFollowList.allow({
    update: function(userId, doc, fields, modifier){
      return userId === doc._id
    },
    insert: function(userId,doc){
      return userId === doc._id;
    }
  });
  Strangers.allow({
    remove: function(userId, doc) {
        return true;
    }
  });
  Meteor.publish('getPushFollow', function () {
      if(!this.userId){
          return this.ready();
      }

      return NotificationFollowList.find({_id: this.userId});
  })
  Meteor.publish('getStrangersByGroupId', function (group_id) {
      if(!this.userId){
          return this.ready();
      }

      var limit = 50;

      return Strangers.find({group_id: group_id}, {sort: {createTime: -1}, limit: limit});
  })

  Meteor.publish('getFaces', function (limit) {
      if(!this.userId){
          return this.ready();
      }

      var limit = limit || 10;
      var groupIds = [];
      SimpleChat.GroupUsers.find({user_id: this.userId}).forEach(function (item) {
          groupIds.push(item.group_id);
      });

      return [
          SimpleChat.GroupUsers.find({user_id: this.userId}),
          Faces.find({group_id: {$in: groupIds}},{sort: {createdAt: -1}, limit: limit})
      ];
  })

  // 发布：纠错
  Meteor.publish('clusteringLists', function(group_id, faceId, limit){
    if(!this.userId || !group_id || !faceId){
        return this.ready();
    }
    var limit = limit || 30;
    return Clustering.find({group_id: group_id, faceId: faceId, marked: {$ne: true}},{limit: limit})
  });

  // 发布 group 已经标注的person 信息
  Meteor.publish('group_person', function(group_id, limit){
    if(!this.userId || !group_id){
      return this.ready();
    }
    var limit = limit || 50;
    return Person.find({group_id: group_id},{limit: limit,sort:{name: 1}});
  });

  // 发布 group 已经标注的person 信息
  Meteor.publish('group_person_info', function(group_id){
    if(!this.userId || !group_id){
      return this.ready();
    }
    return Person.find({group_id: group_id},{fields:{
      faceId:1,name:1,group_id:1,_id:1,url:1}});
  });
  Meteor.publish('group_cluster_person', function(group_id){
    if(!this.userId || !group_id){
      return this.ready();
    }
    var limit = limit || 50;
    return ClusterPerson.find({group_id: group_id},{limit: limit,sort:{createAt: -1}});
  });

  Meteor.publish('cluster_person', function(group_id, limit){
    if(!this.userId || !group_id){
      return this.ready();
    }
    var limit = limit || 50;
    return ClusterPerson.find({group_id: group_id},{limit: limit,sort:{createAt: -1}});
  });

  Meteor.publish('person_labelDataset',function(group_id,name,limit){
    if (!group_id || !name) {
      return this.ready();
    }
    var limit = limit || 50;
    return LableDadaSet.find({group_id: group_id,name:name},{limit: limit,sort:{createAt: -1}});
  });

  Meteor.publish('cluster_person_labelDataset',function(group_id,name,limit){
    if (!group_id || !name) {
      return this.ready();
    }
    var limit = limit || 50;
    return ClusterLableDadaSet.find({group_id: group_id,name:name},{limit: limit,sort:{createAt: -1}});
  });

  Meteor.publish('people_new', function(){
    return People.find({}, {sort: {updateTime: -1}, limit: 50});
  });

  Meteor.publish('userGroups', function(){
    if(!this.userId){
        return this.ready();
    }
    var groupIds = [];
    var groups = SimpleChat.GroupUsers.find({user_id:this.userId}).fetch();
    for(var i = 0;i< groups.length; i++){
        groupIds.push(groups[i].group_id);
    }
    if(groupIds){
      return SimpleChat.Groups.find({_id: {$in: groupIds}});
    }
    return this.ready();
  });

  Meteor.publish('WorkStatus',function(date){
    if(!date){
        return this.ready();
    }
    var groupIds = [];
    var groups = SimpleChat.GroupUsers.find({user_id:this.userId}).fetch();
    for(var i = 0;i< groups.length; i++){
        groupIds.push(groups[i].group_id);
    }
    if(groupIds){
      return [
          WorkStatus.find({date: date,group_id:{$in:groupIds}}),
          SimpleChat.Groups.find({_id: {$in: groupIds}})
      ];
    }
    return this.ready();
  });

  Meteor.publish('groupWorkStatusHistory', function(group_id, dates){
    if(!group_id || !dates){
        return this.ready();
    }
    return WorkStatus.find({ date:{$in: dates},group_id: group_id},{sort:{date:-1}})
  });

  Meteor.publish('userGroupsWorkstatusLists', function(date, limit) {

    if(!this.userId || !date) {
        return this.ready();
    }

    var limit = limit || 3;

    var dates = [];
    var groupIds = [];
    SimpleChat.GroupUsers.find({user_id: this.userId},{limit: limit}).forEach(function (item) {
        groupIds.push(item.group_id);
    });

    for(var i = 0; i < 30 ; i++){
        var d = date - (i * 24 * 60 * 60 * 1000);
        dates.push(d);
    };
    return WorkStatus.find({ date: {$in: dates},group_id:{$in:groupIds}});
  });

  Meteor.publish('WorkStatusByGroup', function(date, group_id, status){
    if(!date || !group_id){
        return this.ready();
    }
    var selector = {
        date: date,
        group_id: group_id
    };
    selector.$or = [
      {in_image:{$nin:[null,'']}},{out_image:{$nin:[null,'']}}
    ]

    if(status){
        selector.status = status
    }
    console.log(selector)
    return WorkStatus.find(selector);
  });

  Meteor.publish('WorkStatusListsByGroup', function(date,group_id){
    if(!date || !group_id){
        return this.ready();
    }
    var dates = [];
    for(var i = 0; i < 30 ; i++){
        var d = date - (i * 24 * 60 * 60 * 1000);
        dates.push(d);
    };
    return WorkStatus.find({ date: {$in: dates},group_id:group_id});
  });

  WorkStatus.allow({
      update: function(userId, doc, fields, modifier){
          //if(userId === doc.app_user_id){
              return true;
          //}
          //return false;
      }
  });

  Meteor.publish('group_devices',function(){
    if(this.userId){
        var groupIds = []
        var groups = SimpleChat.GroupUsers.find({user_id:this.userId}).fetch();
        for(var i = 0;i< groups.length; i++){
            groupIds.push(groups[i].group_id);
        }
        if(groupIds){
            return [
                Devices.find({groupId: {$in:groupIds}}),
                SimpleChat.GroupUsers.find({user_id:this.userId})
            ];
        }
    }
    return this.ready();
  });

 Meteor.publish('device_by_groupId', function(groupId) {
    if (!this.userId || !groupId) {
        return this.ready();
    }
    return Devices.find({groupId: groupId});
 });

 Meteor.publish('group_workstatus', function(group_id, date){
     if (!this.userId) {
         return this.ready();
     }
     return [
         Devices.find({groupId: group_id}),
         WorkStatus.find({date: date,group_id:group_id})
     ];
 });
 Meteor.publish('group_clusterworkstatus', function(group_id, date){
     if (!this.userId) {
         return this.ready();
     }
     return [
         Devices.find({groupId: group_id}),
         ClusterWorkStatus.find({date: date,group_id:group_id})
     ];
 });
 Meteor.publish('devices-by-uuid',function(uuid){
     if(!this.userId || !uuid){
         return this.ready();
     }
     return [
         Devices.find({uuid:uuid}),
         Meteor.users.find({username: uuid})
     ];
 });
 Meteor.publish('commands', function (client_id){
     return Commands.find({client_id:client_id,done : false},{limit: 5,sort:{createdAt:1}});
 });
 Meteor.publish('latestboxversion', function (){
     return BoxVersion.find({}, {limit: 1});
 });

 Meteor.publish('group-device-timeline', function(group_id,timeRange){
     if(!this.userId || !group_id || !timeRange) {
         return this.ready();
     }
     var selector = {
         group_id: group_id,
         hour: {
             $gte: timeRange[0],
             $lte: timeRange[1]
         }
     };

     return DeviceTimeLine.find(selector, {sort:{hour: -1}});
 });

 Meteor.publish('device-timeline', function(uuid,limit){
    var limit = limit || 10;
    if(!this.userId || !uuid){
      return this.ready();
    }
    var device = Devices.findOne({uuid: uuid});
    return [
        DeviceTimeLine.find({uuid: uuid},{sort:{hour:-1},limit: limit}),
        Meteor.users.find({username: uuid}),
        SimpleChat.Groups.find({_id: device.groupId})
    ];
  });

 Meteor.publish('device-timeline2', function(uuid,selector,limit){
    var limit = limit || 10;
    if(!this.userId || !uuid){
      return this.ready();
    }
    var device = Devices.findOne({uuid: uuid});
    return [
        DeviceTimeLine.find(selector,{sort:{hour:-1},limit: limit}),
        Meteor.users.find({username: uuid}),
        SimpleChat.Groups.find({_id: device.groupId})
    ];
  });

 Meteor.publish('device-timeline-with-hour', function(uuid,options,sort,limit){
    var limit = limit || 10;
    if(!this.userId || !uuid){
      return this.ready();
    }
    // console.log('publish device-timeline-with-hour');
    // console.log('uuid:'+uuid);
    // console.log('options:'+JSON.stringify(options));
    // console.log('sort:'+sort);
    // console.log('limit:'+limit);
    var device = Devices.findOne({uuid: uuid});
    return [
        DeviceTimeLine.find({uuid: uuid,hour: options},{sort:{hour:sort},limit: limit}),
        SimpleChat.Groups.find({_id: device.groupId})
    ];
  });

  Meteor.methods({
    getPeopleIdByName: function(name, uuid){
      var people = People.findOne({name: name, uuid: uuid}, {sort: {updateTime: -1}});
      if(!people)
        return '';

      return {uuid: people.uuid, id: people.id};
    },
    //获取group下的设备列表
    getDeviceListByGroupId:function(group_id){
        var deviceList =  Devices.find({groupId: group_id}).fetch();
        return deviceList;
     }
  });
  var Fiber = Meteor.npmRequire('fibers');
  deferSetImmediate = function(func){
      var runFunction = function () {
      return func.apply(null);
      }
      if (typeof setImmediate == 'function') {
      setImmediate(function () {
          Fiber(runFunction).run();
      });
      } else {
      setTimeout(function () {
          Fiber(runFunction).run();
      }, 0);
      }
  }
}

GetStringByteLength = function(str){
  return str ? str.replace(/[^\x00-\xff]/g, 'xx').length : 0;
}
if(Meteor.isServer)
  PushSendLogs = new Meteor.Collection('pushSendLogs');

ReaderPopularPosts = new Meteor.Collection('readerpopularposts');

FavouritePosts = new Meteor.Collection('favouriteposts');

ShareURLs = new Meteor.Collection('shareURLs');

//推送设备token（同一手机只绑定最近一次登录的用户）
PushTokens = new Meteor.Collection('pushTokens');

if(Meteor.isClient){
  PostFriends = new Meteor.Collection("postfriends");
  PostFriendsCount = new Meteor.Collection("postfriendsCount");
  Newfriends = new Meteor.Collection("newfriends");
  ViewLists = new Meteor.Collection("viewlists");
  //User detail has duplicated information with postfriends, so only leave one to save traffic
  //UserDetail = new Meteor.Collection("userDetail");
  DynamicMoments = new Meteor.Collection('dynamicmoments');
  NewDynamicMoments = new Meteor.Collection('newdynamicmoments');
  SuggestPosts = new Meteor.Collection('suggestposts');
}

if(Meteor.isServer){
    Rnd = 0;
    try{
        suggestPostsUserId = Meteor.users.findOne({'username': 'suggestPosts' })._id;
    }
    catch(error)
    {
        //创建公共粉丝用户，关注所有推荐用户，从公共粉丝用户的FollowPosts里提取推荐帖子，加快推荐帖子速度
        suggestPostsUserId = Accounts.createUser({
            username:'suggestPosts',
            password:'actiontec123',
            email:'suggestposts@ggmail.com',
            profile:{
                icon:'/follows/icon1.png',
                desc:"留下美好的瞬间！就看我的！",
                fullname:'伊人'
            }
        });
    }
  Meteor.publish('allBlackList', function () {
    return BlackList.find({blackBy:this.userId},{limit: 1});
  });
  Meteor.publish("usersById", function (userId) {
      return Meteor.users.find({_id: userId}, {
            fields: {
                'username': 1,
                'profile.fullname': 1,
                'profile.icon': 1,
                'is_device':1
            }
        });
  });
  Meteor.publish("reports", function(postId) {
    if(!Match.test(postId, String))
      return this.ready();
    else
      return Reports.find({postId: postId},{limit:5});
  });
  Meteor.publish('versions', function() {
    return Versions.find({});
  });

  Meteor.publish('associatedusers', function() {
    if(!this.userId){
        return this.ready()
    }
      var self = this;
      var pub = this;

      var userA_Handle=AssociatedUsers.find({userIdA: self.userId}).observeChanges({
          added: function(_id, record){
              if(record.userIdB){
                  Meteor.defer(function(){
                      var userInfo=Meteor.users.findOne({_id: record.userIdB}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}})
                      if(userInfo){
                          pub.added('associatedusers', _id, record);
                          var userId=userInfo._id
                          delete userInfo['_id']
                          pub.added('users', userId, userInfo);
                      }
                  })
              }
          },
          changed: function(_id, record){
              try {
                    pub.changed('associatedusers', _id, record);
                  }
              catch (e) {
                  }

          },
          removed: function(_id, record){
              pub.removed('associatedusers', _id, record);
          }
      });
      var userB_Handle=AssociatedUsers.find({userIdB: self.userId}).observeChanges({
          added: function(_id, record){
              if(record.userIdA){
                  Meteor.defer(function(){
                      var userInfo=Meteor.users.findOne({_id: record.userIdA}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}})
                      if(userInfo){
                          pub.added('associatedusers', _id, record);
                          var userId=userInfo._id
                          delete userInfo['_id']
                          pub.added('users', userId, userInfo);
                      }
                  })
              }
          },
          changed: function(_id, record){
              try {
                    pub.changed('associatedusers', _id, record);
                  }
              catch (e) {
                  }
          },
          removed: function(_id, record){
              pub.removed('associatedusers', _id, record);
          }
      });
      this.ready();
      this.onStop(function(){
          userA_Handle.stop();
          userB_Handle.stop();
      });
      return
  });

  Meteor.publish('userRelation', function() {
    if(!this.userId)
       return this.ready();

    return UserRelation.find({userId: this.userId});
  });

  Meteor.publish('workaiUserRelationsByGroup', function (group_id) {
    if(!this.userId || !group_id){
        return this.ready();
    }

    return WorkAIUserRelations.find({group_id: group_id});
  });

  Meteor.publish('associateduserdetails', function(userIds) {
    if(userIds) {
        return Meteor.users.find({_id: {"$in": userIds}}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}});
    }
    else {
        return this.ready();
    }
  });

  Meteor.publish('aiMessages.group.unread', function(groupId) {
    console.log('aiMessages.group.unread',groupId);
    return AiMessages.find({ groupId:groupId,isRead:false },{sort:{createdAt:-1}});
  });

  LogonIPLogs.allow({
      insert: function (userId, doc) {
          return doc.userId === userId;
      },
      update: function (userId, doc, fields, modifier) {
          return doc.userId === userId;
      },
      remove: function (userId, doc) {
          return doc.userId === userId;
      }
  });

  ShareURLs.allow({
    insert: function(userId, doc) {
        // if(ShareURLs.findOne({userId:doc.userId,url:doc.url})){
        //     return false;
        // }
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
  })
  BlackList.allow({
    insert: function(userId) {
      return !! userId;
    },
    update: function (userId) {
      return !! userId;
    },
    remove: function (userId) {
      return !! userId;
    }
  });


  Reports.allow({
    insert: function (userId, doc) {
      return doc.username !== null;
    }
  });
  Meteor.users.deny({
      //A profile object that is completely writeable by default, even after you return false in Meteor.users.allow().
      update: function (userId, doc, fieldNames, modifier) {
          if(fieldNames.toString() === 'profile' && doc._id === userId && modifier.$set["profile.fullname"] !== undefined && doc.profile.fullname !== modifier.$set["profile.fullname"])
          {
              Meteor.defer(function(){
                  try{
                      UserRelation.update({toUserId:userId},{$set:{'toName': modifier.$set["profile.fullname"]}},{ multi: true});
                  }
                  catch(error){
                      //console.log("update Posts and FollowPost get error:"+error);
                  }
              });
          }
          if(fieldNames.toString() === 'profile' && doc._id === userId && modifier.$set["profile.icon"] !== undefined && doc.profile.icon !== modifier.$set["profile.icon"])
          {
              Meteor.defer(function(){
                  try{
                      UserRelation.update({toUserId:userId},{$set:{'toIcon': modifier.$set["profile.icon"]}},{ multi: true});
                  }
                  catch(error){}
              });
          }
          return doc._id !== userId
      }
  });
  Meteor.users.allow({
    update: function (userId, doc, fieldNames, modifier) {
      return doc._id === userId
    }
  });
  function buildRegExp(searchText) {
    // this is a dumb implementation
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  }
}

if(Meteor.isClient){
  if(Meteor.isCordova){
      Tracker.autorun(function(){
          if (Meteor.userId()){
              Meteor.subscribe('associatedusers', {
                  onReady: function() {

                  }
              });
          }

          Meteor.subscribe('versions');
      });
   //To prevent method not defined exception.
   window.refreshMainDataSource = function(){
       //Meteor.subscribe('waitreadcount');
   };

  }
}
