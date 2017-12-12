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
            const division1Panel = new FoosRankingPanel('Players - Division 1', data.playersData, 'Player').init();
            this.addChild(division1Panel);
            
            this.addChild(new FoosRankingChart(data.playersData).init());
        });
    }

    retrieveData() {
        const leagueId = RcdHistoryRouter.getParameters().leagueId;
        return RestService.fetch('league-data', {leagueId: leagueId});
    }
}