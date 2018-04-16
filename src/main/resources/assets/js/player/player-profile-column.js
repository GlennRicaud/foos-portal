class FoosPlayerProfileColumn extends RcdDivElement {
    constructor(data) {
        super();
        this.playerSummaryPanel = new FoosPlayerSummaryPanel(data.playerProfile.player).init();
        this.playerStatsPanel = new FoosPlayerStatsPanel(data.playerProfile.stats).init();
        this.playerRadarChar = new FoosPlayerRadarChart(data.playerProfile.player, data.playerProfile.stats).init();
    }

    init() {
        let div = new RcdDivElement().init()
            .addClass('foos-player-profile-row')
            .addChild(this.playerStatsPanel)
            .addChild(this.playerRadarChar);

        return super.init().addClass('foos-player-profile-column')
            .addChild(this.playerSummaryPanel)
            .addChild(div);
    }
}