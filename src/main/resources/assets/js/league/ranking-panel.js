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
    }

    createTable() {
        const tableHeaderRow = new RcdTrElement().init()
            .addChild(new RcdThElement().setText('Pos.'))
            .addChild(new RcdThElement().setText(this.type))
            .addChild(new RcdThElement().setText('Pts.'));
        const tableHeader = new RcdTheadElement().init().addChild(tableHeaderRow);

        const tableBody = new RcdTbodyElement().init();

        Object.keys(this.data).sort((competitorId1,competitorId2) => {
            return this.data[competitorId2].rampedRating - this.data[competitorId1].rampedRating;
        }).map((competitorId, index) => {
            const competitor = this.data[competitorId];
            return new RcdTrElement().init()
                .addChild(new RcdTdElement().init().setText(index + 1))
                .addChild(new RcdTdElement().init().addChild(new RcdDivElement().init()
                    .addClass('foos-table-cell-name')
                    .addChild(new FoosIcon(competitor.imageUrl).init())
                    .addChild(new RcdTextElement(competitor.name).init())))
                .addChild(new RcdTdElement().init().setText(Math.floor(competitor.rampedRating) +
                                                            (competitor.rating === competitor.rampedRating ? '' : ' (' +
                                                            Math.floor(competitor.rating) + ')')))
        }).forEach((tr) => tableBody.addChild(tr));

        return new RcdTableElement().init()
            .addChild(tableHeader)
            .addChild(tableBody);
    }
}