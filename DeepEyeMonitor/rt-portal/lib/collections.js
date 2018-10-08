peerCollection = new Meteor.Collection('peer');
RaidInfoLogs = new Mongo.Collection("raidinfologs");
if(Meteor.isClient) {
  inactiveClientCollection = new Meteor.Collection('inactive')
  Session.setDefault('counter', 0);
  Meteor.startup(function(){
    Meteor.subscribe('peerInfo')
    Meteor.subscribe('inactiveClients')
  });
}
if(Meteor.isServer) {
  var db_url= process.env.MONGO_METRICS_URL || 'mongodb://raidserver.youzhadahuo.com:27017/traffic_metrics'
  // get the "connect" function from the node mongodb driver
  var connect = MongoInternals.NpmModule.MongoClient.connect;
  // make it fiber aware
  connect = Meteor.wrapAsync(connect);

  // connecting to the our new db
  var db = connect(db_url);
  // creating the collection
  Metrics = db.collection('metrics');

  // make following methods in the collection fiber aware
  // so, we can use the exisiting codebase
  Metrics.aggregate = Meteor.wrapAsync(Metrics.aggregate, Metrics);
  Metrics.insert = Meteor.wrapAsync(Metrics.insert, Metrics);
  Metrics.update = Meteor.wrapAsync(Metrics.update, Metrics);
  Metrics.findOne = Meteor.wrapAsync(Metrics.findOne, Metrics);
  Metrics._ensureIndex = Meteor.wrapAsync(Metrics.ensureIndex, Metrics);

  // ensure indexing
  // Metrics._ensureIndex({token: 1, time: -1})

  TotalTraffic = db.collection('totaltraffic');

  // make following methods in the collection fiber aware
  // so, we can use the exisiting codebase
  TotalTraffic.aggregate = Meteor.wrapAsync(TotalTraffic.aggregate, TotalTraffic);
  TotalTraffic.insert = Meteor.wrapAsync(TotalTraffic.insert, TotalTraffic);
  TotalTraffic.update = Meteor.wrapAsync(TotalTraffic.update, TotalTraffic);
  TotalTraffic.findOne = Meteor.wrapAsync(TotalTraffic.findOne, TotalTraffic);
  TotalTraffic._ensureIndex = Meteor.wrapAsync(TotalTraffic.ensureIndex, TotalTraffic);

  // ensure indexing
  // TotalTraffic._ensureIndex({token: 1})

  AllBoxTraffic = db.collection('allboxtraffic');

  // make following methods in the collection fiber aware
  // so, we can use the exisiting codebase
  AllBoxTraffic.aggregate = Meteor.wrapAsync(AllBoxTraffic.aggregate, AllBoxTraffic);
  AllBoxTraffic.insert = Meteor.wrapAsync(AllBoxTraffic.insert, AllBoxTraffic);
  AllBoxTraffic.update = Meteor.wrapAsync(AllBoxTraffic.update, AllBoxTraffic);
  AllBoxTraffic.findOne = Meteor.wrapAsync(AllBoxTraffic.findOne, AllBoxTraffic);
  AllBoxTraffic._ensureIndex = Meteor.wrapAsync(AllBoxTraffic.ensureIndex, AllBoxTraffic);

  // ensure indexing
  // AllBoxTraffic._ensureIndex({hour: 1})


  boxMonitorTraffic = db.collection('boxmonitortraffic');

  // make following methods in the collection fiber aware
  // so, we can use the exisiting codebase
  boxMonitorTraffic.aggregate = Meteor.wrapAsync(boxMonitorTraffic.aggregate, boxMonitorTraffic);
  boxMonitorTraffic.insert = Meteor.wrapAsync(boxMonitorTraffic.insert, boxMonitorTraffic);
  boxMonitorTraffic.update = Meteor.wrapAsync(boxMonitorTraffic.update, boxMonitorTraffic);
  boxMonitorTraffic.findOne = Meteor.wrapAsync(boxMonitorTraffic.findOne, boxMonitorTraffic);
  boxMonitorTraffic._ensureIndex = Meteor.wrapAsync(boxMonitorTraffic.ensureIndex, boxMonitorTraffic);

  RAIDTotalQoE = db.collection('raidtotalqoe');
  RAIDTotalQoE.aggregate =    Meteor.wrapAsync(RAIDTotalQoE.aggregate,   RAIDTotalQoE);
  RAIDTotalQoE.insert =       Meteor.wrapAsync(RAIDTotalQoE.insert,      RAIDTotalQoE);
  RAIDTotalQoE.update =       Meteor.wrapAsync(RAIDTotalQoE.update,      RAIDTotalQoE);
  RAIDTotalQoE.findOne =      Meteor.wrapAsync(RAIDTotalQoE.findOne,     RAIDTotalQoE);
  RAIDTotalQoE._ensureIndex = Meteor.wrapAsync(RAIDTotalQoE.ensureIndex, RAIDTotalQoE);


  NormalTotalQoE = db.collection('normaltotalqoe');
  NormalTotalQoE.aggregate =    Meteor.wrapAsync(NormalTotalQoE.aggregate,   NormalTotalQoE);
  NormalTotalQoE.insert =       Meteor.wrapAsync(NormalTotalQoE.insert,      NormalTotalQoE);
  NormalTotalQoE.update =       Meteor.wrapAsync(NormalTotalQoE.update,      NormalTotalQoE);
  NormalTotalQoE.findOne =      Meteor.wrapAsync(NormalTotalQoE.findOne,     NormalTotalQoE);
  NormalTotalQoE._ensureIndex = Meteor.wrapAsync(NormalTotalQoE.ensureIndex, NormalTotalQoE);

  // ensure indexing
  // boxMonitorTraffic._ensureIndex({hour: 1, clientID:1})

  var database = new MongoInternals.RemoteCollectionDriver(db_url);
  Traffic = new Mongo.Collection("totaltraffic", { _driver: database });
}
if(Meteor.isClient){
  Traffic = new Meteor.Collection('totaltraffic');
}
var Schemas={}
Schemas.Traffic = new SimpleSchema({        // selector for document for the currentHour for the given user
  token: {type:String},
  free: {type:Number},
  orig: {type:Number},
  raid: {type:Number}
})
Traffic.attachSchema(Schemas.Traffic)
AdminConfig = {
  name: 'Admin of RAIDCDN',
  adminEmails: ['familysnap2014@gmail.com','bxiong@actiontec.com','solderzzc@gmail.com'],
  collections: {
    Traffic:{}
  }
};
