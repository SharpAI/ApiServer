
//declare a simple async function
function fastEmailMessge(timeItem, group) {
    var person_valid_lists = []
    var needSendMail = false
    var email_title
    CurrentGroupId = timeItem["groupId"]
//    if (CurrentGroupId == '0a3c12765104f7c9c827f6e5' || CurrentGroupId == '29081bb21c3ac758db07f602'){
    CurrentEmailCompanyName = group.name
    CurrentEmailPersonName = ''
    
    to = group.report_emails 
    people_config = WorkAIUserRelations.find({'group_id':CurrentGroupId}).fetch()

    for (var k in people_config){
	console.log(people_config[k].person_name, people_config[k].hide_it)
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
    }else {
        person_valid_lists.push("unknown")
    }
    person_valid_lists.push('Bobby')
    console.log("group_settings:", group.settings, person_valid_lists, person_valid_lists.includes('unknown'))

    if (to){
        timeItem.personLists = []
        console.log(timeItem["faceId"])
        if (timeItem["faceId"] && timeItem["faceId"] != 'unknown' && timeItem["faceId"] != 'activity'){
            var faceId = timeItem["faceId"].split(",");
            for (i in faceId){
                console.log(faceId[i])
                person = Person.findOne({faceId: faceId[i]})

                if (person){
                    console.log(person)
                    var obj = {
                      'name': person.name,
                      'name_img_url':person.url
                    };
                    timeItem.personLists.push(obj)

                    if (person_valid_lists.includes(person.name)){
                        needSendMail = true
                        if (CurrentEmailPersonName.length > 1){
                            CurrentEmailPersonName = CurrentEmailPersonName + ',' + person.name
                        }else{
                            CurrentEmailPersonName =  person.name
                        }
                    }
                }else if(faceId[i].length > 3){
                    if (person_valid_lists.includes('unknown')){
                        needSendMail = true
                        CurrentEmailPersonName =  '不熟悉的人'
                    }
                }
            }
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'unknown' && person_valid_lists.includes('unknown')){
          needSendMail = true
          CurrentEmailPersonName =  '不熟悉的人'
        }else if (timeItem["faceId"] && timeItem["faceId"] == 'activity' && person_valid_lists.includes('activity')){
          needSendMail = true
          CurrentEmailPersonName =  '一些动静'
        }

        if(needSendMail){
            email_title = CurrentEmailCompanyName + '观察到了' + CurrentEmailPersonName
            
            console.log("send MQTT ...")
            send_motion_mqtt_msg(timeItem["img_url"],timeItem["uuid"],email_title, group)
            CurrentTimeItem = timeItem
            
            console.log("prepare Email Template ...")
            var html = SSR.render("srvemailTemplateFast");
            console.log(group._id, group.report_emails);

            var from = 'DeepEye<notify@mail.tiegushi.com>';
            console.log("send Email ...")
            
            
            to= 'hzhu@actiontec.com'
            Email.send({
                to: to,
                from: from,
                subject: email_title,
                html: html
            });
        }
    }
//    }
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

    console.log("group", group)
    
    console.log("fields", fields)

    TimelineLists.insert(fields);

    this.response.setHeader( 'access-control-allow-origin', '*' );
    this.response.statusCode = 200;
    this.response.end( 'ok' );

}, { where: "server" });
