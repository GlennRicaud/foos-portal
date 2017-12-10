class FoosPlayerRankingItem extends RcdDivElement {
    constructor(playerRankingItem, ranking) {
        super();
        this.ranking = new RcdTextDivElement(ranking)
            .addClass('foos-league-item-text')
            .init();
        this.playerName = new RcdTextDivElement(playerRankingItem.playerName)
            .addClass('foos-league-item-text')
            .init();
        this.image = new FoosIcon(playerRankingItem.imageUrl)
            .addClass('foos-league-item-text')
            .init();
        this.rating = new RcdTextDivElement(Math.floor(playerRankingItem.rampedRating))
            .addClass('foos-league-item-text')
            .init();
    }

    init() {
        return super.init()
            .addClass('foos-player-ranking-item')
            .addChild(this.ranking)
            .addChild(this.image)
            .addChild(this.playerName)
            .addChild(this.rating);
    }
}