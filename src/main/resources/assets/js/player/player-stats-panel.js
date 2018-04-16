class FoosPlayerStatsPanel extends RcdDivElement {
    constructor(stats) {
        super();
        this.stats = stats;
    }

    init() {
        super.init().addClass('foos-player-stats-panel');
        return this.addChild(this.createBody());
    }

    createBody() {
        return new RcdDivElement().init()
        //.addClass('foos-ranking-body')
            .addChild(this.createTable())
    }

    createTable() {
        let stats = this.stats;
        let tableBody = new RcdTbodyElement().init();
        let table = new RcdTableElement().init()
            .addChild(tableBody);

        tableBody
            .addChild(this.newStatRow('Ranking position', this.ordinal(stats.ranking)))
            .addChild(this.newStatRow('Rating points', stats.rating))
            .addChild(this.newStatRow('Games played', stats.gameCount))
            .addChild(this.newStatRow('Games won', this.winningGames()))
            .addChild(this.newStatRow('Goals scored', stats.goalCount))
            .addChild(this.newStatRow('Goals per game', this.goalsPerGame()))
            .addChild(this.newStatRow('Own goals scored', stats.ownGoalCount));
        return table;
    }

    newStatRow(desc, value) {
        let tr = new RcdTrElement().init();
        tr.addChild(new RcdThElement().init().setText(desc));
        tr.addChild(new RcdTdElement().init().setText(value));
        return tr;
    }

    goalsPerGame() {
        let gameCount = this.stats.gameCount;
        let goalCount = this.stats.goalCount;
        return this.formatPercent(goalCount / gameCount);
    }

    winningGames() {
        let gameCount = this.stats.gameCount;
        let winningGameCount = this.stats.winningGameCount;
        return this.formatPercent((winningGameCount / gameCount) * 100) + '%';
    }

    formatPercent(val) {
        return Math.round(val * 100) / 100;
    }

    ordinal(value) {
        if (!value) {
            return '';
        }
        switch (value) {
        case 1:
            return '1st';
        case 2:
            return '2nd';
        case 3:
            return '3rd';
        default:
            return value + 'th';
        }
    }
}