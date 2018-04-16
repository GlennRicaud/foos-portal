class FoosPlayerProfileView extends RcdDivElement {
    constructor() {
        super();
    }

    init() {
        return super.init()
            .addClass('foos-player-profile-view')
            .registerRoute();
    }

    registerRoute() {
        RcdHistoryRouter.addRoute('player', () => {
            this.refresh().then(() => {
                FoosMain.clear().addChild(this);
            });
        });
        return this;
    }

    refresh() {
        this.clear();
        return this.retrieveData().then(data => {
            this.addChild(new FoosPlayerProfileColumn(data).init());
        });
    }

    retrieveData() {
        let params = RcdHistoryRouter.getParameters();
        const playerId = params.playerId;
        const leagueId = params.leagueId;
        return RestService.fetch('player-profile', {playerId: playerId, leagueId: leagueId});
    }
}