GetData = function() {
  if(!document.getElementById("chart-id"))
    return;

  Meteor.call('getChartData', Meteor.userId(), function(err, data) {
    if(err) throw err;

    if(!Session.get('currentPage') || Session.get('currentPage') != 'realtime')
        return;

    var chartData = getChartData();
    var serverSentDate = new Date(data.ts)
    console.log(serverSentDate)
      var  interval=1;
      var timeIndex={}
      serverSentDate.setMinutes(serverSentDate.getMinutes() - 59);
      for(var i=0;i<60;i++){
          var ts=serverSentDate.getHours() + ':' + serverSentDate.getMinutes()
          timeIndex[ts]=i
          chartData.labels.push(ts);
          chartData.datasets[0].data.push(0);
          chartData.datasets[1].data.push(0);
          chartData.datasets[2].data.push(0);
          serverSentDate.setMinutes(serverSentDate.getMinutes() + 1);
      }
    var hasData = false
    _.each(data.matrics, function(item) {
      var date = new Date(item.time);
      var timestamp=date.getHours() + ":" + date.getMinutes()
      chartData.datasets[0].data[timeIndex[timestamp]]=(item.orig)>=0?Math.ceil(item.orig):0;
      chartData.datasets[1].data[timeIndex[timestamp]]=(item.raid)>=0?Math.ceil(item.raid):0;
      chartData.datasets[2].data[timeIndex[timestamp]]=(item.free)>=0?Math.ceil(item.free):0;
      hasData=true
    });

    if(hasData){
        Session.set('noTrafficData',false)
        document.getElementById('chartTitle').innerHTML="Real Time Traffic (MB/Min)"
    } else{
        Session.set('noTrafficData',true)
        document.getElementById('chartTitle').innerHTML="No Traffic data in an hour"
    }
    //var ctx = $("#chart-id").get(0).getContext("2d");
    var ctx = document.getElementById("chart-id").getContext("2d");
    var isFirstTime=true
    if(typeof HeartBeatChart != "undefined") {
      HeartBeatChart.destroy();
      isFirstTime=false
    }
      HeartBeatChart = new Chart(ctx).Line(chartData,{responsive : true,animation: isFirstTime});
      legend(document.getElementById("lineLegend"), chartData,HeartBeatChart);
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
function getChartData() {
  return {
    labels: [],
    datasets: [
        {
            label: "Orignal CDN",
            fillColor: "rgba(220,220,220,0)",
            strokeColor: "#FF0000",
            pointColor: "#FF0000",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#FF0000",
            pointHighlightStroke: "#FF0000",
            data: []
        },
        {
            label: "RAID CDN",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "#3CA2E0",
            pointColor: "#3CA2E0",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#3CA2E0",
            pointHighlightStroke: "#3CA2E0",
            data: []
        },
        {
            label: "Free Traffic",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "#008000",
            pointColor: "#008000",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#008000",
            pointHighlightStroke: "#008000",
            data: []
        }
    ]
  };
}

Template.realtime.rendered = function() {
  document.getElementById('chartTitle').innerHTML="Loading data from server"
  Session.set('noTrafficData','loading')
  GetData();
  realTimeInterval = window.setInterval(GetData, 60* 1000);
};
Template.realtime.onDestroyed(function (){
  realTimeInterval = window.clearInterval(realTimeInterval);
});
