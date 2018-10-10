GetData = function() {
  if(!document.getElementById("chart-id"))
    return;
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
  //document.getElementById('chartTitle').innerHTML="Loading data from server"
  //Session.set('noTrafficData','loading')
  //GetData();
  //realTimeInterval = window.setInterval(GetData, 60* 1000);
};
Template.realtime.onDestroyed(function (){
  //realTimeInterval = window.clearInterval(realTimeInterval);
});
