Meteor.methods({
  getChartData: function(token) {
    this.unblock();
    var hourMillis = 1000 * 60 * 60;
    var ts=new Date()
    var thisHour = GetHour(ts);
    var lastHour = new Date(thisHour.getTime() - hourMillis);
    var result={}
    var metrics = [];

    // find the document for the current hour
    var thisHourDoc = Metrics.findOne({token: token, hour: thisHour});
    // find the document for the last hour hour
    var lastHourDoc = Metrics.findOne({token: token, hour: lastHour});
    // generate the average
    fillIntoResults(metrics, thisHourDoc, thisHour);
    fillIntoResults(metrics, lastHourDoc, lastHour);

    // make sure to sort documents according to the time
    metrics.sort(function(a, b) {
      return a.time - b.time;
    });

    // send only last 60 values to the client
    result.matrics=_.last(metrics, 60);
    result.ts=ts
    return result
  },
  getHistoryChartData: function(token, select) {
    this.unblock();
    var ts=new Date()
    var thisHour = GetHour(ts);
    var thisDay = GetDay(ts);
    var result={}
    var metrics = [];
    var metrics2 = {};

    if(select === 'd') {
    //daily
      var hourMillis = 1000 * 60 * 60;
      var nowDay = new Date(thisHour.getTime());
      var lastDay = new Date(nowDay.getTime())
      lastDay.setDate(lastDay.getDate() - 1);
      var pipeline = [
        {$match: {token: Meteor.userId(), hour:{$gte:lastDay, $lte: nowDay}}},
        {$limit: 72},
        {$sort: {hour: -1}}
      ];
      var dailyDoc = Metrics.aggregate(pipeline);
      for(var i=0; i<25;i++) {
        var lastHour = new Date(lastDay.getTime() + hourMillis*i);
        metrics2[lastHour.getTime()] = {time: lastHour, free: 0, orig:0, raid:0};
      }

      for(var i =0; i<dailyDoc.length; i++) {
          for(var j = i+1; j<dailyDoc.length; j++) {
              if(dailyDoc[i].hour.getTime() == dailyDoc[j].hour.getTime())
                  dailyDoc[j].droped = true;
              else
                  dailyDoc[j].droped = false;
          }
      }

      for(var item in dailyDoc) {
        if(dailyDoc[item].droped)
            continue;
        var ts = dailyDoc[item].hour.getTime();
        if(ts && metrics2[ts] && (metrics2[ts].time.getTime() == ts)) {
            metrics2[ts].free = dailyDoc[item].hourFree;
            metrics2[ts].orig = dailyDoc[item].hourOrig;
            metrics2[ts].raid = dailyDoc[item].hourRaid;
        }
        else {
            console.log('invalied date!');
        }
      }
      result.matrics = metrics2;
    }
    else if(select === 'w') {
    //weekly
      for(var i=7;i>=0;i--){
        var ts1 = new Date(thisDay.getTime())
        ts1.setDate(thisDay.getDate() - i);
        var ts2 = new Date(ts1.getTime());
        ts2.setDate(ts1.getDate() +1);

        var pipeline = [
          {$match: {token: Meteor.userId(), hour:{$gte:ts1, $lt: ts2}}},
          // {$limit: 24},
          {$group: {_id: null, hourFree: {$sum: "$hourFree"}, hourOrig: {$sum: "$hourOrig"}, hourRaid: {$sum: "$hourRaid"}}}
        ];
        var weekDoc = Metrics.aggregate(pipeline);
        metrics.push({
          time: ts1,
          free: (weekDoc[0] && weekDoc[0].hourFree) ? weekDoc[0].hourFree:0,
          orig: (weekDoc[0] && weekDoc[0].hourOrig) ? weekDoc[0].hourOrig:0,
          raid: (weekDoc[0] && weekDoc[0].hourRaid) ? weekDoc[0].hourRaid:0
        });
      }
      // send only last 7 values to the client
      result.matrics=_.last(metrics, 7);
    }
    else if(select === 'm') {
    //monthly
      for(var i=30;i>=0;i--){
        var ts1 = new Date(thisDay.getTime())
        ts1.setDate(thisDay.getDate() - i);
        var ts2 = new Date(ts1.getTime());
        ts2.setDate(ts1.getDate() +1);

        var pipeline = [
          {$match: {token: Meteor.userId(), hour:{$gte:ts1, $lt: ts2}}},
          // {$limit: 24},
          {$group: {_id: null, hourFree: {$sum: "$hourFree"}, hourOrig: {$sum: "$hourOrig"}, hourRaid: {$sum: "$hourRaid"}}}
        ];
        var monthDoc = Metrics.aggregate(pipeline);
        metrics.push({
          time: ts1,
          free: (monthDoc[0] && monthDoc[0].hourFree) ? monthDoc[0].hourFree:0,
          orig: (monthDoc[0] && monthDoc[0].hourOrig) ? monthDoc[0].hourOrig:0,
          raid: (monthDoc[0] && monthDoc[0].hourRaid) ? monthDoc[0].hourRaid:0
        });
      }
      // send only last 30 values to the client
      result.matrics=_.last(metrics, 30);
    }
    else if(select === 'y') {
    //yearly
      for(var i=12;i>=0;i--){
        var ts1 = new Date(thisDay.getTime())
        ts1.setMonth(thisDay.getMonth() - i);
        ts1.setDate(1);
        var ts2 = new Date(ts1.getTime());
        ts2.setMonth(ts1.getMonth() + 1);
        ts2.setDate(1);

        var pipeline = [
          {$match: {token: Meteor.userId(), hour:{$gte:ts1, $lt: ts2}}},
          // {$limit: 24},
          {$group: {_id: null, hourFree: {$sum: "$hourFree"}, hourOrig: {$sum: "$hourOrig"}, hourRaid: {$sum: "$hourRaid"}}}
        ];
        var monthDoc = Metrics.aggregate(pipeline);
        metrics.push({
          time: ts1,
          free: (monthDoc[0] && monthDoc[0].hourFree) ? monthDoc[0].hourFree:0,
          orig: (monthDoc[0] && monthDoc[0].hourOrig) ? monthDoc[0].hourOrig:0,
          raid: (monthDoc[0] && monthDoc[0].hourRaid) ? monthDoc[0].hourRaid:0
        });
      }
      // send only last 30 values to the client
      result.matrics=_.last(metrics, 12);
    }

    result.ts=ts
    return result
  },
  getTotalData: function(token) {
    this.unblock();
    return TotalTraffic.findOne({token: token});
  },
  getBoxData: function(token,timeLine){
    this.unblock();
    var hourMillis = 1000 * 60 * 60;
    var ts=new Date()
    var thisHour = GetHour(ts);
    var lastHour = new Date(thisHour.getTime() - hourMillis);
    var thisDay = GetDay(ts);
    
    var result={};

    if(timeLine == 'h'){
      var thisHourDoc = AllBoxTraffic.findOne({hour: thisHour});
      var lastHourDoc = AllBoxTraffic.findOne({hour: lastHour});
      var matrics = [];
      var matrics2 = [];
      var currentMinutes = ts.getMinutes();
      
      for(var i=0;i<60;i++){
        var ts1 = new Date(lastHour.getTime())
        ts1.setMinutes(lastHour.getMinutes() +i);
        var ts2 = new Date(thisHour.getTime())
        ts2.setMinutes(thisHour.getMinutes() +i);
        matrics.push({
          time: ts1,
          cdn_downloaded:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].cdn_downloaded)?Math.round(lastHourDoc.perMinSum[i].cdn_downloaded):0 ,
          p2p_downloaded:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].p2p_downloaded)?Math.round(lastHourDoc.perMinSum[i].p2p_downloaded):0 ,
          uploaded: (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].uploaded)?Math.round(lastHourDoc.perMinSum[i].uploaded):0 
        });
        if(i <= currentMinutes) {
          matrics2.push({
            time: ts2,
            cdn_downloaded:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].cdn_downloaded)?Math.round(thisHourDoc.perMinSum[i].cdn_downloaded):0 ,
            p2p_downloaded:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].p2p_downloaded)?Math.round(thisHourDoc.perMinSum[i].p2p_downloaded):0 ,
            uploaded: (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].uploaded)?Math.round(thisHourDoc.perMinSum[i].uploaded):0 
          });
        }
      }
      matrics = matrics.concat(matrics2);
      
      result = matrics.slice(-60);
    } else if(timeLine == 'd'){
      var nowDay = new Date(thisHour.getTime());
      var lastDay = new Date(thisHour.getTime());
      lastDay.setDate(lastDay.getDate() - 1);
      var hourMillis = 1000 * 60 * 60;
      var metrics = {};
      var pipeline = [
        {$match: {hour:{$gte:lastDay, $lte: nowDay}}},
        // {$limit: 72},
        {$sort: {hour: 1}}
      ];
      var dailyDoc = AllBoxTraffic.aggregate(pipeline);
      for(var i=0; i<25;i++) {
        var lastHour = new Date(lastDay.getTime() + hourMillis*i);
        metrics[lastHour.getTime()] = {hour: lastHour, hour_cdn_downloaded: 0, hour_p2p_downloaded:0, hour_uploaded:0};
      }

      for(var i =0; i<dailyDoc.length; i++) {
          for(var j = i+1; j<dailyDoc.length; j++) {
              if(dailyDoc[i].hour.getTime() == dailyDoc[j].hour.getTime())
                  dailyDoc[j].droped = true;
              else
                  dailyDoc[j].droped = false;
          }
      }

      for(var item in dailyDoc) {
        if(dailyDoc[item].droped)
            continue;
        var ts = dailyDoc[item].hour.getTime();
        var cdn_downloaded = (dailyDoc[item].hour_cdn_downloaded && dailyDoc[item].hour_cdn_downloaded>0) ? dailyDoc[item].hour_cdn_downloaded : 0;
        var p2p_downloaded = (dailyDoc[item].hour_p2p_downloaded && dailyDoc[item].hour_p2p_downloaded>0) ? dailyDoc[item].hour_p2p_downloaded : 0;
        var uploaded = (dailyDoc[item].hour_uploaded && dailyDoc[item].hour_uploaded>0) ? dailyDoc[item].hour_uploaded : 0;

        if(ts && metrics[ts] && (metrics[ts].hour.getTime() == ts)) {
            metrics[ts].hour_cdn_downloaded = cdn_downloaded;
            metrics[ts].hour_p2p_downloaded = p2p_downloaded;
            metrics[ts].hour_uploaded = uploaded;
        }
        else {
            console.log('invalied date!');
        }
      }

      result = metrics;
    } else if(timeLine == 'm'){
      var matrics = [];
      for(var i=30;i>=0;i--){
        var ts1 = new Date(thisDay.getTime())
        ts1.setDate(thisDay.getDate() - i);
        var ts2 = new Date(ts1.getTime());
        ts2.setDate(ts1.getDate() +1);

        var pipeline = [
          {$match: {hour:{$gte:ts1, $lt: ts2}}},
          // {$limit: 30},
          {$group: {_id: null, hour_uploaded: {$sum: "$hour_uploaded"}, hour_cdn_downloaded: {$sum: "$hour_cdn_downloaded"}, hour_p2p_downloaded: {$sum: "$hour_p2p_downloaded"}}}
        ];
        var monthDoc = AllBoxTraffic.aggregate(pipeline);
        matrics.push({
          time: ts1,
          hour_uploaded: (monthDoc[0] && monthDoc[0].hour_uploaded) ? monthDoc[0].hour_uploaded:0,
          hour_cdn_downloaded: (monthDoc[0] && monthDoc[0].hour_cdn_downloaded) ? monthDoc[0].hour_cdn_downloaded:0,
          hour_p2p_downloaded: (monthDoc[0] && monthDoc[0].hour_p2p_downloaded) ? monthDoc[0].hour_p2p_downloaded:0
        });
      }
      result= matrics;
    }

    //if(result){
    //  result.ts=ts
    //}
    return result
  },
  getBoxMonitorTrafficData: function(clientID,timeLine){
    this.unblock();
    var hourMillis = 1000 * 60 * 60;
    var ts=new Date()
    var thisHour = GetHour(ts);
    var lastHour = new Date(thisHour.getTime() - hourMillis);
    var thisDay = GetDay(ts);
    var matrics = [];
    var result={};

    if(timeLine == 'h'){
      // result = boxMonitorTraffic.findOne({hour: lastHour, clientID: clientID});
      var thisHourDoc = boxMonitorTraffic.findOne({hour: thisHour, clientID: clientID});
      var lastHourDoc = boxMonitorTraffic.findOne({hour: lastHour, clientID: clientID});
      var matrics = [];
      var matrics2 = [];
      var currentMinutes = ts.getMinutes();
      for(var i=0;i<60;i++){
        var ts1 = new Date(lastHour.getTime())
        ts1.setMinutes(lastHour.getMinutes() +i);
        var ts2 = new Date(thisHour.getTime())
        ts2.setMinutes(thisHour.getMinutes() +i);
        matrics.push({
          time: ts1,
          cdn_speed:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].cdn_speed)?Math.round(lastHourDoc.perMinSum[i].cdn_speed):0 ,
          p2p_speed:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].p2p_speed)?Math.round(lastHourDoc.perMinSum[i].p2p_speed):0 ,
          upload_speed: (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].upload_speed)?Math.round(lastHourDoc.perMinSum[i].upload_speed):0,
          download_speed: (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].download_speed)?Math.round(lastHourDoc.perMinSum[i].download_speed):0,
          cdn_downloaded:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].cdn_downloaded)?Math.round(lastHourDoc.perMinSum[i].cdn_downloaded):0 ,
          p2p_downloaded:    (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].p2p_downloaded)?Math.round(lastHourDoc.perMinSum[i].p2p_downloaded):0 ,
          uploaded: (lastHourDoc && lastHourDoc.perMinSum && lastHourDoc.perMinSum[i] && lastHourDoc.perMinSum[i].uploaded)?Math.round(lastHourDoc.perMinSum[i].uploaded):0,
          perMinSamples: (lastHourDoc && lastHourDoc.perMinSamples && typeof(lastHourDoc.perMinSamples) === 'number' && lastHourDoc.perMinSamples[i])?lastHourDoc.perMinSamples[i]:1
        });
        if(i <= currentMinutes) {
          matrics2.push({
            time: ts2,
            cdn_speed:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].cdn_speed)?Math.round(thisHourDoc.perMinSum[i].cdn_speed):0 ,
            p2p_speed:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].p2p_speed)?Math.round(thisHourDoc.perMinSum[i].p2p_speed):0 ,
            upload_speed: (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].upload_speed)?Math.round(thisHourDoc.perMinSum[i].upload_speed):0,
            download_speed: (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].download_speed)?Math.round(thisHourDoc.perMinSum[i].download_speed):0,
            cdn_downloaded:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].cdn_downloaded)?Math.round(thisHourDoc.perMinSum[i].cdn_downloaded):0 ,
            p2p_downloaded:    (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].p2p_downloaded)?Math.round(thisHourDoc.perMinSum[i].p2p_downloaded):0 ,
            uploaded: (thisHourDoc && thisHourDoc.perMinSum && thisHourDoc.perMinSum[i] && thisHourDoc.perMinSum[i].uploaded)?Math.round(thisHourDoc.perMinSum[i].uploaded):0,
            perMinSamples: (thisHourDoc && thisHourDoc.perMinSamples && typeof(thisHourDoc.perMinSamples) === 'number' && thisHourDoc.perMinSamples[i])?thisHourDoc.perMinSamples[i]:1
          });
        }
      }
      matrics = matrics.concat(matrics2);
      
      result = matrics.slice(-60);
    } else if(timeLine == 'd'){
      var lastDay = new Date(thisHour.getTime());
      var hourMillis = 1000 * 60 * 60;
      var metrics = {};
      lastDay.setDate(lastDay.getDate() - 1);
      var pipeline = [
        {$match: {hour:{$gte:lastDay},clientID: clientID}},
        // {$limit: 25},
        {$sort: {hour: 1}}
      ];
      var dailyDoc = boxMonitorTraffic.aggregate(pipeline);
      for(var i=0; i<25;i++) {
        var lastHour = new Date(lastDay.getTime() + hourMillis*i);
        metrics[lastHour.getTime()] = {
            hour: lastHour, 
            samples: 1,
            hour_cdn_speed: 0,
            hour_p2p_speed: 0,
            hour_upload_speed: 0,
            hour_download_speed: 0,
            hour_cdn_downloaded: 0,
            hour_p2p_downloaded: 0,
            hour_uploaded:0
          };
      }
      for(var item in dailyDoc) {
        var ts = dailyDoc[item].hour.getTime();
        var perMinSumLength       = (dailyDoc[item].perMinSum) ? (dailyDoc[item].perMinSum.length || Object.keys(dailyDoc[item].perMinSum).length): 1;
        var hour                  = (dailyDoc[item].hour                && dailyDoc[item].hour               >0) ? dailyDoc[item].hour                : 0;
        var samples               = (dailyDoc[item].samples             && dailyDoc[item].samples            >0) ? dailyDoc[item].samples             : perMinSumLength;
        var hour_cdn_speed        = (dailyDoc[item].hour_cdn_speed      && dailyDoc[item].hour_cdn_speed     >0) ? dailyDoc[item].hour_cdn_speed      : 0;
        var hour_p2p_speed        = (dailyDoc[item].hour_p2p_speed      && dailyDoc[item].hour_p2p_speed     >0) ? dailyDoc[item].hour_p2p_speed      : 0;
        var hour_upload_speed     = (dailyDoc[item].hour_upload_speed   && dailyDoc[item].hour_upload_speed  >0) ? dailyDoc[item].hour_upload_speed   : 0;
        var hour_download_speed   = (dailyDoc[item].hour_download_speed && dailyDoc[item].hour_download_speed>0) ? dailyDoc[item].hour_download_speed : 0;
        var hour_cdn_downloaded   = (dailyDoc[item].hour_cdn_downloaded && dailyDoc[item].hour_cdn_downloaded>0) ? dailyDoc[item].hour_cdn_downloaded : 0;
        var hour_p2p_downloaded   = (dailyDoc[item].hour_p2p_downloaded && dailyDoc[item].hour_p2p_downloaded>0) ? dailyDoc[item].hour_p2p_downloaded : 0;
        var hour_uploaded         = (dailyDoc[item].hour_uploaded       && dailyDoc[item].hour_uploaded      >0) ? dailyDoc[item].hour_uploaded       : 0;

        if(ts && metrics[ts] && (metrics[ts].hour.getTime() == ts)) {
            metrics[ts].hour                = hour               ;
            metrics[ts].samples             = samples            ;
            metrics[ts].hour_cdn_speed      = hour_cdn_speed     ;
            metrics[ts].hour_p2p_speed      = hour_p2p_speed     ;
            metrics[ts].hour_upload_speed   = hour_upload_speed  ;
            metrics[ts].hour_download_speed = hour_download_speed;
            metrics[ts].hour_cdn_downloaded = hour_cdn_downloaded;
            metrics[ts].hour_p2p_downloaded = hour_p2p_downloaded;
            metrics[ts].hour_uploaded       = hour_uploaded      ;
        }
        else {
            console.log('invalied date!');
        }
      }

      result = metrics;
    } else if(timeLine == 'm'){
      var matrics = [];
      for(var i=30;i>=0;i--){
        var ts1 = new Date(thisDay.getTime())
        ts1.setDate(thisDay.getDate() - i);
        var ts2 = new Date(ts1.getTime());
        ts2.setDate(ts1.getDate() +1);

        var pipeline = [
          {$match: {hour:{$gte:ts1, $lt: ts2},clientID: clientID}},
          {$limit: 30},
          {$group: {
            _id: null,
            hour_upload_speed: {$sum: "$hour_upload_speed"},
            hour_cdn_speed: {$sum: "$hour_cdn_speed"},
            hour_p2p_speed: {$sum: "$hour_p2p_speed"},
            hour_download_speed:{$sum:"$hour_download_speed"},
            hour_cdn_downloaded: {$sum: "$hour_cdn_downloaded"},
            hour_p2p_downloaded: {$sum: "$hour_p2p_downloaded"},
            hour_uploaded: {$sum: "$hour_uploaded"},
            samples: {$sum:'$samples'},
            perMinSum: {$addToSet:'$perMinSum'}
          }}];
        var monthDoc = boxMonitorTraffic.aggregate(pipeline);
        var perMinSumLength = (monthDoc[0] && monthDoc[0].perMinSum) ? (monthDoc[0].perMinSum.length || Object.keys(monthDoc[0].perMinSum).length): 1;
        matrics.push({
          time: ts1,
          hour_upload_speed: (monthDoc[0] && monthDoc[0].hour_upload_speed) ? monthDoc[0].hour_upload_speed:0,
          hour_cdn_speed: (monthDoc[0] && monthDoc[0].hour_cdn_speed) ? monthDoc[0].hour_cdn_speed:0,
          hour_p2p_speed: (monthDoc[0] && monthDoc[0].hour_p2p_speed) ? monthDoc[0].hour_p2p_speed:0,
          hour_download_speed: (monthDoc[0] && monthDoc[0].hour_download_speed) ? monthDoc[0].hour_download_speed:0,
          hour_cdn_downloaded: (monthDoc[0] && monthDoc[0].hour_cdn_downloaded) ? monthDoc[0].hour_cdn_downloaded:0,
          hour_p2p_downloaded: (monthDoc[0] && monthDoc[0].hour_p2p_downloaded) ? monthDoc[0].hour_p2p_downloaded:0,
          hour_uploaded: (monthDoc[0] && monthDoc[0].hour_uploaded) ? monthDoc[0].hour_uploaded:0,
          samples:  (monthDoc[0] && monthDoc[0].samples) ? monthDoc[0].samples:(60*perMinSumLength)
        });
      }
      result= matrics;
    }
    //if(result){
    //  result.ts=ts
    //}
    return result
  },
  getQoEData: function(token, select){
    this.unblock();
    var hourMillis = 1000 * 60 * 60;
    var ts=new Date()
    var thisHour = GetHour(ts);
    var lastHour = new Date(thisHour.getTime() - hourMillis);
    var thisDay = GetDay(ts);
    var result = {};
    if(select === 'h') {
      //hours
      var thisHourDoc = {
        raid: {
          starting: RAIDTotalQoE.findOne({hour: thisHour, type:'starting'}),
          seeking: RAIDTotalQoE.findOne({hour: thisHour, type:'seeking'}),
          buffering: RAIDTotalQoE.findOne({hour: thisHour, type:'buffering'})
        },
        normal:{
          starting: NormalTotalQoE.findOne({hour: thisHour,type:'starting'}),
          seeking: NormalTotalQoE.findOne({hour: thisHour,type:'seeking'}),
          buffering: NormalTotalQoE.findOne({hour: thisHour,type:'buffering'})
        }
      }
      var lastHourDoc = {
        raid: {
          starting: RAIDTotalQoE.findOne({hour: lastHour, type:'starting'}),
          seeking: RAIDTotalQoE.findOne({hour: lastHour, type:'seeking'}),
          buffering: RAIDTotalQoE.findOne({hour: lastHour, type:'buffering'})
        },
        normal:{
          starting: NormalTotalQoE.findOne({hour: lastHour,type:'starting'}),
          seeking: NormalTotalQoE.findOne({hour: lastHour,type:'seeking'}),
          buffering: NormalTotalQoE.findOne({hour: lastHour,type:'buffering'})
        }
      }
      var matrics = [];
      var matrics2 = [];
      var currentMinutes = ts.getMinutes();
      
      for(var i=0;i<60;i++){
        var ts1 = new Date(lastHour.getTime())
        ts1.setMinutes(lastHour.getMinutes() +i);
        var ts2 = new Date(thisHour.getTime())
        ts2.setMinutes(thisHour.getMinutes() +i);
        matrics.push({
          time: ts1,
          raid_starting: (lastHourDoc.raid.starting && lastHourDoc.raid.starting.perMinSum && lastHourDoc.raid.starting.perMinSum[i] && lastHourDoc.raid.starting.perMinSum[i].duration) ? lastHourDoc.raid.starting.perMinSum[i].duration/lastHourDoc.raid.starting.perMinSamples[i]:0,
          raid_seeking: (lastHourDoc.raid.seeking && lastHourDoc.raid.seeking.perMinSum && lastHourDoc.raid.seeking.perMinSum[i] && lastHourDoc.raid.seeking.perMinSum[i].duration) ? lastHourDoc.raid.seeking.perMinSum[i].duration/lastHourDoc.raid.seeking.perMinSamples[i]:0,
          raid_buffering: (lastHourDoc.raid.buffering && lastHourDoc.raid.buffering.perMinSum && lastHourDoc.raid.buffering.perMinSum[i] && lastHourDoc.raid.buffering.perMinSum[i].duration) ? lastHourDoc.raid.buffering.perMinSum[i].duration/lastHourDoc.raid.buffering.perMinSamples[i]:0,
          normal_starting: (lastHourDoc.normal.starting && lastHourDoc.normal.starting.perMinSum && lastHourDoc.normal.starting.perMinSum[i] && lastHourDoc.normal.starting.perMinSum[i].duration) ? lastHourDoc.normal.starting.perMinSum[i].duration/lastHourDoc.normal.starting.perMinSamples[i]:0,
          normal_seeking: (lastHourDoc.normal.seeking && lastHourDoc.normal.seeking.perMinSum && lastHourDoc.normal.seeking.perMinSum[i] && lastHourDoc.normal.seeking.perMinSum[i].duration) ? lastHourDoc.normal.seeking.perMinSum[i].duration/lastHourDoc.normal.seeking.perMinSamples[i]:0,
          normal_buffering: (lastHourDoc.normal.buffering && lastHourDoc.normal.buffering.perMinSum && lastHourDoc.normal.buffering.perMinSum[i] && lastHourDoc.normal.buffering.perMinSum[i].duration) ? lastHourDoc.normal.buffering.perMinSum[i].duration/lastHourDoc.normal.buffering.perMinSamples[i]:0,

          raid_starting_samples: (lastHourDoc.raid.starting && lastHourDoc.raid.starting.perMinSamples && lastHourDoc.raid.starting.perMinSamples[i]) ? lastHourDoc.raid.starting.perMinSamples[i]:0,
          raid_seeking_samples: (lastHourDoc.raid.seeking && lastHourDoc.raid.seeking.perMinSamples && lastHourDoc.raid.seeking.perMinSamples[i]) ? lastHourDoc.raid.seeking.perMinSamples[i]:0,
          raid_buffering_samples: (lastHourDoc.raid.buffering && lastHourDoc.raid.buffering.perMinSamples && lastHourDoc.raid.buffering.perMinSamples[i]) ? lastHourDoc.raid.buffering.perMinSamples[i]:0,
          normal_starting_samples: (lastHourDoc.normal.starting && lastHourDoc.normal.starting.perMinSamples && lastHourDoc.normal.starting.perMinSamples[i]) ? lastHourDoc.normal.starting.perMinSamples[i]:0,
          normal_seeking_samples: (lastHourDoc.normal.seeking && lastHourDoc.normal.seeking.perMinSamples && lastHourDoc.normal.seeking.perMinSamples[i]) ? lastHourDoc.normal.seeking.perMinSamples[i]:0,
          normal_buffering_samples: (lastHourDoc.normal.buffering && lastHourDoc.normal.buffering.perMinSamples && lastHourDoc.normal.buffering.perMinSamples[i]) ? lastHourDoc.normal.buffering.perMinSamples[i]:0,
        });  
        if(i <= currentMinutes){  
          matrics2.push({
            time: ts2,
            raid_starting: (thisHourDoc.raid.starting && thisHourDoc.raid.starting.perMinSum && thisHourDoc.raid.starting.perMinSum[i] && thisHourDoc.raid.starting.perMinSum[i].duration) ? thisHourDoc.raid.starting.perMinSum[i].duration/thisHourDoc.raid.starting.perMinSamples[i]:0,
            raid_seeking: (thisHourDoc.raid.seeking && thisHourDoc.raid.seeking.perMinSum && thisHourDoc.raid.seeking.perMinSum[i] && thisHourDoc.raid.seeking.perMinSum[i].duration) ? thisHourDoc.raid.seeking.perMinSum[i].duration/thisHourDoc.raid.seeking.perMinSamples[i]:0,
            raid_buffering: (thisHourDoc.raid.buffering && thisHourDoc.raid.buffering.perMinSum && thisHourDoc.raid.buffering.perMinSum[i] && thisHourDoc.raid.buffering.perMinSum[i].duration) ? thisHourDoc.raid.buffering.perMinSum[i].duration/thisHourDoc.raid.buffering.perMinSamples[i]:0,
            normal_starting: (thisHourDoc.normal.starting && thisHourDoc.normal.starting.perMinSum && thisHourDoc.normal.starting.perMinSum[i] && thisHourDoc.normal.starting.perMinSum[i].duration) ? thisHourDoc.normal.starting.perMinSum[i].duration/thisHourDoc.normal.starting.perMinSamples[i]:0,
            normal_seeking: (thisHourDoc.normal.seeking && thisHourDoc.normal.seeking.perMinSum && thisHourDoc.normal.seeking.perMinSum[i] && thisHourDoc.normal.seeking.perMinSum[i].duration) ? thisHourDoc.normal.seeking.perMinSum[i].duration/thisHourDoc.normal.seeking.perMinSamples[i]:0,
            normal_buffering: (thisHourDoc.normal.buffering && thisHourDoc.normal.buffering.perMinSum && thisHourDoc.normal.buffering.perMinSum[i] && thisHourDoc.normal.buffering.perMinSum[i].duration) ? thisHourDoc.normal.buffering.perMinSum[i].duration/thisHourDoc.normal.buffering.perMinSamples[i]:0,

            raid_starting_samples:    (thisHourDoc.raid.starting && thisHourDoc.raid.starting.perMinSamples && thisHourDoc.raid.starting.perMinSamples[i])          ? thisHourDoc.raid.starting.perMinSamples[i]:0,
            raid_seeking_samples:     (thisHourDoc.raid.seeking && thisHourDoc.raid.seeking.perMinSamples && thisHourDoc.raid.seeking.perMinSamples[i])             ? thisHourDoc.raid.seeking.perMinSamples[i]:0,
            raid_buffering_samples:   (thisHourDoc.raid.buffering && thisHourDoc.raid.buffering.perMinSamples && thisHourDoc.raid.buffering.perMinSamples[i])       ? thisHourDoc.raid.buffering.perMinSamples[i]:0,
            normal_starting_samples:  (thisHourDoc.normal.starting && thisHourDoc.normal.starting.perMinSamples && thisHourDoc.normal.starting.perMinSamples[i])    ? thisHourDoc.normal.starting.perMinSamples[i]:0,
            normal_seeking_samples:   (thisHourDoc.normal.seeking && thisHourDoc.normal.seeking.perMinSamples && thisHourDoc.normal.seeking.perMinSamples[i])       ? thisHourDoc.normal.seeking.perMinSamples[i]:0,
            normal_buffering_samples: (thisHourDoc.normal.buffering && thisHourDoc.normal.buffering.perMinSamples && thisHourDoc.normal.buffering.perMinSamples[i]) ? thisHourDoc.normal.buffering.perMinSamples[i]:0,
          });
        }
      }
      matrics = matrics.concat(matrics2);
      matrics = matrics.slice(-60);
    } else if(select === 'd'){
      // daily
      ts = new Date(thisHour.getTime())
      ts.setDate(thisHour.getDate()-1)
      var matrics = {};
      var t1 = (new Date())
      result = {
        raid: {
          starting: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'starting'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          seeking: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'seeking'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          buffering: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'buffering'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}])
        },
        normal:{
          starting: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'starting'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          seeking: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'seeking'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          buffering: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'buffering'}},{$group: {_id:'$hour',duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}])
        },
      }
      for(var i=24; i>=0;i--){
        var ts1 = new Date(thisHour.getTime())
        ts1.setHours(thisHour.getHours() - i);
        ts1.setMinutes(0);
        matrics[ts1] = ts1;
        matrics[ts1] = {
          time: ts1,
          raid_starting: 0,
          raid_seeking: 0,
          raid_buffering: 0,
          normal_starting: 0,
          normal_seeking: 0,
          normal_buffering: 0,

          raid_starting_samples: 0,
          raid_seeking_samples: 0,
          raid_buffering_samples: 0,
          normal_starting_samples: 0,
          normal_seeking_samples: 0,
          normal_buffering_samples: 0
        }
      }
      if(result.raid && result.raid.starting){
        for(var i=0; i< result.raid.starting.length; i++){
          var ts = result.raid.starting[i]._id;
          ts.setMinutes(0);
          matrics[ts].raid_starting = result.raid.starting[i].duration;
          matrics[ts].raid_starting_samples = result.raid.starting[i].samples;
        }
      }
      if(result.raid && result.raid.seeking){
        for(var i=0; i< result.raid.seeking.length; i++){
          var ts = result.raid.seeking[i]._id;
          ts.setMinutes(0);
          matrics[ts].raid_seeking = result.raid.seeking[i].duration;
          matrics[ts].raid_seeking_samples = result.raid.seeking[i].samples;
        }
      }
      if(result.raid && result.raid.buffering){
        for(var i=0; i< result.raid.buffering.length; i++){
          var ts = result.raid.buffering[i]._id;
          ts.setMinutes(0);
          matrics[ts].raid_buffering = result.raid.buffering[i].duration;
          matrics[ts].raid_buffering_samples = result.raid.buffering[i].samples;
        }
      }
      if(result.normal && result.normal.starting){
        for(var i=0; i< result.normal.starting.length; i++){
          var ts = result.normal.starting[i]._id;
          ts.setMinutes(0);
          matrics[ts].normal_starting = result.normal.starting[i].duration;
          matrics[ts].normal_starting_samples = result.normal.starting[i].samples;
        }
      }
      if(result.normal && result.normal.seeking){
        for(var i=0; i< result.normal.seeking.length; i++){
          var ts = result.normal.seeking[i]._id;
          ts.setMinutes(0);
          matrics[ts].normal_seeking = result.normal.seeking[i].duration;
          matrics[ts].normal_seeking_samples = result.normal.seeking[i].samples;
        }
      }
      if(result.normal && result.normal.buffering){
        for(var i=0; i< result.normal.buffering.length; i++){
          var ts = result.normal.buffering[i]._id;
          ts.setMinutes(0);
          matrics[ts].normal_buffering = result.normal.buffering[i].duration;
          matrics[ts].normal_buffering_samples = result.normal.buffering[i].samples;
        }
      }

    } else if(select === 'm') {
      //monthly
      ts = new Date(thisDay.getTime())
      ts.setMonth(thisHour.getMonth()-1)
      var matrics = {};
      var t1 = (new Date())
      result = {
        raid: {
          starting: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'starting'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          seeking: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'seeking'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          buffering: RAIDTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'buffering'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}])
        },
        normal:{
          starting: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'starting'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          seeking: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'seeking'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}]),
          buffering: NormalTotalQoE.aggregate([{$match:{hour:{$gte:ts},type:'buffering'}},{$group: {_id:'$hour', duration:{$sum:'$duration'},samples:{$sum:'$samples'}}}])
        }
      }
      for(var i=30; i>=0;i--){
        var ts1 = new Date(thisHour.getTime())
        ts1.setDate(thisHour.getDate() - i);
        ts1.setHours(0);
        ts1.setMinutes(0);
        matrics[ts1] = ts1;
        matrics[ts1] = {
          time: ts1,
          raid_starting: 0,
          raid_seeking: 0,
          raid_buffering: 0,
          normal_starting: 0,
          normal_seeking: 0,
          normal_buffering: 0,

          raid_starting_samples: 0,
          raid_seeking_samples: 0,
          raid_buffering_samples: 0,
          normal_starting_samples: 0,
          normal_seeking_samples: 0,
          normal_buffering_samples: 0
        }
      }
      if(result.raid && result.raid.starting){
        for(var i=0; i< result.raid.starting.length; i++){
          var ts = result.raid.starting[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].raid_starting += result.raid.starting[i].duration;
            matrics[ts].raid_starting_samples += result.raid.starting[i].samples;
          }
        }
      }
      if(result.raid && result.raid.seeking){
        for(var i=0; i< result.raid.seeking.length; i++){
          var ts = result.raid.seeking[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].raid_seeking += result.raid.seeking[i].duration;
            matrics[ts].raid_seeking_samples += result.raid.seeking[i].samples;
          }
        }
      }
      if(result.raid && result.raid.buffering){
        for(var i=0; i< result.raid.buffering.length; i++){
          var ts = result.raid.buffering[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].raid_buffering += result.raid.buffering[i].duration;
            matrics[ts].raid_buffering_samples += result.raid.buffering[i].samples;
          }
        }
      }
      if(result.normal && result.normal.starting){
        for(var i=0; i< result.normal.starting.length; i++){
          var ts = result.normal.starting[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].normal_starting += result.normal.starting[i].duration;
            matrics[ts].normal_starting_samples += result.normal.starting[i].samples;
          }
        }
      }
      if(result.normal && result.normal.seeking){
        for(var i=0; i< result.normal.seeking.length; i++){
          var ts = result.normal.seeking[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].normal_seeking += result.normal.seeking[i].duration;
            matrics[ts].normal_seeking_samples += result.normal.seeking[i].samples;
          }
        }
      }
      if(result.normal && result.normal.buffering){
        for(var i=0; i< result.normal.buffering.length; i++){
          var ts = result.normal.buffering[i]._id;
          ts.setHours(0);
          ts.setMinutes(0);
          if( matrics[ts]){
            matrics[ts].normal_buffering += result.normal.buffering[i].duration;
            matrics[ts].normal_buffering_samples += result.normal.buffering[i].samples;
          }
        }
      }
    }
    result = matrics;
    return result;
  },
  setBoxConfig: function(json){
    var doc = peerCollection.findOne({clientID: json.clientID});
    var docId = ""
    var date = new Date();
    console.log(json);
    
    if(doc){
      var docId = doc._id;
    }
    peerCollection.update({
      _id: docId
    },{
      $set: {
        'boxCfgServer.isEnable': json.isEnable,
        // 'boxCfgServer.upload_limit': json.upload_limit,
        // 'boxCfgServer.download_limit':json.download_limit,
        'boxCfgServer.status': 'waiting',
        'boxCfgServer.updatedAt': new Date()
      }
    });
    Commands.insert({
      client_id: json.clientID,
      command: 'config',
      updateBy: date,
      done: false,
      config: json
    });
    // return pusblishBoxSyncConfig(json);
  }

});


function fillIntoResults (results, doc, hour) {
  if(doc && doc.perMinSum) {
    _.each(doc.perMinSum, function(sum, minute) {
      results.push({
        time: hour.getTime() + (minute * 1000 * 60),
        free: sum.free,
        orig: sum.orig,
        raid: sum.raid
      });
    });
  }
}
