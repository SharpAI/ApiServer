Router.route( "timelines/add", function() {
    var query   = this.request.query,
        fields  = {};

    if (query.group_id == null){
        this.response.setHeader( 'access-control-allow-origin', '*' );
        this.response.statusCode = 200;
        this.response.end( 'Error, groupId not passed' ); 
        return
    }
    
    group = SimpleChat.Groups.findOne({_id:query.group_id});
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
    fields["person"] = query.person;
    fields["groupId"] = query.group_id;
    fields["createdAt"] = now
    fields["time"] = localDate.toLocaleString()
    fields["ZeroTimestamp"] = localZeroDateTimestamp
    
    console.log("group", group)
    console.log("query", query)
    console.log("fields", fields)
  
    TimelineLists.insert(fields);
    
    this.response.setHeader( 'access-control-allow-origin', '*' );
    this.response.statusCode = 200;
    this.response.end( 'ok' );
    
}, { where: "server" });