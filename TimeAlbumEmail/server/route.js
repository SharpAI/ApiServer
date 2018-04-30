
//declare a simple async function
function fastEmailMessge(timeItem, group) {
    var person_valid_lists = []
    var needSend = false
    var email_title
    var pushOn = false
    var emailOn = false
    var CurrentGroupId = timeItem["groupId"]
    var EmailCompanyName = group.name
    var EmailPersonName = ''
    var MQTTPersonName = ''
    
    to = group.report_emails
    people_config = WorkAIUserRelations.find({'group_id':CurrentGroupId}).fetch()

    for (var k in people_config){
	//console.log(people_config[k].person_name, people_config[k].hide_it)
       if (people_config[k].hide_it == undefined || people_config[k].hide_it ==  false){
           person_valid_lists.push(people_config[k].person_name)
       }
    }

    //stranger valid
    if (group.settings){
        if (group.settings.notify_stranger == true){
            person_valid_lists.push("unknown")
        }
        if (group.settings.report == true){
            person_valid_lists.push("activity")
        }
        if (group.settings.push_notification == undefined || group.settings.push_notification == true){
            pushOn = true
        }
        if (group.settings.real_time_email == undefined || group.settings.real_time_email == true){
            emailOn = true
        }
    }else {
        person_valid_lists.push("unknown")
    }
    
    // person_valid_lists.push('Bobby') //debug
    // person_valid_lists.push('unknown') //debug
    // person_valid_lists.push('activity') //debug

    //console.log("group_settings:", group.settings, person_valid_lists, person_valid_lists.includes('unknown'))

    if (to){
        timeItem.personLists = []
        
        if (timeItem["faceId"] && timeItem["faceId"] != 'unknown' && timeItem["faceId"] != 'activity'){
            var faceId = timeItem["faceId"].split(",");
            for (i in faceId){
                person = Person.findOne({faceId: faceId[i]})
                if (person){
                    var obj = {
                      'name': person.name,
                      'name_img_url':person.url
                    };
                    timeItem.personLists.push(obj)

                    if ( person_valid_lists.includes(person.name) && checkIfSendEvent(group._id,faceId[i])){
                        needSend = true
                        if (EmailPersonName.length > 1){
                            EmailPersonName = EmailPersonName + ',' + person.name
                        }else{
                            EmailPersonName =  person.name
                        }
                        MQTTPersonName = '有人活动'
                    }
                } else if(faceId[i].length > 3){
                    if (person_valid_lists.includes('unknown')){
                      if(checkIfSendEvent(group._id,'unknown')){
                        needSend = true
			            if (EmailPersonName.length > 1){
                            EmailPersonName = EmailPersonName + ',陌生人'
                        }else{
                            EmailPersonName =  '陌生人'
                        } 
                        MQTTPersonName = '有陌生人活动'
                      }
                    }
                }
            }
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'unknown' && person_valid_lists.includes('unknown')){
          if(checkIfSendEvent(group._id,'unknown')){
            needSend = true
            EmailPersonName =  '有陌生人活动'
            MQTTPersonName = '有陌生人活动'
          }
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'activity' && person_valid_lists.includes('activity')){
          if(checkIfSendEvent(group._id,'activity')){
            needSend = true
            EmailPersonName =  '有人活动'
            MQTTPersonName = '有人活动'
          }
        }
        
        email_title = EmailCompanyName + ' AI发现' + EmailPersonName
        var mqtt_title = 'AI发现' + MQTTPersonName
        console.log("SETTING:", group.settings, pushOn, emailOn, needSend)
        
        if(needSend && pushOn){
            console.log("send MQTT ...", mqtt_title)
            send_motion_mqtt_msg(timeItem["img_url"],timeItem["uuid"],mqtt_title, group)
        }
        
        timeItem["email_title"] = email_title
        if(needSend && emailOn){
            console.log("Send Email ...", email_title)
            var ret_timeLists = []
            timeItem["company_name"] = EmailCompanyName
            timeItem["person_name"] = EmailPersonName
            ret_timeLists.push(timeItem)

            var html = SSR.render("srvemailTemplateFast", {company_name:EmailCompanyName, person_name:EmailPersonName, timeLinelists:ret_timeLists});
            console.log(group._id, group.report_emails);

            var from = 'DeepEye<notify@email.tiegushi.com>';
            
            //to= 'hzhu@actiontec.com' //debug

            Email.send({
                to: to,
                from: from,
                subject: email_title,
                html: html
            });
        }
    }
}



Router.route( "timelines/add", function() {
    var query   = this.request.query,
        fields  = {};

    console.log("query", query)
    if (query.group_id == null){
        this.response.setHeader( 'access-control-allow-origin', '*' );
        this.response.statusCode = 200;
        this.response.end( 'Error, groupId not passed' );
        return
    }

    group = SimpleChat.Groups.findOne({_id: query.group_id});
    if (group == null){
        this.response.setHeader( 'access-control-allow-origin', '*' );
        this.response.statusCode = 200;
        this.response.end( 'Error, group not exist' );
        return
    }

    now = new Date()
    localDate = LocalDateTimezone(now, group.offsetTimeZone);
    localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, group.offsetTimeZone)

    fields["img_url"] = query.img_url;
    fields["groupId"] = query.group_id;
    fields["uuid"] = query.uuid;
    fields["faceId"] = query.faceid;
    fields["cameraId"] = query.cameraId
    fields["createdAt"] = now
    fields["time"] = localDate.toLocaleString()
    fields["ZeroTimestamp"] = localZeroDateTimestamp

    fastEmailMessge(fields, group);

    //console.log("group", group)
    //console.log("fields", fields)

    TimelineLists.insert(fields);

    this.response.setHeader( 'access-control-allow-origin', '*' );
    this.response.statusCode = 200;
    this.response.end( 'ok' );

}, { where: "server" });
