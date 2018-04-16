class FoosApplication extends RcdObject {
    constructor() {
        super();
        this.header = new FoosHeader().init();
        this.main = FoosMain.getInstance();
    }

    init() {
        return super.init()
            .createViews();
    }

    createViews() {
        new FoosLeaguesView().init();
        new FoosLeagueView().init();
        new FoosPlayerProfileView().init();
        return this;
    }

    start() {
        this.header.setParent(document.body);
        this.main.setParent(document.body);

        RcdHistoryRouter.refresh();
    }
}