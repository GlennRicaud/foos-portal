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
            ranking.map((rankingItem, index) => new FoosPlayerRankingItem(rankingItem, index + 1).init())
                .forEach(leagueResult => this.addChild(leagueResult));
        });
    }

    retrievePlayerRanking() {
        const leagueId = RcdHistoryRouter.getParameters().leagueId;
        return RestService.fetch('player-ranking', {leagueId: leagueId});
    }
}