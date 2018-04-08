function LocalDateTimezone(d, time_offset) {
    if (time_offset == undefined){
        if (d.getTimezoneOffset() == 420){
            time_offset = -7
        }else {
            time_offset = 8
        }
    }
    // 取得 UTC time
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var local_now = new Date(utc + (3600000*time_offset))
    var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
    local_now.getHours(), local_now.getMinutes(), local_now.getSeconds());

    return today_now;
}


function LocalZeroTimezoneTimestamp(d, time_offset) {
    if (time_offset == undefined){
        if (d.getTimezoneOffset() == 420){
            time_offset = -7
        }else {
            time_offset = 8
        }
    }
    // 取得 UTC time
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var local_now = new Date(utc + (3600000*time_offset))
    
    var today_zero = new Date(Date.UTC(local_now.getFullYear(), local_now.getMonth(), local_now.getDate()));
            
    return today_zero.getTime();
}


Router.route( "timelines/add", function() {
    var query   = this.request.query,
        fields  = {};
  
    fields["img_url"] = query.img_url;
    fields["person"] = query.person;
    
    now = new Date()
    localDate = LocalDateTimezone(now, -7);
    localZeroDateTimestamp = LocalZeroTimezoneTimestamp(now, -7)
    
    fields["createdAt"] = now
    fields["time"] = localDate.toLocaleString()
    fields["ZeroTimestamp"] = localZeroDateTimestamp
    
    console.log("query", query)
    console.log("fields", fields)
    TimelineLists.insert(fields);
  
    //console.log("yyyymmdd:", d.toLocaleString(), d.getTime())

    
    this.response.setHeader( 'access-control-allow-origin', '*' );
    this.response.statusCode = 200;
    this.response.end( 'ok' );
}, { where: "server" });