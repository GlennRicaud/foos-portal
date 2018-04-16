class FoosPlayerSummaryPanel extends RcdDivElement {
    constructor(player) {
        super();
        this.player = player;
        this.title = new RcdH1Element().setText(this.player.name).addClass('foos-name').init();
        this.image = new FoosIcon(this.player.imageUrl)
            .addClass('foos-player-item-image')
            .init();
    }

    init() {
        super.init().addClass('foos-player-summary-panel');
        this.addChild(this.image);
        this.addChild(this.title);
        return this;
    }

}