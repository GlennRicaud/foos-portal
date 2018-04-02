class FoosRankingColumn extends RcdDivElement {
    constructor(data) {
        super();
        this.playersRankingPanel = new FoosRankingPanel('Players', data.playersData, data.gameDates, data.playersDivisions, 'Player').init();
        this.teamsRankingPanel = new FoosRankingPanel('Teams', data.teamsData, data.gameDates, data.teamsDivisions, 'Team').init();
    }

    init() {
        return super.init().addClass('foos-ranking-column')
            .addChild(this.playersRankingPanel)
            .addChild(this.teamsRankingPanel);
    }
}