Cookies = {
	check:function(name){
		var c_name = this.get(name);
		if(c_name!=null && c_name != ""){
			return true;
		} else {
			return false;
		}
	},
	set: function(c_name,value,expiredays){
		var exdate=new Date()
		exdate.setDate(exdate.getDate()+expiredays)
		document.cookie=c_name+ "=" +escape(value)+
		((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
	},
	get: function(c_name){
		if (document.cookie.length>0){
			var c_start=document.cookie.indexOf(c_name + "=")
			if (c_start!=-1)
				{ 
				c_start=c_start + c_name.length+1 
				var c_end=document.cookie.indexOf(";",c_start)
				if (c_end==-1) c_end=document.cookie.length
				return unescape(document.cookie.substring(c_start,c_end))
				} 
			}
		return ""
	}
}