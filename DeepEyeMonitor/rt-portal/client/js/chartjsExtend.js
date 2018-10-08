Chart.types.Line.extend({
    name: "Line2Y",
    getScale: function(data) {
        var startPoint = this.options.scaleFontSize;
        var endPoint = this.chart.height - (this.options.scaleFontSize * 1.5) - 5;
        return Chart.helpers.calculateScaleRange(
            data,
            endPoint - startPoint,
            this.options.scaleFontSize,
            this.options.scaleBeginAtZero,
            this.options.scaleIntegersOnly);
    },
    initialize: function (data) {
        var y2datasetLabels = [];
        var y2data = [];
        var y1data = [];
        data.datasets.forEach(function (dataset, i) {
            if (dataset.y2axis == true) {
                y2datasetLabels.push(dataset.label);
                y2data = y2data.concat(dataset.data);
            } else {
                y1data = y1data.concat(dataset.data);
            }
        });

        // use the helper function to get the scale for both datasets
        var y1Scale = this.getScale(y1data);
        this.y2Scale = this.getScale(y2data);
        var normalizingFactor = y1Scale.max / this.y2Scale.max;

        // update y2 datasets
        data.datasets.forEach(function(dataset) {
            if (y2datasetLabels.indexOf(dataset.label) !== -1) {
                dataset.data.forEach(function (e, j) {
                    dataset.data[j] = e * normalizingFactor;
                })
            }
        })

        // denormalize tooltip for y2 datasets
        this.options.multiTooltipTemplate = function (d) {
            if (y2datasetLabels.indexOf(d.datasetLabel) !== -1) 
                return Math.round(d.value / normalizingFactor, 6);
            else 
                return d.value;
        }

        Chart.types.Line.prototype.initialize.apply(this, arguments);
    },
    draw: function () {
        this.scale.xScalePaddingRight = this.scale.xScalePaddingLeft;
        Chart.types.Line.prototype.draw.apply(this, arguments);

        this.chart.ctx.textAlign = 'left';
        this.chart.ctx.textBaseline = "middle";
        this.chart.ctx.fillStyle = "#666";
        var yStep = (this.scale.endPoint - this.scale.startPoint) / this.y2Scale.steps
        for (var i = 0, y = this.scale.endPoint, label = this.y2Scale.min; 
             i <= this.y2Scale.steps; 
             i++) {
                this.chart.ctx.fillText(label, this.chart.width - this.scale.xScalePaddingRight + 10, y);
                y -= yStep;
                label += this.y2Scale.stepValue
        }
    }
});