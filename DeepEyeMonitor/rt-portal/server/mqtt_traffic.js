/**
 * Created by simba on 4/15/16.
 */
Meteor.startup(function () {
    if(process.env.LISTEN_ON_REMOTE_DB){
        console.log("Don't push traffic data to server since we already have a cloud host to update database.")
        return
    }
    var mqtt_broker = process.env.MQ_URL || 'mqtt://rpcserver.raidcdn.com';
    // var mqtt_broker = process.env.MQ_URL || 'ws://shatarpcserver.raidcdn.com:80';
    
    var sina_iplookup_server = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
    function update_traffic(json){

        // get the current hour based on the time
        var now = new Date();
        var hourTime = GetHour(now);

        // selector for document for the currentHour for the given user
        var selector = {
            hour: hourTime,
            token: json.token
        };

        // modifier to increment few different fields
        var minute = now.getUTCMinutes();
        var modifier = {
            $inc: {
                hourFree: json.free,
                hourOrig: json.orig,
                hourRaid: json.raid,
                hourSamples: 1
            }
        };
        modifier["$inc"]["perMinSum." + minute+'.free'] = json.free;
        modifier["$inc"]["perMinSum." + minute+'.orig'] = json.orig;
        modifier["$inc"]["perMinSum." + minute+'.raid'] = json.raid;
        modifier["$inc"]["perMinSamples." + minute] = 1;

        // upsert the document
        Metrics.update(selector, modifier, {upsert: true});
    }
    function update_total_traffic(json){

        // selector for document for the currentHour for the given user
        var selector = {
            token: json.token
        };

        var modifier = {
            $inc: {
                free: json.free,
                orig: json.orig,
                raid: json.raid
            }
        };

        // upsert the document
        TotalTraffic.update(selector, modifier, {upsert: true});
    }
    function update_allbox_traffic(json) {
        var now = new Date();
        var hourTime = GetHour(now);
        var selector = {
            hour: hourTime
        };
        var minute = now.getUTCMinutes();
        var seconds = now.getUTCSeconds();
        var info = json.global_info;

        var upload_speed = (info && info.upload_speed && info.upload_speed>0) ? info.upload_speed : 0;
        var download_speed = (info && info.download_speed && info.download_speed>0) ? info.download_speed : 0;
        var cdn_speed = (info && info.cdn_speed && info.cdn_speed>0) ? info.cdn_speed : 0;
        var p2p_speed = (info && info.p2p_speed && info.p2p_speed>0) ? info.p2p_speed : 0;
        var cdn_downloaded = (info && info.cdnDownloaded_delta && info.cdnDownloaded_delta>0) ? info.cdnDownloaded_delta : 0;
        var p2p_downloaded = (info && info.p2pDownloaded_delta && info.p2pDownloaded_delta>0) ? info.p2pDownloaded_delta : 0;
        var uploaded = (info && info.uploaded_delta && info.uploaded_delta>0) ? info.uploaded_delta : 0;

        var modifier = {
            $inc: {
                hour_upload_speed: upload_speed,
                hour_download_speed: download_speed,
                hour_cdn_speed: cdn_speed,
                hour_p2p_speed: p2p_speed,
                hour_cdn_downloaded: cdn_downloaded,
                hour_p2p_downloaded: p2p_downloaded,
                hour_uploaded: uploaded
            }
        }

        modifier["$inc"]["perMinSum." + minute +'.upload_speed'] = upload_speed;
        modifier["$inc"]["perMinSum." + minute +'.download_speed'] = download_speed;
        modifier["$inc"]["perMinSum." + minute +'.cdn_speed'] = cdn_speed;
        modifier["$inc"]["perMinSum." + minute +'.p2p_speed'] = p2p_speed;
        modifier["$inc"]["perMinSum." + minute +'.cdn_downloaded'] = cdn_downloaded;
        modifier["$inc"]["perMinSum." + minute +'.p2p_downloaded'] = p2p_downloaded;
        modifier["$inc"]["perMinSum." + minute +'.uploaded'] = uploaded;
        modifier["$inc"]["perMinSamples." + minute] = 1;
        AllBoxTraffic.update(selector, modifier, {upsert: true});
    }
    function update_box_monitor_traffic(json) {
        var now = new Date();
        var hourTime = GetHour(now);
        var selector = {
            hour: hourTime,
            clientID: json.clientID
        };
        var minute = now.getUTCMinutes();
        var seconds = now.getUTCSeconds();
        var info = json.global_info;

        var upload_speed =   (info && info.upload_speed && info.upload_speed>0) ? info.upload_speed : 0;
        var download_speed = (info && info.download_speed && info.download_speed>0) ? info.download_speed : 0;
        var cdn_speed =      (info && info.cdn_speed && info.cdn_speed>0) ? info.cdn_speed : 0;
        var p2p_speed =      (info && info.p2p_speed && info.p2p_speed>0) ? info.p2p_speed : 0;
        var cdn_downloaded = (info && info.cdnDownloaded_delta && info.cdnDownloaded_delta>0) ? info.cdnDownloaded_delta : 0;
        var p2p_downloaded = (info && info.p2pDownloaded_delta && info.p2pDownloaded_delta>0) ? info.p2pDownloaded_delta : 0;
        var uploaded =       (info && info.uploaded_delta && info.uploaded_delta>0) ? info.uploaded_delta : 0;

        var modifier = {
            $inc: {
                hour_upload_speed: upload_speed,
                hour_download_speed: download_speed,
                hour_cdn_speed: cdn_speed,
                hour_p2p_speed: p2p_speed,
                hour_cdn_downloaded: cdn_downloaded,
                hour_p2p_downloaded: p2p_downloaded,
                hour_uploaded: uploaded
            }
        }
        modifier["$inc"]["perMinSum." + minute +'.upload_speed'] = upload_speed;
        modifier["$inc"]["perMinSum." + minute +'.download_speed'] = download_speed;
        modifier["$inc"]["perMinSum." + minute +'.cdn_speed'] = cdn_speed;
        modifier["$inc"]["perMinSum." + minute +'.p2p_speed'] = p2p_speed;
        modifier["$inc"]["perMinSum." + minute +'.cdn_downloaded'] = cdn_downloaded;
        modifier["$inc"]["perMinSum." + minute +'.p2p_downloaded'] = p2p_downloaded;
        modifier["$inc"]["perMinSum." + minute +'.uploaded'] = uploaded;
        modifier["$inc"]["perMinSamples."+ minute] = 1;
        modifier["$inc"]["samples"] = 1;
        boxMonitorTraffic.update(selector, modifier, {upsert: true});
    }
    function update_total_qoe(json){
        if(!json || !json.token || !json.url || !json.type) {
            console.log('update_total_qoe invalid arg')
            return;
        }

        var now = new Date();
        var hourTime = GetHour(now);
        var selector = {
            hour: hourTime,
            type: json.type
        };

        var minute = now.getUTCMinutes();
        var seconds = now.getUTCSeconds();
        var modifier = {
            $inc: {
                duration:json.duration,
                samples:1
            }
        }
        modifier["$inc"]["perMinSum." + minute +'.duration'] = json.duration;
        modifier["$inc"]["perMinSamples." + minute] = 1;

        // selector for document for the currentHour for the given user
        /*
        var now = new Date();
        var hourTime = GetHour(now);
        var selector = {
            token: json.token,
            url: json.url,
            type: json.type,
            raidcdn: json.raidcdn,
            hour: hourTime
        };

         var modifier = {
             $inc: {
             sum_dura: json.duration,
             cnt: 1
             }
         };
        */

        // upsert the document
        if(json.raidcdn){
            RAIDTotalQoE.update(selector, modifier, {upsert: true});
        } else {
            NormalTotalQoE.update(selector, modifier, {upsert: true});
        }
    }

    function update_raidinfo_logs(json){
        json.createdAt = Date.now();
        RaidInfoLogs.insert(json);
    }
    pusblishBoxSyncConfig = function (json){
        client.publish('boxSyncConfig',JSON.stringify(json), {qos:1});
    };

    console.log('Mqtt Broker '+mqtt_broker);
    client = mqtt.connect(mqtt_broker);
    client.on('connect',function(connected){
        if(!connected){
            console.log('connect failed: ')
            return;
        }
        console.log('connect success');
        client.subscribe('rt_browser_traffic', {qos:1});
        client.subscribe('zhifayun_info', {qos:1});
        client.subscribe('RemoteCMDResp', {qos:1});
        client.subscribe('qoe', {qos:1});
        client.subscribe('raidinfo', {qos:1});

    });
    client.on('message',Meteor.bindEnvironment(function(topic,message){
        // console.log('Got message :'+topic);
        if(topic == 'rt_browser_traffic'){
            var json=JSON.parse(message)
            if(json.free>20)
            console.log('Got message '+message);
            update_traffic(json)
            update_total_traffic(json)
        }
        if(topic == 'zhifayun_info') {
            var json=JSON.parse(message);
            update_allbox_traffic(json);
            update_box_monitor_traffic(json);
            json.updateBy = new Date();
            var peerData = peerCollection.findOne({clientID: json.clientID});
            var timeDiff = 1000 * 60 * 10;
            if(peerData && peerData.boxCfgServer){
                json.boxCfgServer = peerData.boxCfgServer;
                if(json.boxCfg && json.boxCfg.upload_limit === peerData.boxCfgServer.upload_limit && json.boxCfg.download_limit === peerData.boxCfgServer.download_limit && json.boxCfg.isEnable === peerData.boxCfgServer.isEnable){
                    peerData.boxCfgServer.status = 'done';
                    json.boxCfgServer.updatedAt = json.updateBy;
                } else {
                    if(peerData.boxCfgServer.updatedAt && (json.updateBy.getTime() - peerData.boxCfgServer.updatedAt.getTime()) > timeDiff){
                        // box config timeout = 10minutes 
                        peerData.boxCfgServer.status = 'done';
                        json.boxCfgServer.updatedAt = json.updateBy;
                    } else {
                        // tell box to update config
                        peerData.boxCfgServer.status = 'waiting';
                        peerData.boxCfgServer.clientID = json.clientID;
                        pusblishBoxSyncConfig(peerData.boxCfgServer);
                    }
                }
            }
            if(json.externalIp == '' || !json.externalIp){
                // console.log('ip addr is null, skip update ip');
                delete json.externalIp;
            } else {
                // update ip addr change
                var ipAddrUrl = sina_iplookup_server + json.externalIp;
                HTTP.get(ipAddrUrl,function(err,res){
                    var ipAddress = ''
                    if(!err && res.statusCode == 200){
                        if(res.data.country === '中国'){
                            if(res.data.province === res.data.city){
                                ipAddress += res.data.city;
                            } else {
                                ipAddress += res.data.province + ' '+res.data.city;
                            }
                        } else {
                            ipAddress += res.data.country + ' ' +res.data.province + ' '+res.data.city;
                        }
                        // console.log("ipAddress==="+ipAddress);
                        peerCollection.update({clientID:json.clientID},{$set:{location:ipAddress}});
                        
                    } else {
                        console.log('statusCode='+res.statusCode+',err='+err)
                    }
                });
            }
            peerCollection.update({clientID:json.clientID},{$set:json},{upsert:true});
        } 
        if(topic == 'RemoteCMDResp'){
            console.log('Got RemoteCMDResp '+message);
            var resp = JSON.parse(message);
            console.log('got peer '+peerCollection.find({peerId:peerInfo.peerId}).count());
            var peerData = peerCollection.findOne({clientID:resp.clientID});
            if(peerData){
                peerCollection.update({_id:peerData._id},{$set:{cmdResp:resp.cmdResp}});
            }
        }
        if(topic == 'qoe'){
            var json=JSON.parse(message)
            //console.log('qoe Got message :' + message);
            update_total_qoe(json);
        }
        if(topic == 'raidinfo') {
            // console.log('Got logs mqtt message '+message);
            var json = JSON.parse(message);
            update_raidinfo_logs(json);
        }
    }));
});
