const FoosChartColor = {
    RED: '#F44336',
    PINK: '#E91E63',
    PURPLE: '#9C27B0',
    DEEP_PURPLE: '#673AB7',
    INDIGO: '#3F51B5',
    BLUE: '#2196F3',
    CYAN: '#00BCD4',
    TEAL: '#009688',
    GREEN: '#4CAF50',
    LIGHT_GREEN: '#8BC34A',
    ORANGE: '#FF9800',
    DEEP_ORANGE: '#FF5722',
    BROWN: '#795548',
    GREY: '#9E9E9E',
    BLUE_GREY: '#607D8B'
};
FoosChartColor.VALUES = [
    FoosChartColor.BLUE,
    FoosChartColor.RED,
    FoosChartColor.GREEN,
    FoosChartColor.ORANGE,
    FoosChartColor.PURPLE,
    FoosChartColor.GREY,
    FoosChartColor.INDIGO,
    FoosChartColor.PINK,
    FoosChartColor.LIGHT_GREEN,
    FoosChartColor.DEEP_ORANGE,
    FoosChartColor.DEEP_PURPLE,
    FoosChartColor.BLUE_GREY,
    FoosChartColor.TEAL,
    FoosChartColor.BROWN
];

class FoosRankingChart extends RcdDivElement {

    constructor(data, division, labels) {
        super();
        this.canvas = new RcdHtmlElement('canvas').init();
        this.datasets = division.map(competitorId => data[competitorId])
            .map((competitorData, index) => {
                return {
                    label: competitorData.name,
                    fill: false,
                    borderColor: FoosChartColor.VALUES[index % FoosChartColor.VALUES.length],
                    data: competitorData.ratings,
                    pointRadius: 0
                }
            });
        this.labels = labels;
    }

    init() {
        return super.init()
            .addClass('foos-ranking-chart')
            .addChild(this.canvas)
            .displayChart();
    }

    displayChart() {
        new Chart(this.canvas.domElement.getContext('2d'), {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: this.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return this;
    }


}