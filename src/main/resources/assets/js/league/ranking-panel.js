class FoosRankingPanel extends RcdDivElement {
    constructor(title, data, type) {
        super();
        this.title = new RcdTextDivElement(title).init();
        this.data = data;
        this.type = type;
    }

    init() {
        return super.init()
            .addClass('foos-ranking-panel')
            .addChild(this.createTable());
        d
    }

    createTable() {
        const tableHeaderRow = new RcdTrElement().init()
            .addChild(new RcdThElement().setText('Pos.'))
            .addChild(new RcdThElement().setText(this.type))
            .addChild(new RcdThElement().setText('Rank.<br/>points'))
            .addChild(new RcdThElement().setText('Raw<br/>points'))
            .addChild(new RcdThElement().setText('Last<br/>game'))
            .addChild(new RcdThElement().setText('Period'));
        const tableHeader = new RcdTheadElement().init().addChild(tableHeaderRow);

        const tableBody = new RcdTbodyElement().init();

        Object.keys(this.data).sort((competitorId1, competitorId2) => {
            return this.data[competitorId2].rampedRating - this.data[competitorId1].rampedRating;
        }).map((competitorId, index) => {
            const competitor = this.data[competitorId];
            const lastGameDelta = competitor.ratings[competitor.ratings.length - 1] - competitor.ratings[competitor.ratings.length - 2];
            const periodDelta = competitor.ratings[competitor.ratings.length - 1] - competitor.ratings[0];
            return new RcdTrElement().init()
                .addChild(new RcdTdElement().init().setText(index + 1))
                .addChild(new RcdTdElement().init().addChild(new RcdDivElement().init()
                    .addClass('foos-table-cell-name')
                    .addChild(new FoosIcon(competitor.imageUrl).init())
                    .addChild(new RcdTextElement(competitor.name).init())))
                .addChild(new RcdTdElement().init().setText(Math.floor(competitor.rampedRating)))
                .addChild(
                    new RcdTdElement().init().setText(
                        Math.floor(competitor.rampedRating) == competitor.rating ? '-' : '(' + competitor.rating + ')'))
                .addChild(new RcdTdElement().init().setText((lastGameDelta > 0 ? '+' : '') + lastGameDelta))
                .addChild(new RcdTdElement().init().setText((periodDelta > 0 ? '+' : '') + periodDelta));
        }).forEach((tr) => tableBody.addChild(tr));

        return new RcdTableElement().init()
            .addChild(tableHeader)
            .addChild(tableBody);
    }
}