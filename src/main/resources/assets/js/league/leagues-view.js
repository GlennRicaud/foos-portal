class FoosLeaguesView extends RcdDivElement {
    constructor() {
        super();
        this.query = `{
            leagues(first:-1){
                id,
                name,
                imageUrl
                games(first:1 , finished:true) {
                    time
                }
            }
        }`;
    }

    init() {
        return super.init()
            .addChild(this.tmp)
            .registerRoute();
    }

    registerRoute() {
        RcdHistoryRouter.setDefaultRoute(() => {
            this.refresh().then(() => {
                FoosMain.clear().addChild(this); 
            });
        });
        return this;
    }

    refresh() {
        this.clear();
        return this.retrieveLeagues().then(leagues => {
            leagues.sort(this.compareLeagues)
                .map(league => {
                     return new RcdTextElement(league.name).init();
                })
                .forEach(leagueResult => this.addChild(leagueResult));
        });
    }

    retrieveLeagues() {
        return GraphQlService.fetch(this.query)
            .then(data => data.leagues);
    }

    compareLeagues(league1, league2) {
        if (league1.games.length === 0) {
            if (league2.games.length === 0) {
                return 0;
            } else {
                return 1;
            }
        }
        if (league2.games.length === 0) {
            return -1;
        }
        return league2.games[0].time.localeCompare(league1.games[0].time);
    }
}