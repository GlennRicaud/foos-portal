class FoosLeagueView extends RcdDivElement {
    constructor() {
        super();
    }

    init() {
        return super.init()
            .addClass('foos-league-view')
            .registerRoute();
    }

    registerRoute() {
        RcdHistoryRouter.addRoute('league', () => {
            this.refresh().then(() => {
                FoosMain.clear().addChild(this);
            });
        });
        return this;
    }

    refresh() {
        this.clear();
        return this.retrieveData().then(data => {
            //const playersRankingPanel = new FoosRankingPanel('Players', data.playersData, 'Player').init();
            const teamsRankingPanel = new FoosRankingPanel('Teams', data.teamsData, 'Team').init();
            //this.addChild(playersRankingPanel);
            this.addChild(teamsRankingPanel);
            //this.addChild(new FoosRankingChart(data.playersData, data.gameDates).init());
            this.addChild(new FoosRankingChart(data.teamsData, data.gameDates).init());
        });
    }

    retrieveData() {
        const leagueId = RcdHistoryRouter.getParameters().leagueId;
        return RestService.fetch('league-data', {leagueId: leagueId});
    }
}