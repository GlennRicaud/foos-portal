class FoosPlayerRadarChart extends RcdDivElement {

    constructor(player, stats) {
        super();
        this.player = player;
        this.stats = stats;
        this.canvas = new RcdHtmlElement('canvas').init();
    }

    init() {
        return super.init()
            .addClass('foos-player-radar-chart')
            .addChild(this.canvas)
            .displayChart();
    }

    displayChart() {
        window.chartColors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };
        var color = Chart.helpers.color;
        var stats = this.stats;
        var config = {
            type: 'radar',
            data: {
                labels: ['Attack', 'Defense', 'Stamina', 'Teamwork', 'Goalkeeping'],
                datasets: [{
                    label: this.player.name,
                    backgroundColor: color(window.chartColors.blue).alpha(0.2).rgbString(),
                    borderColor: window.chartColors.blue,
                    pointBackgroundColor: window.chartColors.blue,
                    data: [
                        stats.attack * 100,
                        stats.defense * 100,
                        stats.stamina * 100,
                        stats.teamwork * 100,
                        stats.goalKeeping * 100
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'top',
                    display: false
                },
                title: {
                    display: false
                },
                scale: {
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        };

        new Chart(this.canvas.domElement.getContext('2d'), config);
        return this;
    }


}