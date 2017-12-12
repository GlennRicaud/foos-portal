class FoosRankingChart extends RcdDivElement {
    constructor(data) {
        super();
        this.canvas = new RcdHtmlElement('canvas').init();
        this.datasets = Object.values(data).map(competitorData => {
            return {
                label: competitorData.name,
                fill: false,
                borderColor: '#002657',
                data: competitorData.ratings,
            }
        });
        this.labels = [];
        for (let i = 0; i < 100; i++) {
            this.labels[i]= 'Game' + i;
        }
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
                //maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        });
        return this;
    }


}