class FoosRankingChart extends RcdDivElement {
    constructor() {
        super();
        this.canvas = new RcdHtmlElement('canvas').init();
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
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    fill: false,
                    borderColor: '#002657',
                    data: [0, 10, 5, 2, 20, 30, 45],
                }, {
                    label: "My Second dataset",
                    fill: false,
                    borderColor: '#002657',
                    data: [0, 5, 10, 2, 20, 35, 45],
                }]
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