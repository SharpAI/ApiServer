
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

    // fastEmailMessge(fields, group);
    sendMessage(fields,group);

    //console.log("group", group)
    //console.log("fields", fields)

    TimelineLists.insert(fields);

    this.response.setHeader( 'access-control-allow-origin', '*' );
    this.response.statusCode = 200;
    this.response.end( 'ok' );

}, { where: "server" });



function sendEmailMessageByGroupUser(timeItem,group_user){
    var person_valid_lists = []
    var needSend = false
    // var email_title
    var pushOn = false
    var emailOn = false
    var CurrentGroupId = timeItem["groupId"]
    // to = group.report_emails
    people_config = WorkAIUserRelations.find({'group_id':CurrentGroupId}).fetch()

    for (var k in people_config){
        if(!group_user.settings || !group_user.settings.not_notify_acquaintance){
            person_valid_lists.push(people_config[k].person_name)
        }else if(!_.contains(group_user.settings.not_notify_acquaintance,people_config[k]._id)){
            person_valid_lists.push(people_config[k].person_name)
        }
    }

    //stranger valid
    if (group_user.settings){
        if (group_user.settings.notify_stranger == undefined || group_user.settings.notify_stranger == true){
            person_valid_lists.push("unknown")
        }
        if (group_user.settings.report == undefined ||group_user.settings.report == true){
            person_valid_lists.push("activity")
        }
        if (group_user.settings.push_notificoatin == undefined || group.settings.push_notification == true){
            pushOn = true
        }
        if (group_user.settings.real_time_email == undefined || group.settings.real_time_email == true){
            emailOn = true
        }
    }else {
        person_valid_lists.push("unknown");
        person_valid_lists.push("activity");
        pushOn = true;
        emailOn = true;
    }
    // var to = Meteor.users.findOne({_id:group_user.user_id});
    // if (to && to.emails && to.emails[0]){
        if (timeItem["faceId"] && timeItem["faceId"] != 'unknown' && timeItem["faceId"] != 'activity'){
            for (person in timeItem.personLists){
                    if ( person_valid_lists.includes(person.name)){
                        needSend = true
                    }else if(person.name == '陌生人'){
                    if (person_valid_lists.includes('unknown')){
                        needSend = true
                    }
                }
            }
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'unknown' && person_valid_lists.includes('unknown')){
            needSend = true
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'activity' && person_valid_lists.includes('activity')){
            needSend = true
        }
        if(needSend && emailOn){
            return group_user.report_emails 
        }
    // }
}
function sendMessage(timeItem,group){
    var EmailPersonName = ''
    var MQTTPersonName = ''
    var email_title
    var EmailCompanyName = group.name
    var show_type
    timeItem.personLists = []
    if (timeItem["faceId"] && timeItem["faceId"] != 'unknown' && timeItem["faceId"] != 'activity'){
        var faceId = timeItem["faceId"].split(",");
            for (i in faceId){
                person = Person.findOne({faceId: faceId[i]})
                if (person){
                    var obj = {
                      'name': person.name,
                      'name_img_url':person.url,
                      'faceId':faceId[i]
                    };
                    timeItem.personLists.push(obj)
                }else{
                    var obj = {
                        'name': '陌生人',
                        'name_img_url':'',
                        'faceId':faceId[i]
                      };
                      timeItem.personLists.push(obj)
                }
            }
    }
    if (timeItem["faceId"] && timeItem["faceId"] != 'unknown' && timeItem["faceId"] != 'activity'){
        for (person in timeItem.personLists){
                if ( person.name != '陌生人'){
                    MQTTPersonName = '有人活动'
                    var p = WorkAIUserRelations.findOne({'group_id':group._id,'person_name':person.name})
                    if(p){
                        if(show_type.length > 1){
                            show_type = show_type+','+p._id;
                        }else{
                            show_type = p.id
                        }         
                    }    
                }else {
                    MQTTPersonName = '有陌生人活动'
                    show_type = 'unknown'
                }
                if (EmailPersonName.length > 1){
                    EmailPersonName = EmailPersonName + ',' + person.name
                }else{
                    EmailPersonName =  person.name
                }
        }
    }else if (timeItem["faceId"] && timeItem["faceId"] == 'unknown'){
        MQTTPersonName = '有陌生人活动'
        EmailPersonName =  '有陌生人活动'
        show_type = 'unknown'
    }else if (timeItem["faceId"] && timeItem["faceId"] == 'activity'){
        MQTTPersonName = '有人活动'
        MQTTPersonName = '有人活动'
        show_type = 'activity'
    }
    email_title = EmailCompanyName + ' AI发现' + EmailPersonName
    var mqtt_title = 'AI发现' + MQTTPersonName
    timeItem["email_title"] = email_title
    send_motion_mqtt_msg(timeItem["img_url"],timeItem["uuid"],mqtt_title, group,show_type)

    groupUsers = SimpleChat.GroupUsers.find({group_id:group._id,is_device:{$ne:true}}).fetch()
    var ret_timeLists = []
    timeItem["company_name"] = EmailCompanyName
    timeItem["person_name"] = EmailPersonName
    ret_timeLists.push(timeItem)
    var to = [];
    for(var i in groupUsers){
        var address = sendEmailMessageByGroupUser(timeItem,groupUsers[i])
        if(address){
            to.push(address);
        }
    }
    var html = SSR.render("srvemailTemplateFast", {company_name:EmailCompanyName, person_name:EmailPersonName, timeLinelists:ret_timeLists});
    var from = 'DeepEye<notify@email.tiegushi.com>';
    this.unblock();
    Email.send({
        to: to.toString(),
        from: from,
        subject: email_title,
        html: html
    });
}