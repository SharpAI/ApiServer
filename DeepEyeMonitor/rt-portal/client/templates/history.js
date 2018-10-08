GetDataHistory = function() {
  var historySelect = 'd';
  var freeHistiryTotal = 0;
  var raidHistoryTotal = 0;
  var origHistoryTotal = 0;
  var trafficHistoryAvaliability = 0;
  var free = 0;
  var orig = 0;
  var raid = 0;
  var alival = 0;
  if(!document.getElementById("chart-id-history"))
    return

  if(document.getElementById("historySelect")) {
    historySelect = $('#historySelect option:selected').val()
  }

  Meteor.call('getHistoryChartData', Meteor.userId(), historySelect, function(err, data) {
    if(err) throw err;

    if(!Session.get('currentPage') || Session.get('currentPage') != 'history')
        return;

    var chartData = getHistoryChartData();
    var serverSentDate = new Date(data.ts)
    var  interval=1;
    var timeIndex={}
    var hasData = false
    var idx = 0
    var title = null
    _.each(data.matrics, function(item) {
      var date = new Date(item.time);
      var ts = (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours()

      if(historySelect === 'd') {
        ts = date.getHours() + ":00"
        title = 'Traffic Over the Past 24 Hours (MB)'
      }
      else if(historySelect === 'w') {
        ts = (date.getMonth() + 1) + "/" + date.getDate()
        title = 'Traffic Over the Past Week (MB)'
      }
      else if(historySelect === 'm') {
        ts = (date.getMonth() + 1) + "/" + date.getDate()
        title = 'Traffic Over the Past Month (MB)'
      }
      else if(historySelect === 'y') {
        ts = (date.getMonth() + 1)
        title = 'Traffic Over the Past Year (MB)'
      }
      timeIndex[ts] = idx++
      chartData.labels.push(ts);
      chartData.datasets[0].data.push(0);
      chartData.datasets[1].data.push(0);
      chartData.datasets[2].data.push(0);
      chartData.datasets[3].data.push(0);

      orig = (item.orig)>=0?Math.ceil(item.orig):0;
      raid = (item.raid)>=0?Math.ceil(item.raid):0;
      free = (item.free)>=0?Math.ceil(item.free):0;

      chartData.datasets[0].data[timeIndex[ts]]=orig;
      chartData.datasets[1].data[timeIndex[ts]]=raid;
      chartData.datasets[2].data[timeIndex[ts]]=free;

      origHistoryTotal += orig;
      raidHistoryTotal += raid;
      freeHistiryTotal += free;
      if (free === 0){
        alival = 0;
      } else {
        alival = (free / (orig + raid + free)) * 100;
      }
      
      alival = alival.toFixed(2)
      chartData.datasets[3].data[timeIndex[ts]]=alival;
      hasData=true
    });

    if(hasData){
        trafficHistoryAvaliability = (freeHistiryTotal / (origHistoryTotal + raidHistoryTotal + freeHistiryTotal))*100; 
        trafficHistoryAvaliability = trafficHistoryAvaliability.toFixed(2);
        Session.set('noTrafficData',false)
        Session.set('TrafficHistoryAvaliability',trafficHistoryAvaliability)
        document.getElementById('chartTitle').innerHTML=title
    } else{
        Session.set('noTrafficData',true)
        document.getElementById('chartTitle').innerHTML="No Traffic data"
    }
    var ctx = $("#chart-id-history").get(0).getContext("2d");
    var isFirstTime=true
    if(typeof HistoryChart != "undefined") {
      HistoryChart.destroy();
      isFirstTime=false
    }
    HistoryChart = new Chart(ctx).Line2Y(chartData,{responsive : true,animation: isFirstTime});
    legendHistory(document.getElementById("lineLegend-history"), chartData,HistoryChart);
  });
};
function legendHistory(parent, data) {
    legendHistory(parent, data, null);
}

function legendHistory(parent, data, chart, legendTemplate) {
    legendTemplate = typeof legendTemplate !== 'undefined' ? legendTemplate : "<%=label%>";
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;
    // remove possible children of the parent
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }

    var show = chart ? showTooltipHistory : noop;
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
function showTooltipHistory(chart, elem, indexChartSegment){
    var helpers = Chart.helpers;

    var segments = chart.segments;
    //Only chart with segments
    if(typeof segments != 'undefined'){
        helpers.addEvent(elem, 'mouseover', function(){
            var segment = segments[indexChartSegment];
            segment.save();
            segment.fillColor = segment.highlightColor;
            chart.showTooltipHistory([segment]);
            segment.restore();
        });

        helpers.addEvent(elem, 'mouseout', function(){
            chart.draw();
        });
    }
}

function noop() {}
function getHistoryChartData() {
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
        },
        {
            label: "Efficient Ratio：(%)",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "#000080",
            pointColor: "#000080",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#000080",
            pointHighlightStroke: "#000080",
            data: [],
            y2axis: true
        }
    ]
  };
}

Template.history.rendered = function() {
  if(document.getElementById("historySelect")) {
    $('#historySelect').on('change',function(){
      GetDataHistory();
    })
  }

  document.getElementById('chartTitle').innerHTML="Loading data from server"
  Session.set('noTrafficData','loading')
  GetDataHistory();
  historyInterval = window.setInterval(GetDataHistory, 60* 1000);
};

Template.history.helpers({
  avaliability: function(){
    return Session.get('TrafficHistoryAvaliability') + "%";
  }
});

Template.history.onDestroyed(function (){
  historyInterval = window.clearInterval(historyInterval);
});
