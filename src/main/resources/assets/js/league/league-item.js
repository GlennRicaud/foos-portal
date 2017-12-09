class FoosLeagueItem extends RcdDivElement {
    constructor(league) {
        super();
        this.image = new FoosIcon(league.imageUrl)
            .addClass('foos-league-item-image')
            .init();
        this.text = new RcdTextDivElement(league.name)
            .addClass('foos-league-item-text')
            .init();
    }
    
    init() {
        return super.init()
            .addClass('foos-league-item')
            .addChild(this.image)
            .addChild(this.text);
    }
}