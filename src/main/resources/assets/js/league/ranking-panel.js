class FoosRankingPanel extends RcdDivElement {
    constructor(title, data, gameDates, divisions, type) {
        super();
        this.title = new RcdTextDivElement(title).init();
        this.data = data;
        this.gameDates = gameDates;
        this.divisions = divisions;
        this.type = type;

        this.currentDivisionIdx = 0;
    }

    init() {
        super.init().addClass('foos-ranking-panel');
        if (this.divisions.length > 1) {
            this.divisionsSelect = new RcdSelectElement().init();
            this.divisions.forEach((division, idx) => {
               this.divisionsSelect.addOption('Division ' + (idx + 1));
            });
            this.addChild(this.divisionsSelect);
        }

        return this.addChild(this.createBody());
    }

    createBody() {
        return new RcdDivElement().init()
            .addClass('foos-ranking-body')
            .addChild(this.createTable())
            .addChild(new FoosRankingChart(this.data, this.getCurrentDivision(), this.gameDates).init())
    }

    createTable() {
        const tableHeaderRow = new RcdTrElement().init()
            .addChild(new RcdThElement().setText('Pos.'))
            .addChild(new RcdThElement().setText(this.type))
            .addChild(new RcdThElement().setText('Rank.<br/>points'))
            .addChild(new RcdThElement().setText('Raw<br/>points'))
            .addChild(new RcdThElement().setText('Period'));
        const tableHeader = new RcdTheadElement().init().addChild(tableHeaderRow);

        const tableBody = new RcdTbodyElement().init();

        this.getCurrentDivision().map((competitorId, index) => {
            const competitor = this.data[competitorId];
            const periodDelta = competitor.ratings[competitor.ratings.length - 1] - competitor.ratings[0];
            const leagueId = RcdHistoryRouter.getParameters().leagueId;
            return new RcdTrElement().init()
                .addChild(new RcdTdElement().init().setText(index + 1))
                .addChild(new RcdTdElement().init().addChild(new RcdDivElement().init()
                    .addClass('foos-table-cell-name')
                    .addChild(new FoosIcon(competitor.imageUrl).init())
                    .addChild(new RcdTextElement(competitor.name).init())
                    .addClickListener(() => RcdHistoryRouter.setState('player', {playerId: competitorId, leagueId: leagueId}))
                ))
                .addChild(new RcdTdElement().init().setText(Math.floor(competitor.rampedRating)))
                .addChild(
                    new RcdTdElement().init().setText(
                        Math.floor(competitor.rampedRating) == competitor.rating ? '-' : '(' + competitor.rating + ')'))
                .addChild(new RcdTdElement().init().setText((periodDelta > 0 ? '+' : '') + periodDelta));
        }).forEach((tr) => tableBody.addChild(tr));

        return new RcdTableElement().init()
            .addChild(tableHeader)
            .addChild(tableBody);
    }

    getCurrentDivision() {
        return this.divisions[this.currentDivisionIdx];
    }
}