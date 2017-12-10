class FoosLeagueView extends RcdDivElement {
    constructor() {
        super();
    }

    init() {
        return super.init()
            .addClass('foos-leagues-view')
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
        return this.retrievePlayerRanking().then(ranking => {
            const division1Panel = new FoosRankingPanel('Players - Division 1', ranking, 'Player').init();
            this.addChild(division1Panel);
        });
    }

    retrievePlayerRanking() {
        const leagueId = RcdHistoryRouter.getParameters().leagueId;
        return RestService.fetch('player-ranking', {leagueId: leagueId});
    }
}