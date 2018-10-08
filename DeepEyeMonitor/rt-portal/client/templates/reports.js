if(Meteor.isClient){
	Template.reports.rendered = function(){
		if(Session.get("animateChild")){
			$(".reports-page").addClass("ng-enter");
			setTimeout(function(){
				$(".reports-page").addClass("ng-enter-active");
			}, 300);
			setTimeout(function(){
				$(".reports-page").removeClass("ng-enter");
				$(".reports-page").removeClass("ng-enter-active");
			}, 600);
		}
	};
}

window.totalTrafficPieOption =  {
    title : {show: false},
		color:  ['#ff0000', '#3ca2e0', '#008000'],
    tooltip : {
        trigger: 'item',
        formatter: '<div class="totalTrafficTooltip"><h4>{b}</h4> <p>Usage : {c} (MB) </p><p>Percent : {d}%</p></div>'
    },
    legend: {
        orient : 'vertical',
        x : 'left',
				y: 'bottom',
				borderColor:'#ddd',
				borderWidth: 1,
				backgroundColor: '#eee',
				padding: [10,20],			
				textStyle:{
					color: '#000',
					fontSize: 14
				},
        data:['Orignal CDN','RAID CDN','Free Traffic']
    },
    toolbox: {show : false},
    calculable : true,
    series : [
        {
            name:'Total Usage',
            type:'pie',
            radius : '75%',
            center: ['50%', '50%'],
            data:[]
        }
    ]
};

 resizeChartContainer = function(container, target){
		var H = $(container).height() - 200;
		document.getElementById(target).style.height =  H + 'px';
};

GetTotalData = function() {
	if(!document.getElementById("totalTrafficPie"))
		return;
	if(!window.totalTrafficPieChart){
		window.totalTrafficPieChart = echarts.init(document.getElementById('totalTrafficPie'),'macarons');
	}
	Meteor.call('getTotalData', Meteor.userId(), function(err, data) {
		if(err) throw err;

		if(!Session.get('currentPage') || Session.get('currentPage') != 'reports')
			return;
		totalTrafficPieOption.series[0].data[0] = {value: data.orig, name: 'Orignal CDN'};
		totalTrafficPieOption.series[0].data[1] = {value: data.raid, name: 'RAID CDN'};
		totalTrafficPieOption.series[0].data[2] = {value: data.free, name: 'Free Traffic'};

		totalTrafficPieChart.setOption(totalTrafficPieOption);

		
		// var pieData = getPieData(data);
		// var isFirstTime=true
		// //var ctx = $("#pie-id").get(0).getContext("2d");
    //             var ctx = document.getElementById("pie-id").getContext("2d");
		// if(typeof pieChart != "undefined") {
		// 	pieChart.destroy();
		// 	isFirstTime=false
		// }
		// pieChart = new Chart(ctx).Pie(pieData,{responsive : true,animation: isFirstTime});
		// legend(document.getElementById("pieLegend"), pieData,pieChart);
	});
};
function legend(parent, data) {
	legend(parent, data, null);
}

function legend(parent, data, chart, legendTemplate) {
	legendTemplate = typeof legendTemplate !== 'undefined' ? legendTemplate : "<%=label%>";
	parent.className = 'legend';
	var datas = data.hasOwnProperty('datasets') ? data.datasets : data;
	// remove possible children of the parent
	while(parent.hasChildNodes()) {
		parent.removeChild(parent.lastChild);
	}

	var show = chart ? showTooltip : noop;
	datas.forEach(function(d, i) {

		//span to div: legend appears to all element (color-sample and text-node)
		var title = document.createElement('div');
		title.className = 'title';
		parent.appendChild(title);

		var colorSample = document.createElement('div');
		colorSample.className = 'color-sample';
		colorSample.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
		colorSample.style.borderColor = d.hasOwnProperty('fillColor') ? d.fillColor : d.color;
		title.appendChild(colorSample);
		legendNode=legendTemplate.replace("<%=value%>",d.value);
		legendNode=legendNode.replace("<%=label%>",d.label);
		var text = document.createTextNode(legendNode);
		text.className = 'text-node';
		title.appendChild(text);

		show(chart, title, i);
	});
}

//add events to legend that show tool tips on chart
function showTooltip(chart, elem, indexChartSegment){
	var helpers = Chart.helpers;

	var segments = chart.segments;
	//Only chart with segments
	if(typeof segments != 'undefined'){
		helpers.addEvent(elem, 'mouseover', function(){
			var segment = segments[indexChartSegment];
			segment.save();
			segment.fillColor = segment.highlightColor;
			chart.showTooltip([segment]);
			segment.restore();
		});

		helpers.addEvent(elem, 'mouseout', function(){
			chart.draw();
		});
	}
}

function noop() {}
function getPieData(data) {
	return[
		{
			value: data.orig,
			color:"#FF0000",
			highlight: "#FF0000",
			label: "Orignal CDN"
		},
		{
			value: data.raid,
			color: "#3CA2E0",
			highlight: "#3CA2E0",
			label: "RAID CDN"
		},
		{
			value: data.free,
			color: "#008000",
			highlight: "#008000",
			label: "Free Traffic"
		}];
}

Template.reports.rendered = function() {
        Session.set('currentPage','reports')

	resizeChartContainer('.reports-page','totalTrafficPie');
	window.onresize = function () {
      resizeChartContainer('.reports-page','totalTrafficPie');
			if(window.totalTrafficPieChart){
				totalTrafficPieChart.resize();
			}
	};

	GetTotalData();
	setInterval(GetTotalData, 30* 1000);

	/*var data = [
		{
			value: 300,
			color:"#FF0000",
			highlight: "#FF0000",
			label: "Orignal CDN"
		},
		{
			value: 50,
			color: "#3CA2E0",
			highlight: "#3CA2E0",
			label: "RAID CDN"
		},
		{
			value: 100,
			color: "#008000",
			highlight: "#008000",
			label: "Free Traffic"
		}
	]*/
// For a pie chart
	//var ctx = $("#pie-id").get(0).getContext("2d");
	//var myPieChart = new Chart(ctx).Pie(data,{responsive:true});
	//legend(document.getElementById("pieLegend"), data,myPieChart);

};

Template.reports.onDestroyed(function(){
	window.totalTrafficPieChart = null;
});