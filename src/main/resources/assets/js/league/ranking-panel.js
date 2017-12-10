class FoosRankingPanel extends RcdDivElement {
    constructor(title, ranking, type) {
        super();
        this.title = new RcdTextDivElement(title).init();
        this.ranking = ranking;
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
            .addChild(new RcdThElement().setText('Pts'));
        const tableHeader = new RcdTheadElement().init().addChild(tableHeaderRow);

        const tableBody = new RcdTbodyElement().init();
        this.ranking.map((rankingItem, index) => new RcdTrElement().init()
            .addChild(new RcdTdElement().init().setText(index + 1))
            .addChild(new RcdTdElement().init().addChild(new RcdDivElement().init()
                .addClass('foos-table-cell-name')
                .addChild(new FoosIcon(rankingItem.imageUrl).init())
                .addChild(new RcdTextElement(rankingItem.name).init())))
            .addChild(new RcdTdElement().init().setText(Math.floor(rankingItem.rampedRating)))
        ).forEach((tr) => tableBody.addChild(tr));

        return new RcdTableElement().init()
            .addChild(tableHeader)
            .addChild(tableBody);
    }
}