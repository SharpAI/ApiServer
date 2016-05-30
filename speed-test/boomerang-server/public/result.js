// Since we don't set a beacon_url, we'll just subscribe to the before_beacon function
// and print the results into the browser itself.
BOOMR.subscribe("before_beacon", function(o) {
	var html = "", t_other, others = [];
	var bandwidth = "";
	if (!o.t_other) {
		o.t_other = "";
	}

	for (var k in o) {
		if (!k.match(/^(t_done|t_other|bw|lat|bw_err|lat_err|u|r2?)$/)) {
			if (k.match(/^t_/)) {
				o.t_other += "," + k + "|" + o[k];
			}
			else {
				others.push(k + " = " + o[k]);
			}
		}
	}

	if (o.t_done) {
		html += "页面加载用时: " + o.t_done + " ms <br>";
	}

	if (o.t_other) {
		t_other = o.t_other.replace(/^,/, "").replace(/\|/g, " = ").split(",");
		html += "Other timers measured: <br>";
		for (var i=0; i<t_other.length; i++) {
			html += "&nbsp;&nbsp;&nbsp;" + t_other[i] + " ms<br>";
		}
	}

	
	var r = document.getElementById("pages");
	r.innerHTML = html;
	
	// 带宽信息
	if(o.u){
		bandwidth += "url = " + o.u +"<br/>";
	}
	if (o.bw) {
		bandwidth += "到服务器的带宽: " + parseInt(o.bw*8/1024) + "kbps (&#x00b1;" + parseInt(o.bw_err*100/o.bw) + "%)<br>";
	}
	
	if (o.lat) {
		bandwidth += "到服务器的延迟:" + parseInt(o.lat) + "&#x00b1;" + o.lat_err + "ms<br>";
	}
	
	if(o.bw_time) {
		bandwidth += "Timestamp (seconds since the epoch) on the user's browser when the bandwidth and latency was measured = " + parseInt(o.bw_time);
	}
	

	var b = document.getElementById("bandwidth");
	b.innerHTML = bandwidth;
	
	// 其它信息
	var other = document.getElementById("others");
	// r.innerHTML = html;
	if (others.length) {
		other.innerHTML += "Other parameters:<br>";

		for (i=0; i<others.length; i++) {
			var t = document.createTextNode(others[i]);
			other.innerHTML += "&nbsp;&nbsp;&nbsp;";
			other.appendChild(t);
			other.innerHTML += "<br>";

		}
	}

});